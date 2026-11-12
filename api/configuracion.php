<?php
// configuracion.php — Ajustes globales de la tienda (solo administrador).
// GET  → { margenGlobal }
// POST { margenGlobal } → guarda el margen y recalcula el precio_final de
//                         todos los productos que usen el margen global.
//                         Los que tienen margen propio no se tocan.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

$metodo_http = $_SERVER["REQUEST_METHOD"];

if ($metodo_http === "GET") {
    cabeceras_json();
    $bd = obtenerConexion();

    // Imágenes configurables de la tienda (null = predeterminada del diseño).
    $imagenes = [
        "heroImagen" => null,
        "imagenComputadoras" => null,
        "imagenAccesorios" => null,
        "imagenOfertas" => null
    ];
    $mapa_claves = [
        "heroImagen" => "hero_imagen",
        "imagenComputadoras" => "imagen_computadoras",
        "imagenAccesorios" => "imagen_accesorios",
        "imagenOfertas" => "imagen_ofertas"
    ];

    $resultado = $bd->query(
        "SELECT clave, valor FROM configuracion WHERE clave IN ('hero_imagen','imagen_computadoras','imagen_accesorios','imagen_ofertas')"
    );
    while ($fila = $resultado->fetch_assoc()) {
        $indice = array_search($fila["clave"], $mapa_claves, true);
        if ($indice !== false) {
            $imagenes[$indice] = (string) $fila["valor"];
        }
    }

    echo json_encode(
        array_merge(["ok" => true, "margenGlobal" => margen_global($bd)], $imagenes),
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

if ($metodo_http !== "POST") {
    responder_error("Método no permitido.", 405);
}

$usuario = exigir_rol(["admin"]);
$bd = obtenerConexion();

$cuerpo = leer_cuerpo();
csrf_exigir();
rate_limit("configuracion", 10, 60);

// ------------------------------------------------- margen de ganancia
if (isset($cuerpo["margenGlobal"])) {
    $margen = (float) ($cuerpo["margenGlobal"] ?? -1);

    if (!is_finite($margen) || $margen < 0 || $margen > 300) {
        responder_error("El margen debe estar entre 0 % y 300 %.");
    }

    // Guarda el margen global.
    $guardar = $bd->prepare(
        "INSERT INTO configuracion (clave, valor) VALUES ('margen_global', ?)
         ON DUPLICATE KEY UPDATE valor = VALUES(valor)"
    );
    $valor = (string) $margen;
    $guardar->bind_param("s", $valor);
    $guardar->execute();
    $guardar->close();

    // Recalcula los precios de los productos que dependen del margen global.
    $actualizar = $bd->prepare(
        "UPDATE productos
         SET precio_final = ROUND(costo_base * (1 + ? / 100), 2)
         WHERE margen_propio IS NULL"
    );
    $actualizar->bind_param("d", $margen);
    $actualizar->execute();
    $afectados = $actualizar->affected_rows;
    $actualizar->close();

    registrar_bitacora(
        $bd,
        $usuario["nombre"],
        "admin",
        "configuracion",
        "Margen global de ganancia: $margen % ($afectados productos recalculados)"
    );

    responder_ok(["margenGlobal" => $margen, "productosRecalculados" => $afectados]);
}

// ------------------------------------------- imágenes configurables
// Cada sección principal de la tienda tiene su propia imagen, editable
// desde el panel o con el botón de lápiz en la propia página.
if (isset($cuerpo["imagen"])) {
    $imagen = trim((string) $cuerpo["imagen"]);
    $clave = trim((string) ($cuerpo["clave"] ?? "hero_imagen"));

    // Whitelist de claves: ninguna otra cosa se puede escribir aquí.
    $claves_validas = [
        "hero_imagen" => "heroImagen",
        "imagen_computadoras" => "imagenComputadoras",
        "imagen_accesorios" => "imagenAccesorios",
        "imagen_ofertas" => "imagenOfertas"
    ];

    if (!isset($claves_validas[$clave])) {
        responder_error("Clave de configuración no permitida.");
    }

    // Solo rutas locales dentro de imagenes/ y sin travesías de directorio.
    // Se permiten puntos (extensiones como .webp), pero nunca "..".
    // strpos en lugar de str_contains: la segunda llegó en PHP 8 y esto debe
    // funcionar también en PHP 7.4.
    if (!preg_match("#^imagenes/[\w.\-/]+$#", $imagen) || strpos($imagen, "..") !== false) {
        responder_error("Ruta de imagen no válida.");
    }

    if (!is_file(__DIR__ . "/../" . $imagen)) {
        responder_error("Esa imagen no existe en el servidor.");
    }

    $guardar = $bd->prepare(
        "INSERT INTO configuracion (clave, valor) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE valor = VALUES(valor)"
    );
    $guardar->bind_param("ss", $clave, $imagen);
    $guardar->execute();
    $guardar->close();

    registrar_bitacora(
        $bd,
        $usuario["nombre"],
        "admin",
        "configuracion",
        "Imagen actualizada ($clave): $imagen"
    );

    responder_ok([$claves_validas[$clave] => $imagen]);
}

responder_error("No hay cambios que guardar.");
