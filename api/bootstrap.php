<?php
// bootstrap.php — Entrega los datos de MySQL como JavaScript.
// Las páginas lo cargan ANTES de tienda-datos.js: así la interfaz sigue
// siendo síncrona, pero los datos nacen de la base de datos real.
// Salida:  window.DatosBD = { productos, categorias, config, sesion, ... }

declare(strict_types=1);

require __DIR__ . "/_bd.php";
require __DIR__ . "/_datos.php";

$datos = datos_para_frontend(obtenerConexion());

header("Content-Type: text/javascript; charset=utf8");
header("Cache-Control: no-store");

echo "window.DatosBD = ";
echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
echo ";";
