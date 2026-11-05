<?php
// bitacora.php — Limpieza de la bitácora de movimientos.
// POST { accion: "limpiar" } → borra TODOS los registros (solo admin).
// La lectura vive en api/datos.php (viaja con el paquete de datos).

declare(strict_types=1);

require __DIR__ . "/_bd.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder_error("Método no permitido.", 405);
}

$usuario = exigir_rol(["admin"]);

$cuerpo = leer_cuerpo();
if (($cuerpo["accion"] ?? "") !== "limpiar") {
    responder_error("Acción no reconocida.");
}

$bd = obtenerConexion();
$eliminados = (int) $bd->query("SELECT COUNT(*) AS t FROM bitacora")->fetch_assoc()["t"];

// Se truncó la tabla: la bitácora arranca limpia desde cero.
$bd->query("TRUNCATE TABLE bitacora");

registrar_bitacora(
    $bd,
    $usuario["nombre"],
    "admin",
    "bitacora",
    "Bitácora limpiada ($eliminados registros eliminados)"
);

responder_ok(["eliminados" => $eliminados]);
