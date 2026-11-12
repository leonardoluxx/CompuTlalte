<?php
// requisitos.php — Diagnóstico de compatibilidad del servidor.
// -----------------------------------------------------------------
// Se puede abrir directamente en el navegador:
//   http://localhost/computlalte/instalacion/requisitos.php
//
// Está escrito a propósito con sintaxis muy antigua (PHP 5.2: sin tipos, sin
// arrays cortos, sin "??"), para que incluso en un servidor demasiado viejo
// esta página cargue y explique qué falta. El resto del proyecto no carga en
// versiones tan antiguas; esta sí, y por eso sirve de brújula.

$php_version = PHP_VERSION;
$php_id = defined("PHP_VERSION_ID") ? PHP_VERSION_ID : 0;
$php_ok = $php_id >= 70100;

// Credenciales: se leen de conexion.php para no duplicarlas.
$host = "localhost";
$usuario = "root";
$clave = "";
$base = "computlalte_db";

$ruta_conexion = dirname(dirname(__FILE__)) . "/conexion.php";
$texto_conexion = @file_get_contents($ruta_conexion);

if ($texto_conexion) {
    $patrones = array(
        "host" => '/const\s+DB_HOST\s*=\s*"([^"]*)"/',
        "usuario" => '/const\s+DB_USUARIO\s*=\s*"([^"]*)"/',
        "clave" => '/const\s+DB_CLAVE\s*=\s*"([^"]*)"/',
        "base" => '/const\s+DB_NOMBRE\s*=\s*"([^"]*)"/'
    );

    foreach ($patrones as $nombre => $patron) {
        if (preg_match($patron, $texto_conexion, $coincidencia)) {
            ${$nombre} = $coincidencia[1];
        }
    }
}

$filas = array();

function fila(&$filas, $titulo, $estado, $detalle)
{
    $filas[] = array("titulo" => $titulo, "estado" => $estado, "detalle" => $detalle);
}

// 1) Versión de PHP
if ($php_ok) {
    fila($filas, "PHP", "ok", $php_version . " — compatible (se admite 7.1 o superior)");
} else {
    fila($filas, "PHP", "mal", $php_version . " — demasiado antiguo, se necesita 7.1 o superior");
}

// 2) Extensiones necesarias
$extensiones = array(
    "mysqli" => "Conexión con MySQL/MariaDB",
    "json" => "Respuestas de la API",
    "fileinfo" => "Validar imágenes subidas"
);

foreach ($extensiones as $extension => $para_que) {
    if (extension_loaded($extension)) {
        fila($filas, "Extensión " . $extension, "ok", $para_que);
    } else {
        fila($filas, "Extensión " . $extension, "mal", "Falta. Actívala en php.ini para " . $para_que . ".");
    }
}

// 3) Conexión y versión del motor
$conexion = false;
$version_motor = "";

if ($php_ok && extension_loaded("mysqli")) {
    $anterior = mysqli_report(MYSQLI_REPORT_OFF);
    $conexion = @mysqli_connect($host, $usuario, $clave);
    mysqli_report($anterior);

    if ($conexion) {
        $version_motor = mysqli_get_server_info($conexion);
        fila($filas, "MySQL / MariaDB", "ok", "Conectado a " . $host . " — versión " . $version_motor);

        // 4) utf8mb4 (acentos y emojis sin romper nada)
        $charset = @mysqli_query($conexion, "SHOW CHARACTER SET LIKE 'utf8mb4'");
        if ($charset && mysqli_num_rows($charset) > 0) {
            fila($filas, "Juego de caracteres utf8mb4", "ok", "Disponible para acentos y símbolos");
        } else {
            fila($filas, "Juego de caracteres utf8mb4", "aviso", "No aparece; actualiza el motor a MySQL 5.5.3+ o MariaDB 5.5+");
        }

        // 5) ¿Ya está instalada la tienda?
        if (@mysqli_select_db($conexion, $base)) {
            $tabla = @mysqli_query($conexion, "SHOW TABLES LIKE 'productos'");
            if ($tabla && mysqli_num_rows($tabla) > 0) {
                $conteo = @mysqli_query($conexion, "SELECT COUNT(*) AS t FROM productos");
                $total = 0;
                if ($conteo) {
                    $dato = mysqli_fetch_assoc($conteo);
                    $total = (int) $dato["t"];
                }
                fila($filas, "Base \"" . $base . "\"", "ok", "Instalada con " . $total . " productos");
            } else {
                fila($filas, "Base \"" . $base . "\"", "aviso", "Existe pero está vacía: abre instalador.php para instalar");
            }
        } else {
            fila($filas, "Base \"" . $base . "\"", "aviso", "Todavía no existe: abre instalador.php para crearla");
        }
    } else {
        fila($filas, "MySQL / MariaDB", "mal", "No se pudo conectar a " . $host . ". ¿Está encendido en el Panel de XAMPP?");
    }
}

$todo_ok = true;
foreach ($filas as $fila_actual) {
    if ($fila_actual["estado"] === "mal") {
        $todo_ok = false;
    }
}
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Requisitos | Computlalte</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh; display: grid; place-items: center;
            padding: 24px; background: #1c1c1c; color: #f5f5f5;
            font-family: "Segoe UI", system-ui, sans-serif;
        }
        .tarjeta {
            width: 640px; max-width: 100%; padding: 32px; background: #141414;
            border: 1px solid rgba(255,255,255,.09); border-radius: 16px;
            box-shadow: 0 24px 64px rgba(0,0,0,.55);
        }
        .marca { font-weight: 800; font-size: 20px; letter-spacing: .5px; }
        .marca b { color: #ff0033; }
        h1 { margin: 8px 0 4px; font-size: 24px; }
        p.sub { margin: 0 0 20px; color: #a3a3a3; font-size: 14px; line-height: 1.6; }
        ul { margin: 0; padding: 0; list-style: none; font-size: 14px; line-height: 1.5; }
        li { padding: 11px 13px; margin-bottom: 8px; background: #0d0d0d;
            border: 1px solid #2b2b2b; border-left-width: 3px; border-radius: 8px; }
        li.ok { border-left-color: #70d6a2; }
        li.aviso { border-left-color: #ffb020; }
        li.mal { border-left-color: #ff0033; }
        li strong { display: block; margin-bottom: 2px; }
        li span { color: #a3a3a3; }
        .resumen { margin: 18px 0 0; padding: 13px 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; }
        .resumen.bien { background: rgba(112,214,162,.08); border: 1px solid rgba(112,214,162,.35); color: #9be8c0; }
        .resumen.regular { background: rgba(255,176,32,.08); border: 1px solid rgba(255,176,32,.35); color: #ffd27a; }
        .enlaces { display: grid; gap: 10px; margin-top: 20px; }
        .enlaces a { display: block; padding: 12px; text-align: center; background: #1f1f1f;
            border: 1px solid #333; border-radius: 8px; color: #f5f5f5; text-decoration: none; font-weight: 600; }
        .enlaces a:hover { border-color: #ff0033; color: #fff; }
        .nota { margin-top: 18px; color: #8a8a8a; font-size: 12.5px; line-height: 1.6; }
        code { background: #0d0d0d; border: 1px solid #333; border-radius: 4px; padding: 2px 6px; font-size: 12.5px; }
    </style>
</head>
<body>
    <main class="tarjeta">
        <p class="marca">COMPU<b>TLALTE</b></p>
        <h1>Compatibilidad del servidor</h1>
        <p class="sub">
            Esta página comprueba si la computadora puede ejecutar la tienda: versión de PHP,
            extensiones y conexión con la base de datos.
        </p>

        <ul>
            <?php foreach ($filas as $fila_actual): ?>
                <li class="<?php echo $fila_actual["estado"]; ?>">
                    <strong><?php echo htmlspecialchars($fila_actual["titulo"], ENT_QUOTES, "UTF-8"); ?></strong>
                    <span><?php echo htmlspecialchars($fila_actual["detalle"], ENT_QUOTES, "UTF-8"); ?></span>
                </li>
            <?php endforeach; ?>
        </ul>

        <p class="resumen <?php echo $todo_ok ? "bien" : "regular"; ?>">
            <?php if ($todo_ok): ?>
                Todo listo: esta computadora puede ejecutar Computlalte.
            <?php else: ?>
                Hay algo pendiente (marcado en rojo). Corrígelo y recarga esta página.
            <?php endif; ?>
        </p>

        <div class="enlaces">
            <a href="instalador.php">Abrir el instalador</a>
            <a href="../prueba-conexion.php">Probar la conexión a la base</a>
        </div>

        <p class="nota">
            Si el proyecto no abre y esta página sí, casi siempre es la versión de PHP:
            se necesita <code>7.1</code> o superior. XAMPP trae versiones nuevas en
            <code>apachefriends.org</code>.
        </p>
    </main>
</body>
</html>
