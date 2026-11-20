<?php
// conexion.php — Conexión a la base de datos de Computlalte (XAMPP local).
// Credenciales por defecto de XAMPP: usuario root, sin contraseña.
// Cuando el proyecto migre a un servidor real, solo se cambian estas
// constantes; el resto del código no se toca.
//
// IMPORTANTE: este archivo NUNCA debe terminar con un "Fatal error:
// Unknown database". Si la base todavía no existe (primera instalación) o
// MySQL está apagado, se lanza una excepción controlada
// (BaseDatosNoDisponible) que el instalador y la API saben mostrar como un
// mensaje amigable.

declare(strict_types=1);

// Lo primero es saber con qué PHP estamos: _compat.php detecta la versión y
// corta con un mensaje claro si es demasiado antigua (antes de tocar MySQL).
require_once __DIR__ . "/api/_compat.php";
exigir_php_compatible();

const DB_HOST     = "localhost";
const DB_USUARIO  = "root";
const DB_CLAVE    = "";
const DB_NOMBRE   = "computlalte_db";
const DB_CHARSET  = "utf8mb4";
const DB_COLACION = "utf8mb4_unicode_ci";

// Los errores de MySQL se lanzan como excepciones: nada silencioso.
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

/**
 * Error controlado cuando la base aún no está instalada o MySQL no responde.
 * No es un error fatal: las páginas pueden capturarlo y mostrar una ayuda.
 */
if (!class_exists("BaseDatosNoDisponible", false)) {
    class BaseDatosNoDisponible extends RuntimeException
    {
    }
}

/**
 * Conecta al servidor MySQL SIN seleccionar una base de datos.
 * Se usa durante la primera instalación: en ese momento la base todavía no
 * existe y conectar directamente a DB_NOMBRE provocaría el error
 * "Unknown database" antes de que el instalador pueda crearla.
 */
function obtenerConexionServidor(): mysqli
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $conexion = new mysqli(DB_HOST, DB_USUARIO, DB_CLAVE);
    $conexion->set_charset(DB_CHARSET);

    return $conexion;
}

/**
 * Comprueba si la base de datos del proyecto ya existe.
 * Si se recibe una conexión al servidor, se reutiliza (no abre otra).
 * Nunca lanza excepciones: devuelve false ante cualquier problema.
 */
function base_de_datos_existe($servidor = null): bool
{
    $propia = false;

    try {
        if (!($servidor instanceof mysqli)) {
            $servidor = obtenerConexionServidor();
            $propia = true;
        }

        $consulta = $servidor->prepare(
            "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ? LIMIT 1"
        );
        $nombre = DB_NOMBRE;
        $consulta->bind_param("s", $nombre);
        $consulta->execute();
        $resultado = $consulta->get_result();
        $existe = $resultado instanceof mysqli_result && $resultado->num_rows > 0;
        $consulta->close();

        return $existe;
    } catch (Throwable $e) {
        return false;
    } finally {
        if ($propia && $servidor instanceof mysqli) {
            $servidor->close();
        }
    }
}

/**
 * Devuelve true solo si la base existe y se puede seleccionar.
 * Es la comprobación segura que usan los archivos que deben cargar incluso
 * antes de instalar (por ejemplo api/_bd.php y el propio instalador).
 */
function base_de_datos_lista(): bool
{
    try {
        obtenerConexion();
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

/**
 * Devuelve una conexión mysqli lista para usar (una sola por petición).
 * El juego de caracteres utf8mb4 evita problemas con acentos y eñes.
 *
 * Si la base no existe o MySQL está apagado se lanza BaseDatosNoDisponible
 * con un mensaje que explica qué hacer; nunca se deja un error fatal crudo.
 */
function obtenerConexion(): mysqli
{
    static $conexion = null;

    if ($conexion instanceof mysqli) {
        return $conexion;
    }

    try {
        $servidor = obtenerConexionServidor();
    } catch (Throwable $e) {
        throw new BaseDatosNoDisponible(
            "No se pudo conectar con MySQL en " . DB_HOST . ". "
            . "Abre el Panel de XAMPP, enciende MySQL y recarga la página. "
            . "Detalle: " . $e->getMessage()
        );
    }

    try {
        $servidor->select_db(DB_NOMBRE);
    } catch (Throwable $e) {
        $servidor->close();
        throw new BaseDatosNoDisponible(
            "La base de datos \"" . DB_NOMBRE . "\" todavía no existe. "
            . "Abre instalacion/instalador.php en el navegador para crearla "
            . "e importar las tablas automáticamente."
        );
    }

    $servidor->set_charset(DB_CHARSET);
    $conexion = $servidor;

    return $conexion;
}

// --------------------------------------------------------------- red de seguridad
// Si alguna página llama a obtenerConexion() sin capturar el error, se muestra
// un mensaje amigable (HTML o JSON según el contexto) en lugar del temido
// "Fatal error: Uncaught mysqli_sql_exception: Unknown database".
$conexion_manejador_previo = set_exception_handler(
    function (Throwable $e) use (&$conexion_manejador_previo): void {
        if (!($e instanceof BaseDatosNoDisponible)) {
            // Cualquier otro error conserva el comportamiento anterior.
            if (is_callable($conexion_manejador_previo)) {
                $conexion_manejador_previo($e);
                return;
            }
            http_response_code(500);
            header("Content-Type: text/plain; charset=utf-8");
            echo "Error interno: " . $e->getMessage();
            return;
        }

        $es_api = strpos($_SERVER["REQUEST_URI"] ?? "", "/api/") !== false
            || strpos($_SERVER["HTTP_ACCEPT"] ?? "", "application/json") !== false;

        http_response_code(503);

        if ($es_api) {
            header("Content-Type: application/json; charset=utf-8");
            echo json_encode(
                ["ok" => false, "mensaje" => $e->getMessage()],
                JSON_UNESCAPED_UNICODE
            );
            return;
        }

        header("Content-Type: text/html; charset=utf-8");
        $mensaje = htmlspecialchars($e->getMessage(), ENT_QUOTES, "UTF-8");

        // Enlace RELATIVO al instalador: se calcula desde la URL real de la
        // petición. Antes estaba escrito a mano como /computlalte/... y por
        // eso se rompía cuando la carpeta se llamaba distinto en otra
        // computadora (por ejemplo htdocs/computlaltenango).
        $script = str_replace("\\", "/", (string) ($_SERVER["SCRIPT_NAME"] ?? "/"));
        $carpeta = rtrim(str_replace("\\", "/", dirname($script)), "/");
        foreach (["/api", "/instalacion"] as $subcarpeta) {
            if (substr($carpeta, -strlen($subcarpeta)) === $subcarpeta) {
                $carpeta = substr($carpeta, 0, -strlen($subcarpeta));
            }
        }
        $enlace_instalador = rtrim($carpeta, "/") . "/instalacion/instalador.php";
        if ($enlace_instalador === "") {
            $enlace_instalador = "instalacion/instalador.php";
        }

        echo '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<title>Base de datos pendiente | Computlalte</title>'
            . '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;'
            . 'background:#1c1c1c;color:#f5f5f5;font-family:"Segoe UI",system-ui,sans-serif;padding:24px}'
            . '.t{max-width:560px;padding:32px;background:#141414;border:1px solid #2b2b2b;'
            . 'border-radius:16px}h1{margin:0 0 12px;font-size:24px}p{line-height:1.7;color:#c9c9c9}'
            . 'a{display:inline-block;margin-top:16px;padding:13px 20px;background:#ff0033;'
            . 'color:#fff;text-decoration:none;border-radius:8px;font-weight:700}'
            . 'code{background:#0d0d0d;padding:2px 6px;border-radius:4px}</style></head><body>'
            . '<main class="t"><h1>La tienda aún no está instalada</h1>'
            . '<p>' . $mensaje . '</p>'
            . '<a href="' . htmlspecialchars($enlace_instalador, ENT_QUOTES, "UTF-8") . '">Abrir el instalador</a>'
            . '<p style="font-size:13px;color:#8a8a8a">Si el proyecto está en otra carpeta, '
            . 'entra a <code>instalacion/instalador.php</code> desde tu navegador.</p>'
            . '</main></body></html>';
    }
);
