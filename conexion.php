<?php
// conexion.php — Conexión a la base de datos de Computlalte (XAMPP local).
// Credenciales por defecto de XAMPP: usuario root, sin contraseña.
// Cuando el proyecto migre a un servidor real, solo se cambian estas
// cuatro constantes; el resto del código no se toca.

declare(strict_types=1);

// Lo primero es saber con qué PHP estamos: _compat.php detecta la versión y
// corta con un mensaje claro si es demasiado antigua (antes de tocar MySQL).
require_once __DIR__ . "/api/_compat.php";
exigir_php_compatible();

const DB_HOST   = "localhost";
const DB_USUARIO = "root";
const DB_CLAVE   = "";
const DB_NOMBRE  = "computlalte_db";

// Los errores de MySQL se lanzan como excepciones: nada silencioso.
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

/**
 * Devuelve una conexión mysqli lista para usar (una sola por petición).
 * El juego de caracteres utf8mb4 evita problemas con acentos y eñes.
 */
function obtenerConexion(): mysqli
{
    static $conexion = null;

    if ($conexion instanceof mysqli) {
        return $conexion;
    }

    $conexion = new mysqli(DB_HOST, DB_USUARIO, DB_CLAVE, DB_NOMBRE);
    $conexion->set_charset("utf8mb4");

    return $conexion;
}
