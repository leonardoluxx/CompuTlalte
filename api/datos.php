<?php
// datos.php — El mismo paquete de datos que bootstrap.php, pero en JSON.
// El frontend lo usa para refrescar la información sin recargar la página
// (por ejemplo, después de que el panel guarda un cambio).

declare(strict_types=1);

require __DIR__ . "/_bd.php";
require __DIR__ . "/_datos.php";

cabeceras_json();
header("Cache-Control: no-store");

$datos = datos_para_frontend(obtenerConexion());
echo json_encode(array_merge(["ok" => true], $datos), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
