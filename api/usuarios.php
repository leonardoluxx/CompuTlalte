<?php
// usuarios.php — Gestión de cuentas, exclusiva del administrador.
// GET                → lista completa de cuentas.
// POST accion=rol    → cambia el rol de una cuenta.
// POST accion=eliminar → elimina una cuenta.
// Reglas de protección (también validadas aquí, en el servidor):
//  · Nadie puede cambiar su propio rol ni eliminarse a sí mismo.
//  · Siempre debe quedar al menos un administrador.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

$usuario = exigir_rol(["admin"]);
$bd = obtenerConexion();
$metodo_http = $_SERVER["REQUEST_METHOD"];

// ---------------------------------------------------------------- lectura
if ($metodo_http === "GET") {
    cabeceras_json();

    $resultado = $bd->query(
        "SELECT id, nombre, email, rol, direccion, telefono, rfc, creado
         FROM usuarios ORDER BY id"
    );
    $usuarios = [];
    while ($fila = $resultado->fetch_assoc()) {
        $usuarios[] = [
            "id" => (int) $fila["id"],
            "nombre" => (string) $fila["nombre"],
            "email" => (string) $fila["email"],
            "rol" => (string) $fila["rol"],
            "direccion" => (string) ($fila["direccion"] ?? ""),
            "telefono" => (string) ($fila["telefono"] ?? ""),
            "rfc" => (string) ($fila["rfc"] ?? ""),
            "creado" => (string) $fila["creado"]
        ];
    }

    echo json_encode(["ok" => true, "usuarios" => $usuarios], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($metodo_http !== "POST") {
    responder_error("Método no permitido.", 405);
}

$cuerpo = leer_cuerpo();
$accion = (string) ($cuerpo["accion"] ?? "");
$id_objetivo = (int) ($cuerpo["id"] ?? 0);
$id_actual = (int) $usuario["id"];

if ($id_objetivo <= 0) {
    responder_error("Falta identificar la cuenta.");
}

$consulta = $bd->prepare("SELECT id, nombre, email, rol FROM usuarios WHERE id = ? LIMIT 1");
$consulta->bind_param("i", $id_objetivo);
$consulta->execute();
$objetivo = $consulta->get_result()->fetch_assoc();
$consulta->close();

if (!$objetivo) {
    responder_error("Esa cuenta no existe.", 404);
}

// ------------------------------------------------- protección: uno mismo
if ($id_objetivo === $id_actual) {
    responder_error("No puedes modificar tu propia cuenta desde aquí.");
}

// ------------------------------------------------- protección: último admin
function quedan_otros_admins(mysqli $bd, int $id_excluido): bool
{
    $consulta = $bd->prepare(
        "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin' AND id <> ?"
    );
    $consulta->bind_param("i", $id_excluido);
    $consulta->execute();
    $total = (int) $consulta->get_result()->fetch_assoc()["total"];
    $consulta->close();

    return $total > 0;
}

switch ($accion) {
    case "rol":
        $nuevo_rol = (string) ($cuerpo["rol"] ?? "");
        if (!in_array($nuevo_rol, ["admin", "gerente", "cliente"], true)) {
            responder_error("Ese rol no existe.");
        }

        if ($objetivo["rol"] === "admin" && $nuevo_rol !== "admin" && !quedan_otros_admins($bd, $id_objetivo)) {
            responder_error("Debe existir siempre al menos un administrador.");
        }

        $actualizar = $bd->prepare("UPDATE usuarios SET rol = ? WHERE id = ?");
        $actualizar->bind_param("si", $nuevo_rol, $id_objetivo);
        $actualizar->execute();
        $actualizar->close();

        registrar_bitacora(
            $bd,
            $usuario["nombre"],
            "admin",
            "usuarios",
            "{$objetivo["nombre"]}: rol ahora es $nuevo_rol"
        );
        responder_ok(["rol" => $nuevo_rol]);

    case "eliminar":
        if ($objetivo["rol"] === "admin" && !quedan_otros_admins($bd, $id_objetivo)) {
            responder_error("Debe existir siempre al menos un administrador.");
        }

        $eliminar = $bd->prepare("DELETE FROM usuarios WHERE id = ?");
        $eliminar->bind_param("i", $id_objetivo);
        $eliminar->execute();
        $eliminar->close();

        registrar_bitacora(
            $bd,
            $usuario["nombre"],
            "admin",
            "usuarios",
            "{$objetivo["nombre"]} ({$objetivo["email"]}): cuenta eliminada"
        );
        responder_ok();

    default:
        responder_error("Acción no reconocida.");
}
