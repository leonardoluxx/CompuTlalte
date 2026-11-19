<?php
// productos-lista.php - Devuelve SOLO el catálogo de productos (JSON).
// Se usa para carga asíncrona tras la carga inicial de bootstrap.php.

declare(strict_types=1);

require __DIR__ . "/_bd.php";
require __DIR__ . "/_datos.php";

$bd = obtenerConexion();
$margen = margen_global($bd);
$usuario = usuario_de_sesion();
$rol = $usuario["rol"] ?? null;

$productos = filtrar_costos(obtener_productos($bd, $margen), $rol);

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: public, max-age=60"); // 1 min de caché navegador

echo json_encode([
    "ok" => true,
    "productos" => $productos
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);