<?php
// bootstrap.php - Entrega datos ESENCIALES (sesión, config, permisos) como JavaScript.
// SIN productos (pesan 300KB+). Los productos se cargan aparte vía api/productos-lista.php
// cuando la página los necesite (catálogo, ofertas, etc.).

declare(strict_types=1);

require __DIR__ . "/_bd.php";
require __DIR__ . "/_datos.php";

$datos = datos_para_frontend_ligero(obtenerConexion());
$csrf = csrf_token();

header("Content-Type: text/javascript; charset=utf8");
header("Cache-Control: no-store");

// Inyectar meta CSRF en el documento (ejecuta antes de tienda-datos.js)
echo "(function(){ var m=document.createElement('meta'); m.name='csrf-token'; m.content='$csrf'; document.head.appendChild(m); })();";

echo "window.DatosBD = ";
echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
echo ";";