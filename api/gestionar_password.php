<?php
// gestionar_password.php — Bandeja del administrador para las solicitudes
// de recuperación de contraseña.
// GET  → { solicitudes: [...], pendientes: n }
// POST { id, accion: "aprobar" | "rechazar" | "eliminar" }
//   aprobar  → genera una contraseña temporal, la hashea, marca la cuenta
//              para cambio obligatorio y devuelve la clave UNA sola vez.
//   rechazar → marca la solicitud como rechazada.
//   eliminar → borra la solicitud del registro.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

$usuario = exigir_rol(["admin"]);
$bd = obtenerConexion();

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    cabeceras_json();
    header("Cache-Control: no-store");

    $lista = [];
    // La vigencia se recalcula contra usuarios: si la cuenta se borró
    // después de la solicitud, el panel también la marca en rojo.
    $resultado = $bd->query(
        "SELECT s.*, (u.id IS NOT NULL) AS existe_usuario
         FROM solicitudes_password s
         LEFT JOIN usuarios u ON u.email = s.email
         ORDER BY (s.estado = 'pendiente') DESC, s.id DESC"
    );

    $pendientes = 0;
    while ($fila = $resultado->fetch_assoc()) {
        if ($fila["estado"] === "pendiente") {
            $pendientes += 1;
        }

        $lista[] = [
            "id" => (int) $fila["id"],
            "email" => (string) $fila["email"],
            "razon" => (string) $fila["razon"],
            "estado" => (string) $fila["estado"],
            "correoRegistrado" => (int) $fila["existe_usuario"] === 1,
            "nota" => (string) ($fila["nota"] ?? ""),
            "fecha" => (string) $fila["fecha_solicitud"],
            "fechaResolucion" => (string) ($fila["fecha_resolucion"] ?? ""),
            "resueltoPor" => (string) ($fila["resuelto_por"] ?? "")
        ];
    }

    echo json_encode([
        "ok" => true,
        "solicitudes" => $lista,
        "pendientes" => $pendientes
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder_error("Método no permitido.", 405);
}

$cuerpo = leer_cuerpo();
csrf_exigir();
rate_limit("gestionar_password", 30, 60);

$id = (int) ($cuerpo["id"] ?? 0);
$accion = (string) ($cuerpo["accion"] ?? "");

if ($id <= 0 || !in_array($accion, ["aprobar", "rechazar", "eliminar"], true)) {
    responder_error("Solicitud o acción no válida.");
}

$consulta = $bd->prepare("SELECT * FROM solicitudes_password WHERE id = ? LIMIT 1");
$consulta->bind_param("i", $id);
$consulta->execute();
$solicitud = $consulta->get_result()->fetch_assoc();
$consulta->close();

if (!$solicitud) {
    responder_error("Esa solicitud ya no existe.", 404);
}

if ($accion === "eliminar") {
    $borrar = $bd->prepare("DELETE FROM solicitudes_password WHERE id = ?");
    $borrar->bind_param("i", $id);
    $borrar->execute();
    $borrar->close();

    registrar_bitacora(
        $bd,
        $usuario["nombre"],
        "admin",
        "seguridad",
        "Solicitud de contraseña eliminada: " . $solicitud["email"]
    );

    responder_ok(["mensaje" => "Solicitud eliminada."]);
}

if ($solicitud["estado"] !== "pendiente") {
    responder_error("Esa solicitud ya fue resuelta.");
}

if ($accion === "rechazar") {
    $actualizar = $bd->prepare(
        "UPDATE solicitudes_password
         SET estado = 'rechazada', fecha_resolucion = NOW(), resuelto_por = ?
         WHERE id = ?"
    );
    $actualizar->bind_param("si", $usuario["nombre"], $id);
    $actualizar->execute();
    $actualizar->close();

    registrar_bitacora(
        $bd,
        $usuario["nombre"],
        "admin",
        "seguridad",
        "Recuperación de contraseña rechazada: " . $solicitud["email"]
    );

    responder_ok(["estado" => "rechazada", "mensaje" => "Solicitud rechazada."]);
}

// ------------------------------------------------------------- aprobar
$email = (string) $solicitud["email"];
$consulta = $bd->prepare("SELECT id, nombre FROM usuarios WHERE email = ? LIMIT 1");
$consulta->bind_param("s", $email);
$consulta->execute();
$cuenta = $consulta->get_result()->fetch_assoc();
$consulta->close();

if (!$cuenta) {
    responder_error("Ese correo no está registrado. Rechaza o elimina la solicitud.", 409);
}

$clave_temporal = generar_clave_temporal();
$hash = password_hash($clave_temporal, PASSWORD_DEFAULT);

$bd->begin_transaction();
try {
    $actualizar = $bd->prepare(
        "UPDATE usuarios SET password = ?, debe_cambiar_clave = 1 WHERE id = ?"
    );
    $id_cuenta = (int) $cuenta["id"];
    $actualizar->bind_param("si", $hash, $id_cuenta);
    $actualizar->execute();
    $actualizar->close();

    $actualizar = $bd->prepare(
        "UPDATE solicitudes_password
         SET estado = 'aprobada', fecha_resolucion = NOW(), resuelto_por = ?
         WHERE id = ?"
    );
    $actualizar->bind_param("si", $usuario["nombre"], $id);
    $actualizar->execute();
    $actualizar->close();

    $bd->commit();
} catch (Throwable $error) {
    $bd->rollback();
    responder_error("No se pudo aprobar la solicitud. Intenta de nuevo.", 500);
}

registrar_bitacora(
    $bd,
    $usuario["nombre"],
    "admin",
    "seguridad",
    "Contraseña temporal generada para " . $email
);

responder_ok([
    "estado" => "aprobada",
    "email" => $email,
    "nombre" => (string) $cuenta["nombre"],
    // Esta clave se muestra UNA vez: en la base solo queda el hash.
    "claveTemporal" => $clave_temporal,
    "mensaje" => "Solicitud aprobada. Comparte la contraseña temporal con la persona."
]);
