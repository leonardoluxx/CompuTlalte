<?php
// panel-datos.php — Datos de gestión del panel (usuarios, solicitudes,
// bitácora y reseñas), SIN productos.
//
// bootstrap.php solo entrega sesión, configuración y permisos. Todo lo que
// únicamente usa el panel se pide aquí, de forma asíncrona, cuando el panel
// está abierto. Así las páginas de la tienda no cargan cientos de KB que
// nunca muestran.

declare(strict_types=1);

require __DIR__ . "/_bd.php";
require __DIR__ . "/_datos.php";

exigir_rol(["admin", "gerente"]);

cabeceras_json();
header("Cache-Control: no-store");

$datos = datos_gestion(obtenerConexion());

echo json_encode(
    array_merge(["ok" => true], $datos),
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
