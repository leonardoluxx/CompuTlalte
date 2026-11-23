<?php
// instalador.php — Instalación automática de Computlalte en otra computadora.
// ---------------------------------------------------------------
// Abre esta página en el navegador y pulsa "Instalar ahora": el script
// crea la base de datos, importa todas las tablas con sus datos y
// verifica que todo quedó bien. No hace falta usar phpMyAdmin.
//
// Es idempotente: se puede ejecutar varias veces sin errores de
// "database exists", "table already exists" ni "table was not locked".
//
// Uso:  http://localhost/computlalte/instalacion/instalador.php

declare(strict_types=1);

// El proyecto funciona desde PHP 7.1. Si el servidor trae una versión anterior,
// se dice claro en lugar de fallar a mitad de la pantalla. La comprobación vive
// en api/_compat.php para que valga en todo el sitio.
require_once __DIR__ . "/../api/_compat.php";
exigir_php_compatible();

// Credenciales y sesión: _bd.php carga conexion.php (constantes DB_*) y
// abre la sesión de PHP para comprobar quién está instalando. Desde el
// blindaje de conexion.php, incluir _bd.php ya no falla si la base no existe.
require_once __DIR__ . "/../api/_bd.php";

$accion = $_GET["accion"] ?? "";
$confirmar = isset($_GET["confirmar"]);
$ruta_sql = __DIR__ . "/computlalte_db.sql";

// Mensajes del proceso (se muestran como lista de pasos).
$pasos = [];
$error = null;
$instalacion_completada = false;

function paso(string $texto, bool $ok = true): void
{
    global $pasos;
    $pasos[] = ["texto" => $texto, "ok" => $ok];
}

/**
 * Ejecuta un bloque SQL con multi_query y consume todos sus resultados.
 * Con MYSQLI_REPORT_STRICT cualquier error de MySQL llega como excepción,
 * así el instalador puede mostrarlo en pantalla sin dejar la base a medias.
 */
function ejecutar_sql(mysqli $servidor, string $sql): void
{
    if (trim($sql) === "") {
        return;
    }

    if (!$servidor->multi_query($sql)) {
        throw new RuntimeException("MySQL rechazó el archivo SQL: " . $servidor->error);
    }

    do {
        // Un error en cualquier sentencia posterior a la primera no siempre
        // se convierte en excepción: mysqli lo deja en errno/error. Se revisa
        // en cada paso para no terminar con una importación incompleta.
        if ($servidor->errno !== 0) {
            throw new RuntimeException("Error de MySQL durante la importación: " . $servidor->error);
        }

        $resultado = $servidor->store_result();
        if ($resultado instanceof mysqli_result) {
            $resultado->free();
        }

        if (!$servidor->more_results()) {
            break;
        }
    } while ($servidor->next_result());

    if ($servidor->errno !== 0) {
        throw new RuntimeException("Error de MySQL durante la importación: " . $servidor->error);
    }
}

/**
 * Deja el dump listo para importarlo con mysqli::multi_query.
 *
 * - Quita el DROP DATABASE: la base la administra el instalador (nunca se
 *   borra por accidente al reinstalar; las tablas sí se recrean).
 * - Quita CREATE DATABASE y USE: el instalador ya los ejecutó con el nombre
 *   y el juego de caracteres correctos.
 * - Quita LOCK TABLES / UNLOCK TABLES: con multi_query esos bloqueos hacen
 *   que MySQL rechace los INSERT de tablas relacionadas por clave foránea
 *   ("Table 'productos' was not locked with LOCK TABLES").
 * - Quita DISABLE/ENABLE KEYS: son para MyISAM y aquí todas las tablas son
 *   InnoDB, así que solo estorban.
 */
function preparar_sql(string $sql): string
{
    // BOM UTF-8 que algunos editores agregan al inicio.
    $sql = preg_replace('/^\xEF\xBB\xBF/', '', $sql) ?? $sql;

    // Comentario de "sandbox" que agrega MariaDB al volcar (solo cliente).
    $sql = preg_replace('/^[ \t]*\/\*M![^\r\n]*\*\/[ \t]*\r?\n/mi', '', $sql) ?? $sql;

    // DROP DATABASE del dump: jamás debe ejecutarse desde el instalador.
    $sql = preg_replace('/^[ \t]*\/\*!40000 DROP DATABASE\b[^;]*;[ \t]*\r?\n/mi', '', $sql) ?? $sql;

    // CREATE DATABASE y USE: los controla el instalador (ver más abajo).
    $sql = preg_replace('/^[ \t]*CREATE DATABASE\b[^;]*;[ \t]*\r?\n/mi', '', $sql) ?? $sql;
    $sql = preg_replace('/^[ \t]*USE\s+`?[^;`\r\n]+`?\s*;[ \t]*\r?\n/mi', '', $sql) ?? $sql;

    // Bloqueos de tabla del dump.
    $sql = preg_replace('/^[ \t]*(?:LOCK TABLES|UNLOCK TABLES)\b[^;\r\n]*;[ \t]*\r?\n/mi', '', $sql) ?? $sql;

    // Ajustes de claves para MyISAM.
    $sql = preg_replace(
        '/^[ \t]*\/\*!40000 ALTER TABLE [^;\r\n]*? (?:DISABLE|ENABLE) KEYS \*\/;[ \t]*\r?\n/mi',
        '',
        $sql
    ) ?? $sql;

    return trim($sql) . "\n";
}

// ------------------------------------------------------- conexión base
// Se conecta al servidor SIN seleccionar la base: en una primera instalación
// todavía no existe. Además los errores de mysqli se lanzan como excepciones
// (MYSQLI_REPORT_STRICT), así que la conexión debe ir dentro de try/catch;
// de lo contrario, con MySQL apagado, la página moriría con un error fatal.
$servidor = null;
$fallo_conexion = null;

try {
    $servidor = obtenerConexionServidor();
} catch (Throwable $e) {
    $fallo_conexion = $e->getMessage();
}

// ¿La base de datos ya existe y tiene cuentas?
$base_existe = false;
$productos_actuales = 0;
$usuarios_actuales = 0;

if (!$fallo_conexion) {
    try {
        $base_existe = base_de_datos_existe($servidor);

        if ($base_existe && $servidor->select_db(DB_NOMBRE)) {
            // Una base a medio crear (sin todas sus tablas) no debe romper el
            // instalador: en ese caso se trata como instalación pendiente.
            $tabla_productos = $servidor->query("SHOW TABLES LIKE 'productos'");
            if ($tabla_productos && $tabla_productos->num_rows > 0) {
                $productos_actuales = (int) $servidor->query("SELECT COUNT(*) AS t FROM productos")->fetch_assoc()["t"];
            }
            $tabla_usuarios = $servidor->query("SHOW TABLES LIKE 'usuarios'");
            if ($tabla_usuarios && $tabla_usuarios->num_rows > 0) {
                $usuarios_actuales = (int) $servidor->query("SELECT COUNT(*) AS t FROM usuarios")->fetch_assoc()["t"];
            }
        }
    } catch (Throwable $e) {
        $base_existe = false;
        $productos_actuales = 0;
        $usuarios_actuales = 0;
    }
}

// ------------------------------------------------- protección del instalador
// Con la base vacía (primera instalación) cualquiera puede instalar.
// Con la base ya instalada, SOLO el administrador puede reinstalar:
// así nadie borra la tienda entrando por la URL del instalador.
$instalacion_bloqueada = false;

if (!$fallo_conexion && $usuarios_actuales > 0) {
    try {
        $sesion_actual = usuario_de_sesion();
    } catch (Throwable $e) {
        // Base a medio migrar: se trata como no autenticado en lugar de
        // terminar con un error fatal antes de mostrar el instalador.
        $sesion_actual = null;
    }
    $instalacion_bloqueada = !$sesion_actual || $sesion_actual["rol"] !== "admin";
}

if ($accion === "instalar" && $instalacion_bloqueada) {
    $error = "La tienda ya está instalada. Solo el administrador puede reinstalarla: inicia sesión como admin y vuelve a esta página.";
    $accion = "";
}

// ---------------------------------------------------------- instalación
if ($accion === "instalar" && !$fallo_conexion) {
    try {
        if (!is_file($ruta_sql)) {
            throw new RuntimeException("No encontré el archivo computlalte_db.sql junto a este instalador.");
        }

        // Si la base ya tiene datos se exige confirmación explícita,
        // porque la instalación la reemplaza por completo.
        if ($productos_actuales > 0 && !$confirmar) {
            throw new RuntimeException(
                "La base de datos ya tiene $productos_actuales productos. "
                . "Si quieres reemplazar todo, pulsa \"Reinstalar desde cero\"."
            );
        }

        $sql = file_get_contents($ruta_sql);
        if ($sql === false || trim($sql) === "") {
            throw new RuntimeException("El archivo computlalte_db.sql está vacío o no se pudo leer.");
        }

        paso("Conectado a MySQL en " . DB_HOST . " como " . DB_USUARIO . ".");

        // ---------------------------------------------------- 1) base de datos
        // Se crea (si hace falta) con el juego de caracteres correcto.
        // `CREATE DATABASE IF NOT EXISTS` hace que reinstalar sea seguro.
        $nombre_sql = str_replace("`", "``", DB_NOMBRE);
        $servidor->query(
            "CREATE DATABASE IF NOT EXISTS `" . $nombre_sql . "` "
            . "CHARACTER SET " . DB_CHARSET . " COLLATE " . DB_COLACION
        );
        paso("Base de datos \"" . DB_NOMBRE . "\" creada o verificada (CREATE DATABASE IF NOT EXISTS).");

        // ---------------------------------------------------- 2) seleccionar base
        // Equivale a "USE computlalte_db;". Se usa la API de mysqli porque
        // informa de inmediato si la base no quedó disponible.
        if (!$servidor->select_db(DB_NOMBRE)) {
            throw new RuntimeException("No se pudo seleccionar la base de datos " . DB_NOMBRE . ".");
        }
        $servidor->set_charset(DB_CHARSET);
        paso("Base de datos \"" . DB_NOMBRE . "\" seleccionada (USE).");

        // ---------------------------------------------------- 3) importar tablas
        $sql = preparar_sql($sql);

        // Las claves foráneas se desactivan durante la carga: el dump crea e
        // inserta tabla por tabla en orden alfabético y algunos hijos
        // (detalle_ventas, especificaciones) van antes que su tabla padre.
        $servidor->query("SET FOREIGN_KEY_CHECKS=0");
        $servidor->query("SET UNIQUE_CHECKS=0");

        ejecutar_sql($servidor, $sql);

        $servidor->query("SET FOREIGN_KEY_CHECKS=1");
        $servidor->query("SET UNIQUE_CHECKS=1");

        paso("Tablas y datos importados desde computlalte_db.sql.");

        // ------------------------------------------------------ verificación
        $servidor->select_db(DB_NOMBRE);
        $tablas = (int) $servidor->query(
            "SELECT COUNT(*) AS t FROM information_schema.tables WHERE table_schema = '" . $nombre_sql . "'"
        )->fetch_assoc()["t"];
        $productos = (int) $servidor->query("SELECT COUNT(*) AS t FROM productos")->fetch_assoc()["t"];
        $usuarios = (int) $servidor->query("SELECT COUNT(*) AS t FROM usuarios")->fetch_assoc()["t"];
        $especificaciones = (int) $servidor->query("SELECT COUNT(*) AS t FROM especificaciones")->fetch_assoc()["t"];
        $imagenes = (int) $servidor->query("SELECT COUNT(*) AS t FROM imagenes_producto")->fetch_assoc()["t"];
        $ventas = (int) $servidor->query("SELECT COUNT(*) AS t FROM ventas")->fetch_assoc()["t"];

        // Reseñas de productos y encuestas del sitio: la tienda las muestra
        // siempre desde la base de datos, así que se comprueba que viajaron.
        $resenas_productos = 0;
        $resenas_sitio = 0;
        $consulta_resenas = $servidor->query("SELECT COUNT(*) AS t FROM resenas_productos");
        if ($consulta_resenas) {
            $resenas_productos = (int) $consulta_resenas->fetch_assoc()["t"];
        }
        $consulta_sitio = $servidor->query("SELECT COUNT(*) AS t FROM resenas_sitio");
        if ($consulta_sitio) {
            $resenas_sitio = (int) $consulta_sitio->fetch_assoc()["t"];
        }

        // Solicitudes de recuperación de contraseña (nuevo sistema)
        $solicitudes_password = 0;
        $consulta_sol_pass = $servidor->query("SELECT COUNT(*) AS t FROM solicitudes_password");
        if ($consulta_sol_pass) {
            $solicitudes_password = (int) $consulta_sol_pass->fetch_assoc()["t"];
        }

        paso("Tablas creadas: $tablas.");
        paso("Productos con su precio final: $productos.");
        paso("Especificaciones cargadas: $especificaciones. Imágenes registradas: $imagenes.");
        paso("Cuentas creadas: $usuarios (administrador, gerente y cliente).");
        paso("Ventas de demostración: $ventas (para que los reportes tengan datos).");
        paso("Reseñas de productos: $resenas_productos. Encuestas del sitio: $resenas_sitio.");
        paso("Solicitudes de recuperación de clave: $solicitudes_password (tabla lista).");

        if ($productos < 1 || $usuarios < 1) {
            throw new RuntimeException(
                "La importación terminó pero faltan datos (productos: $productos, usuarios: $usuarios). "
                . "Revisa el archivo SQL."
            );
        }

        // La marca de "esquema de seguridad al día" puede venir de otra
        // instalación o de antes de reinstalar: se borra para que la próxima
        // petición vuelva a validar el esquema sobre la base recién importada.
        @unlink(__DIR__ . "/.esquema_seguridad_ok");
        @unlink(__DIR__ . "/.esquema_seguridad_v2");
        @unlink(__DIR__ . "/.esquema_seguridad_v3");
        @unlink(__DIR__ . "/.esquema_seguridad_v4");

        // El esquema de seguridad (columnas de la recuperación de contraseña
        // e índices) se aplica aquí mismo: así la base queda completa al
        // terminar la instalación, sin esperar a la primera visita.
        try {
            asegurar_esquema_seguridad($servidor);
            paso("Esquema de seguridad verificado (recuperación de contraseña y avisos en tiempo real).");
        } catch (Throwable $e) {
            error_log("Computlalte instalador: esquema de seguridad: " . $e->getMessage());
            paso("Aviso: el esquema de seguridad se aplicará en la primera visita a la tienda.", false);
        }

        // La página se dibuja después: se actualiza el estado para que no
        // siga diciendo "la base no existe" tras una instalación correcta.
        $base_existe = true;
        $productos_actuales = $productos;
        $usuarios_actuales = $usuarios;
        $instalacion_completada = true;

        paso("¡Instalación completada con éxito!", true);
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

// ------------------------------------------------------------- vista HTML
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalador | Computlalte</title>
    <style>
        /* Estilos propios del instalador: sin dependencias externas. */
        * { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh; display: grid; place-items: center;
            padding: 24px; background: #1c1c1c; color: #f5f5f5;
            font-family: "Segoe UI", system-ui, sans-serif;
        }
        .tarjeta {
            width: min(100%, 640px); padding: 32px; background: #141414;
            border: 1px solid rgba(255,255,255,.09); border-radius: 16px;
            box-shadow: 0 24px 64px rgba(0,0,0,.55);
        }
        .marca { font-weight: 800; font-size: 20px; letter-spacing: .5px; }
        .marca b { color: #ff0033; }
        h1 { margin: 8px 0 4px; font-size: 26px; }
        p.sub { margin: 0 0 20px; color: #a3a3a3; font-size: 14px; line-height: 1.6; }
        .estado { margin: 0 0 20px; padding: 14px 16px; background: #0d0d0d;
            border: 1px solid #2b2b2b; border-radius: 10px; font-size: 14px; line-height: 1.7; }
        .estado b { color: #70d6a2; }
        .estado .mal { color: #ff6b6b; }
        .boton {
            display: inline-block; width: 100%; padding: 14px; text-align: center;
            background: #ff0033; color: #fff; border: 0; border-radius: 8px;
            font-size: 17px; font-weight: 700; cursor: pointer; text-decoration: none;
        }
        .boton:hover { filter: brightness(1.12); }
        .boton.secundario { background: #262626; margin-top: 10px; }
        .pasos { margin: 18px 0 0; padding: 0; list-style: none; font-size: 14px; line-height: 1.6; }
        .pasos li { padding: 8px 12px; margin-bottom: 6px; background: #0d0d0d;
            border: 1px solid #2b2b2b; border-radius: 8px; }
        .pasos li::before { content: "✔ "; color: #70d6a2; font-weight: 700; }
        .error { margin: 18px 0 0; padding: 12px 14px; background: rgba(255,0,51,.08);
            border: 1px solid rgba(255,0,51,.4); border-radius: 8px; color: #ff9aac; font-size: 14px; }
        .enlaces { display: grid; gap: 10px; margin-top: 20px; }
        .enlaces a { display: block; padding: 12px; text-align: center; background: #1f1f1f;
            border: 1px solid #333; border-radius: 8px; color: #f5f5f5; text-decoration: none; font-weight: 600; }
        .enlaces a:hover { border-color: #ff0033; color: #fff; }
        code { background: #0d0d0d; border: 1px solid #333; border-radius: 4px; padding: 2px 7px; font-size: 13px; }
        .nota { margin-top: 18px; color: #8a8a8a; font-size: 12.5px; line-height: 1.6; }
    </style>
</head>
<body>
    <main class="tarjeta">
        <p class="marca">COMPU<b>TLALTE</b></p>
        <h1>Instalador de la base de datos</h1>
        <p class="sub">
            Este asistente crea la base de datos <code><?php echo DB_NOMBRE; ?></code> con todas sus
            tablas, productos, cuentas y datos de demostración. No necesitas tocar phpMyAdmin.
        </p>

        <div class="estado">
            <?php if ($fallo_conexion): ?>
                <span class="mal">✖ No pude conectarme a MySQL (<?php echo htmlspecialchars(DB_HOST); ?>).<br>
                Abre el Panel de XAMPP y enciende <b>MySQL</b>; después recarga esta página.</span>
                <?php if ($fallo_conexion !== ""): ?>
                    <br><small>Detalle: <?php echo htmlspecialchars($fallo_conexion); ?></small>
                <?php endif; ?>
            <?php elseif ($base_existe && $productos_actuales > 0): ?>
                ✔ Conexión a MySQL correcta. La base <b><?php echo DB_NOMBRE; ?></b> ya existe con
                <b><?php echo $productos_actuales; ?></b> productos instalados.
            <?php elseif ($base_existe): ?>
                ✔ Conexión a MySQL correcta. La base <b><?php echo DB_NOMBRE; ?></b> existe pero está vacía.
            <?php else: ?>
                ✔ Conexión a MySQL correcta. La base <b><?php echo DB_NOMBRE; ?></b> todavía no existe:
                lista para instalar.
            <?php endif; ?>
        </div>

        <?php if (count($pasos)): ?>
            <ul class="pasos">
                <?php foreach ($pasos as $paso): ?>
                    <li><?php echo htmlspecialchars($paso["texto"]); ?></li>
                <?php endforeach; ?>
            </ul>

            <?php if (!$error): ?>
                <div class="enlaces">
                    <a href="../prueba-conexion.php">Probar la conexión ahora</a>
                    <a href="../index.html">Abrir la tienda</a>
                    <a href="../panel.html">Ir al panel de control</a>
                </div>
            <?php endif; ?>
        <?php endif; ?>

        <?php if ($error): ?>
            <p class="error">✖ <?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>

        <?php if ($instalacion_bloqueada): ?>
            <div class="enlaces">
                <a href="../login.html">Iniciar sesión como administrador</a>
                <a href="../index.html">Volver a la tienda</a>
            </div>
        <?php endif; ?>

        <?php if (!$fallo_conexion && !$error && !$instalacion_bloqueada && !$instalacion_completada): ?>
            <?php if ($productos_actuales > 0): ?>
                <a class="boton secundario" href="?accion=instalar&confirmar=1">Reinstalar desde cero (borra los datos actuales)</a>
            <?php else: ?>
                <a class="boton" href="?accion=instalar">Instalar ahora</a>
            <?php endif; ?>
        <?php endif; ?>

        <p class="nota">
            ¿Problemas? Revisa que Apache y MySQL estén encendidos en el Panel de XAMPP y que este
            proyecto esté dentro de <code>htdocs</code>. El detalle completo está en
            <code>instalacion/README.md</code>.<br>
            Servidor: <code><?php echo htmlspecialchars(php_resumen()); ?></code>
            (se admite de <?php echo PHP_VERSION_MINIMA; ?> en adelante).
            <a href="requisitos.php">Ver el diagnóstico completo</a>.
        </p>
    </main>
</body>
</html>
