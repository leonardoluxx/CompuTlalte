<?php
// solicitudes.php — Aprobación de cambios propuestos por el gerente.
// POST { id, accion: "aprobar" | "rechazar" }
// El administrador tiene la última palabra: aprobar aplica los cambios
// al producto; rechazar solo marca la solicitud como rechazada.

declare(strict_types=1);

require __DIR__ . "/_bd.php";
require __DIR__ . "/_datos.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder_error("Método no permitido.", 405);
}

$usuario = exigir_rol(["admin"]);
$bd = obtenerConexion();

$cuerpo = leer_cuerpo();
$id = (int) ($cuerpo["id"] ?? 0);
$accion = (string) ($cuerpo["accion"] ?? "");

if ($id <= 0 || !in_array($accion, ["aprobar", "rechazar"], true)) {
    responder_error("Solicitud o acción no válida.");
}

$consulta = $bd->prepare(
    "SELECT s.*, u.nombre AS autor FROM solicitudes s
     LEFT JOIN usuarios u ON u.id = s.usuario_id
     WHERE s.id = ? LIMIT 1"
);
$consulta->bind_param("i", $id);
$consulta->execute();
$solicitud = $consulta->get_result()->fetch_assoc();
$consulta->close();

if (!$solicitud) {
    responder_error("Esa solicitud ya no existe.", 404);
}
if ($solicitud["estado"] !== "pendiente") {
    responder_error("Esa solicitud ya fue resuelta.");
}

if ($accion === "aprobar") {
    // Los cambios guardados vienen como {campo: {antes, despues}};
    // se aplica el valor "despues" de cada campo con el mapper estándar.
    $paquete = json_decode((string) $solicitud["cambios"], true);
    $cambios = [];
    foreach (($paquete["diff"] ?? []) as $campo => $valores) {
        $cambios[$campo] = $valores["despues"] ?? null;
    }

    $producto_id = (int) ($solicitud["producto_id"] ?? 0);
    $producto = producto_adaptado_por_id($bd, $producto_id);

    if (!$producto) {
        responder_error("El producto de la solicitud ya no existe.", 409);
    }

    aplicar_cambios_producto($bd, $producto_id, $cambios);
    $estado = "aprobada";
    $detalle = "{$solicitud["producto_nombre"]}: {$solicitud["resumen"]} (aprobada)";
} else {
    $estado = "rechazada";
    $detalle = "{$solicitud["producto_nombre"]}: {$solicitud["resumen"]} (rechazada)";
}

$actualizar = $bd->prepare(
    "UPDATE solicitudes SET estado = ?, resuelto_por = ?, fecha_resolucion = NOW() WHERE id = ?"
);
$actualizar->bind_param("ssi", $estado, $usuario["nombre"], $id);
$actualizar->execute();
$actualizar->close();

registrar_bitacora(
    $bd,
    $usuario["nombre"],
    "admin",
    $estado === "aprobada" ? "aprobacion" : "rechazo",
    $detalle . " — propuesta por " . ($solicitud["autor"] ?? "Usuario")
);

responder_ok(["estado" => $estado]);
