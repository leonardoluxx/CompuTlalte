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

    $marca = dirname(__DIR__) . "/instalacion/.esquema_seguridad_ok";
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

    // Índices pensados para las consultas reales de la aplicación:
    // catálogo y galería, pedidos de una cuenta y bandejas del panel.
    $indices = [
        ["imagenes_producto", "idx_imagenes_producto_orden", "(producto_id, posicion, id)"],
        ["especificaciones", "idx_especificaciones_producto_orden", "(producto_id, tipo, id)"],
        ["ventas", "idx_ventas_usuario_id", "(usuario_id, id)"],
        ["solicitudes", "idx_solicitudes_estado_id", "(estado, id)"],
        ["solicitudes_password", "idx_solicitudes_password_estado_id", "(estado, id)"]
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
