<?php
// version.php — Firma ligera del estado de la tienda.
// El navegador la consulta cada segundo: si cambia, recarga productos,
// contenido, secciones y solicitudes sin recargar la página. El servidor es
// la única fuente de verdad; esta firma solo avisa cuándo hay algo nuevo.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

// Este endpoint se consulta constantemente: no debe retener el bloqueo de la
// sesión ni impedir que el usuario guarde mientras se comprueba la versión.
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}

cabeceras_json();
header("Cache-Control: no-store, max-age=0");

$bd = obtenerConexion();
$partes = [];

try {
    $fila = $bd->query(
        "SELECT COUNT(*) AS total,
                COALESCE(SUM(CRC32(CONCAT_WS('|', id, nombre, marca, categoria, precio_final,
                    en_oferta, descuento, grupo_oferta, stock, disponible, destacado,
                    imagen_principal, actualizado))), 0) AS firma
         FROM productos"
    )->fetch_assoc();
    $partes[] = "p:" . ($fila["total"] ?? 0) . ":" . ($fila["firma"] ?? 0);
} catch (Throwable $e) {
    $partes[] = "p:0:0";
}

try {
    $fila = $bd->query(
        "SELECT COUNT(*) AS total,
                COALESCE(SUM(CRC32(CONCAT_WS('|', clave, valor))), 0) AS firma
         FROM contenido_sitio"
    )->fetch_assoc();
    $partes[] = "c:" . ($fila["total"] ?? 0) . ":" . ($fila["firma"] ?? 0);
} catch (Throwable $e) {
    $partes[] = "c:0:0";
}

try {
    $fila = $bd->query(
        "SELECT COUNT(*) AS total,
                COALESCE(SUM(CRC32(CONCAT_WS('|', id, clave, etiqueta, titulo, acento, descripcion, orden))), 0) AS firma
         FROM secciones_oferta"
    )->fetch_assoc();
    $partes[] = "s:" . ($fila["total"] ?? 0) . ":" . ($fila["firma"] ?? 0);
} catch (Throwable $e) {
    $partes[] = "s:0:0";
}

try {
    $fila = $bd->query(
        "SELECT COUNT(*) AS total,
                COALESCE(SUM(CRC32(CONCAT_WS('|', id, estado, fecha_resolucion))), 0) AS firma
         FROM solicitudes"
    )->fetch_assoc();
    $partes[] = "q:" . ($fila["total"] ?? 0) . ":" . ($fila["firma"] ?? 0);
} catch (Throwable $e) {
    $partes[] = "q:0:0";
}

try {
    $resultado = $bd->query(
        "SELECT clave, valor FROM configuracion
         WHERE clave IN ('hero_imagen','imagen_computadoras','imagen_accesorios','imagen_ofertas')
         ORDER BY clave"
    );
    $config = [];
    while ($fila = $resultado->fetch_assoc()) {
        $config[] = $fila["clave"] . "=" . $fila["valor"];
    }
    $partes[] = "g:" . implode(",", $config);
} catch (Throwable $e) {
    $partes[] = "g:";
}

echo json_encode(
    ["ok" => true, "version" => md5(implode("|", $partes))],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
