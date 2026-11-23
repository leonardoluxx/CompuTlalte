<?php
// _seguridad.php — Esquema y utilidades del módulo de recuperación de contraseña.
// El esquema se asegura solo (idempotente) para que el proyecto funcione
// igual en una instalación nueva o en una base ya existente.

declare(strict_types=1);

// Crea la tabla de solicitudes, la bandera de cambio obligatorio y los
// índices de rendimiento si faltan. Después de la primera migración deja
// una marca en disco para no repetir las consultas de metadatos en cada
// petición (bajo carga eso se nota).
function asegurar_esquema_seguridad(mysqli $bd): void
{
    static $listo = false;

    if ($listo) {
        return;
    }

    // El nombre lleva versión a propósito: al añadir columnas nuevas hay que
    // volver a migrar incluso en instalaciones que ya tenían la marca vieja.
    $marca = dirname(__DIR__) . "/instalacion/.esquema_seguridad_v4";
    if (is_file($marca)) {
        $listo = true;
        return;
    }

    $bd->query(
        "CREATE TABLE IF NOT EXISTS solicitudes_password (
            id int(10) unsigned NOT NULL AUTO_INCREMENT,
            email varchar(160) NOT NULL,
            razon varchar(500) NOT NULL,
            correo_registrado tinyint(1) NOT NULL DEFAULT 1,
            nota varchar(255) DEFAULT NULL,
            estado enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
            fecha_solicitud datetime NOT NULL DEFAULT current_timestamp(),
            fecha_resolucion datetime DEFAULT NULL,
            resuelto_por varchar(120) DEFAULT NULL,
            clave_temporal varchar(40) DEFAULT NULL,
            token varchar(64) DEFAULT NULL,
            PRIMARY KEY (id),
            KEY idx_solicitudes_password_estado (estado),
            KEY idx_solicitudes_password_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $columna = $bd->query("SHOW COLUMNS FROM usuarios LIKE 'debe_cambiar_clave'");
    if (!$columna || $columna->num_rows === 0) {
        $bd->query(
            "ALTER TABLE usuarios
             ADD COLUMN debe_cambiar_clave tinyint(1) NOT NULL DEFAULT 0 AFTER metodo_pago"
        );
    }

    // Columnas del aviso en tiempo real: la contraseña temporal aprobada y la
    // ficha secreta con la que el solicitante consulta su estado.
    $columnas_nuevas = [
        "clave_temporal" => "ALTER TABLE solicitudes_password
             ADD COLUMN clave_temporal varchar(40) DEFAULT NULL AFTER resuelto_por",
        "token" => "ALTER TABLE solicitudes_password
             ADD COLUMN token varchar(64) DEFAULT NULL AFTER clave_temporal"
    ];

    foreach ($columnas_nuevas as $columna_nombre => $alter) {
        $existe_columna = $bd->query(
            "SHOW COLUMNS FROM solicitudes_password LIKE '" . $columna_nombre . "'"
        );
        if (!$existe_columna || $existe_columna->num_rows === 0) {
            $bd->query($alter);
        }
    }

    // El margen propio guarda suficientes decimales para que el precio que
    // escribe el administrador se conserve al centavo. Con solo dos
    // decimales, un precio como $41,000 podía terminar en $41,001.
    $tabla_margen = $bd->query("SHOW TABLES LIKE 'productos'");
    if ($tabla_margen && $tabla_margen->num_rows > 0) {
        $columna_margen = $bd->query("SHOW COLUMNS FROM productos LIKE 'margen_propio'");
        if ($columna_margen && $columna_margen->num_rows > 0) {
            $info_margen = $columna_margen->fetch_assoc();
            if ($info_margen && stripos((string) $info_margen["Type"], "decimal(5,2)") !== false) {
                $bd->query("ALTER TABLE productos MODIFY COLUMN margen_propio decimal(9,6) DEFAULT NULL");
            }
        }
    }

    // Sección de la oferta: el administrador decide en qué sección aparece
    // cada producto. La clave es libre para que pueda crear más secciones
    // desde la tienda, no solo las tres iniciales.
    $tabla_productos = $bd->query("SHOW TABLES LIKE 'productos'");
    if ($tabla_productos && $tabla_productos->num_rows > 0) {
        $columna_grupo = $bd->query("SHOW COLUMNS FROM productos LIKE 'grupo_oferta'");
        if (!$columna_grupo || $columna_grupo->num_rows === 0) {
            $bd->query(
                "ALTER TABLE productos
                 ADD COLUMN grupo_oferta varchar(60) DEFAULT NULL AFTER descuento"
            );
        } else {
            $info_grupo = $columna_grupo->fetch_assoc();
            if ($info_grupo && stripos((string) $info_grupo["Type"], "enum") !== false) {
                $bd->query("ALTER TABLE productos MODIFY COLUMN grupo_oferta varchar(60) DEFAULT NULL");
            }
        }
    }

    // Contenido editable de la tienda. Cada clave corresponde a un texto
    // visible; las secciones de ofertas se guardan aparte porque también
    // llevan orden, título, subtítulo y descripción.
    $bd->query(
        "CREATE TABLE IF NOT EXISTS contenido_sitio (
            clave varchar(100) NOT NULL,
            valor text NOT NULL,
            actualizado timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (clave)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
    $bd->query(
        "CREATE TABLE IF NOT EXISTS secciones_oferta (
            id int(10) unsigned NOT NULL AUTO_INCREMENT,
            clave varchar(60) NOT NULL,
            etiqueta varchar(60) DEFAULT NULL,
            titulo varchar(120) NOT NULL,
            acento varchar(120) DEFAULT NULL,
            descripcion varchar(500) DEFAULT NULL,
            orden int(11) NOT NULL DEFAULT 0,
            actualizado timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (id),
            UNIQUE KEY uq_secciones_oferta_clave (clave),
            KEY idx_secciones_oferta_orden (orden, id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $total_secciones = $bd->query("SELECT COUNT(*) AS total FROM secciones_oferta");
    $hay_secciones = $total_secciones ? (int) $total_secciones->fetch_assoc()["total"] : 0;
    if ($hay_secciones === 0) {
        $bd->query(
            "INSERT INTO secciones_oferta (clave, etiqueta, titulo, acento, descripcion, orden) VALUES
             ('semana', 'DESTACADAS', 'Ofertas', 'de la semana', 'Los favoritos del momento, con descuento durante esta semana.', 1),
             ('educativo', 'PARA ESTUDIAR', 'Descuentos', 'educativos', 'Equipos pensados para clases, programación y trabajo académico.', 2),
             ('especial', 'SELECCIÓN PREMIUM', 'Promociones', 'especiales', 'Oportunidades puntuales en equipos y accesorios de gama alta.', 3)"
        );
    }

    // Índices pensados para las consultas reales de la aplicación:
    // catálogo y galería, pedidos de una cuenta y bandejas del panel.
    $indices = [
        ["imagenes_producto", "idx_imagenes_producto_orden", "(producto_id, posicion, id)"],
        ["especificaciones", "idx_especificaciones_producto_orden", "(producto_id, tipo, id)"],
        ["ventas", "idx_ventas_usuario_id", "(usuario_id, id)"],
        ["solicitudes", "idx_solicitudes_estado_id", "(estado, id)"],
        ["solicitudes_password", "idx_solicitudes_password_estado_id", "(estado, id)"],
        ["solicitudes_password", "idx_solicitudes_password_token", "(token)"]
    ];

    foreach ($indices as [$tabla, $nombre, $columnas]) {
        $consulta = $bd->prepare(
            "SELECT COUNT(*) AS t FROM information_schema.statistics
             WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?"
        );
        $consulta->bind_param("ss", $tabla, $nombre);
        $consulta->execute();
        $existe = (int) $consulta->get_result()->fetch_assoc()["t"] > 0;
        $consulta->close();

        if (!$existe && preg_match("/^[a-z_]+$/i", $tabla) && preg_match("/^[a-z_]+$/i", $nombre)) {
            $bd->query("ALTER TABLE `$tabla` ADD INDEX `$nombre` $columnas");
        }
    }

    // Marca de migración: se escribe al final, cuando todo salió bien.
    @file_put_contents($marca, date("c") . PHP_EOL);
    $listo = true;
}

// Contraseña temporal legible y aleatoria (mayúsculas, minúsculas, dígitos y símbolo).
function generar_clave_temporal(): string
{
    $alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    $largo = strlen($alfabeto);
    $clave = "";

    for ($indice = 0; $indice < 8; $indice += 1) {
        $clave .= $alfabeto[random_int(0, $largo - 1)];
    }

    return "Comp-" . $clave . "!";
}
