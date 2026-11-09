<?php
// actualizar_imagenes.php — Vuelve a copiar las fotos de los 40 productos
// nuevos desde _nuevos hacia imagenes/computadoras-desarrollo y
// imagenes/computadoras-gaming, y actualiza MySQL.
//
// Sirve cuando se reemplazan o agregan fotos en las carpetas numeradas
// (_nuevos/imagenes de pc de desarollo/1-20 y _nuevos/imagenes de pc gamer/1-20).
//
// Uso:
//   php _nuevos/actualizar_imagenes.php            (solo revisión, no toca nada)
//   php _nuevos/actualizar_imagenes.php --apply    (copia fotos y actualiza la BD)
//
// La extensión final se toma del archivo original (png, jpg, webp, avif...).
// Antes el importador forzaba .webp incluso para archivos PNG.

declare(strict_types=1);
mb_internal_encoding("UTF-8");

require_once __DIR__ . "/../api/_bd.php";

$aplicar = in_array("--apply", $argv, true);
$raiz = dirname(__DIR__);

$carpetas = [
    "Desarrollo" => __DIR__ . "/imagenes de pc de desarollo",
    "Juegos" => __DIR__ . "/imagenes de pc gamer",
];

$parseados = json_decode((string) file_get_contents(__DIR__ . "/productos_parseados.json"), true);
if (!is_array($parseados) || !$parseados) {
    fwrite(STDERR, "No pude leer _nuevos/productos_parseados.json" . PHP_EOL);
    exit(1);
}

$bd = obtenerConexion();
$bd->set_charset("utf8mb4");

// Misma prioridad que el importador: primero las fotos que llevan "-F.",
// después el resto en orden natural.
function ordenar_fotos(array $todos): array
{
    $todos = array_values(array_filter($todos, "is_file"));
    usort($todos, function (string $a, string $b): int {
        $fa = stripos(basename($a), "-F.") !== false ? 0 : 1;
        $fb = stripos(basename($b), "-F.") !== false ? 0 : 1;
        return ($fa <=> $fb) ?: strnatcasecmp(basename($a), basename($b));
    });

    $unicas = [];
    $vistos = [];
    foreach ($todos as $archivo) {
        $huella = sha1_file($archivo);
        if ($huella !== false && isset($vistos[$huella])) {
            continue;
        }
        if ($huella !== false) {
            $vistos[$huella] = true;
        }
        $unicas[] = $archivo;
    }
    return $unicas;
}

function extension_valida(string $archivo): string
{
    $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
    if ($extension === "jpeg") {
        return "jpg";
    }
    return in_array($extension, ["png", "jpg", "webp", "avif", "gif"], true) ? $extension : "webp";
}

$consultaProducto = $bd->prepare("SELECT nombre, imagen_url FROM productos WHERE id = ? LIMIT 1");
$actualizarImagen = $bd->prepare("UPDATE productos SET imagen_url = ? WHERE id = ?");
$borrarImagenes = $bd->prepare("DELETE FROM imagenes_producto WHERE producto_id = ?");
$insertarImagen = $bd->prepare("INSERT INTO imagenes_producto (producto_id, url, posicion) VALUES (?, ?, ?)");

$plan = [];
$avisos = [];
$totalFotos = 0;

foreach ($parseados as $p) {
    $id = (int) $p["id"];
    $numero = (string) $p["numero"];
    $categoria = (string) $p["categoria"];
    $slug = (string) $p["slug"];
    $destinoBase = (string) $p["destino_base"];

    $consultaProducto->bind_param("i", $id);
    $consultaProducto->execute();
    $fila = $consultaProducto->get_result()->fetch_assoc();
    if (!$fila) {
        $avisos[] = "#$id ($slug): no existe en la base de datos; se omite.";
        continue;
    }
    if ($fila["nombre"] !== $p["nombre"]) {
        $avisos[] = "#$id: el nombre en la BD no coincide con el JSON; se omite.";
        continue;
    }

    // La carpeta destino debe ser exactamente la que ya usa el producto.
    $carpetaActual = str_replace("\\", "/", dirname((string) $fila["imagen_url"]));
    $carpetaEsperada = $destinoBase . "/" . $slug;
    if ($carpetaActual !== $carpetaEsperada) {
        $avisos[] = "#$id ($slug): la BD apunta a '$carpetaActual' y no a '$carpetaEsperada'; se omite.";
        continue;
    }

    $origen = rtrim($carpetas[$categoria] ?? "", "/\\") . DIRECTORY_SEPARATOR . $numero;
    if (!is_dir($origen)) {
        $avisos[] = "#$id ($slug): falta la carpeta de origen $origen; se omite.";
        continue;
    }

    $fotos = ordenar_fotos(glob($origen . DIRECTORY_SEPARATOR . "*") ?: []);
    if (!$fotos) {
        $avisos[] = "#$id ($slug): la carpeta de origen está vacía; se omite.";
        continue;
    }

    $rutas = [];
    foreach ($fotos as $indice => $foto) {
        $rutas[] = $carpetaEsperada . "/" . sprintf(
            "%s-%02d.%s",
            $slug,
            $indice + 1,
            extension_valida($foto)
        );
    }

    $plan[] = [
        "id" => $id,
        "slug" => $slug,
        "categoria" => $categoria,
        "origen" => $origen,
        "fotos" => $fotos,
        "carpeta" => $carpetaEsperada,
        "rutas" => $rutas,
        "antes" => (int) $bd->query("SELECT COUNT(*) AS t FROM imagenes_producto WHERE producto_id = $id")->fetch_assoc()["t"],
    ];
    $totalFotos += count($rutas);
}

echo "Productos a actualizar: " . count($plan) . PHP_EOL;
echo "Fotos nuevas en total: $totalFotos" . PHP_EOL;
foreach ($plan as $item) {
    echo sprintf(
        "  #%d %-10s %2d -> %2d fotos  (%s)",
        $item["id"],
        $item["categoria"],
        $item["antes"],
        count($item["rutas"]),
        basename($item["carpeta"])
    ) . PHP_EOL;
}
if ($avisos) {
    echo PHP_EOL . "Avisos:" . PHP_EOL . " - " . implode(PHP_EOL . " - ", $avisos) . PHP_EOL;
}

if (!$aplicar) {
    echo PHP_EOL . "Revisión solamente. Para aplicar: php _nuevos/actualizar_imagenes.php --apply" . PHP_EOL;
    exit(0);
}

// --------------------------------------------------------------- aplicar
$copiadas = 0;
try {
    $bd->begin_transaction();

    foreach ($plan as $item) {
        $carpetaAbs = $raiz . "/" . $item["carpeta"];
        if (!is_dir($carpetaAbs) && !mkdir($carpetaAbs, 0775, true) && !is_dir($carpetaAbs)) {
            throw new RuntimeException("No pude crear " . $item["carpeta"]);
        }

        // La carpeta es exclusiva de este producto: quitamos las fotos viejas
        // (incluidas las .webp que en realidad contenían PNG).
        foreach (glob($carpetaAbs . "/*") ?: [] as $viejo) {
            if (is_file($viejo) && !unlink($viejo)) {
                throw new RuntimeException("No pude borrar " . basename($viejo));
            }
        }

        foreach ($item["fotos"] as $indice => $foto) {
            $destino = $carpetaAbs . "/" . basename($item["rutas"][$indice]);
            if (!copy($foto, $destino)) {
                throw new RuntimeException("No pude copiar " . basename($foto));
            }
            $copiadas++;
        }

        $principal = $item["rutas"][0];
        $actualizarImagen->bind_param("si", $principal, $item["id"]);
        $actualizarImagen->execute();

        $borrarImagenes->bind_param("i", $item["id"]);
        $borrarImagenes->execute();

        foreach ($item["rutas"] as $indice => $ruta) {
            $posicion = $indice + 1;
            $insertarImagen->bind_param("isi", $item["id"], $ruta, $posicion);
            $insertarImagen->execute();
        }
    }

    $bd->commit();
} catch (Throwable $error) {
    $bd->rollback();
    fwrite(STDERR, "ERROR, no se cambió nada: " . $error->getMessage() . PHP_EOL);
    exit(1);
}

// ------------------------------------------------- respaldo SQL actualizado
$columnas = [
    "id", "nombre", "descripcion", "descripcion_corta", "categoria_id",
    "costo_base", "precio_final", "margen_propio", "imagen_url", "video_url",
    "stock", "estado", "marca", "tipo", "etiqueta", "destacado", "en_oferta",
    "descuento", "resenas", "vendidos", "fecha_alta", "terminos_busqueda",
    "personalizacion",
];
$numericas = [
    "id" => true, "categoria_id" => true, "costo_base" => true,
    "precio_final" => true, "margen_propio" => true, "stock" => true,
    "destacado" => true, "en_oferta" => true, "descuento" => true,
    "resenas" => true, "vendidos" => true,
];

$ids = array_column($plan, "id");
$idTexto = implode(",", $ids);
$sql = [];
$sql[] = "-- Productos nuevos importados desde _nuevos (actualizado " . date("Y-m-d H:i:s") . ")";
$sql[] = "-- Ejecutar después de instalar la base original.";
$sql[] = "START TRANSACTION;";

$filas = $bd->query("SELECT * FROM productos WHERE id IN ($idTexto) ORDER BY id");
$imagenesPorProducto = [];
$imagenes = $bd->query("SELECT producto_id, url FROM imagenes_producto WHERE producto_id IN ($idTexto) ORDER BY producto_id, posicion, id");
while ($fila = $imagenes->fetch_assoc()) {
    $imagenesPorProducto[(int) $fila["producto_id"]][] = $fila["url"];
}
$specsPorProducto = [];
$specs = $bd->query("SELECT producto_id, tipo, descripcion FROM especificaciones WHERE producto_id IN ($idTexto) ORDER BY producto_id, id");
while ($fila = $specs->fetch_assoc()) {
    $specsPorProducto[(int) $fila["producto_id"]][] = $fila;
}

while ($fila = $filas->fetch_assoc()) {
    $id = (int) $fila["id"];
    $valores = [];
    foreach ($columnas as $columna) {
        $v = $fila[$columna];
        if ($v === null) {
            $valores[] = "NULL";
        } elseif (isset($numericas[$columna])) {
            $valores[] = (string) $v;
        } else {
            $valores[] = "'" . $bd->real_escape_string((string) $v) . "'";
        }
    }
    $sql[] = "INSERT INTO `productos` (`" . implode("`,`", $columnas) . "`) VALUES (" . implode(",", $valores) . ");";

    foreach ($specsPorProducto[$id] ?? [] as $spec) {
        $sql[] = "INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES ("
            . $id . ",'" . $bd->real_escape_string($spec["tipo"]) . "','"
            . $bd->real_escape_string($spec["descripcion"]) . "');";
    }
    foreach ($imagenesPorProducto[$id] ?? [] as $indice => $url) {
        $sql[] = "INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES ("
            . $id . ",'" . $bd->real_escape_string($url) . "'," . ($indice + 1) . ");";
    }
}

$sql[] = "COMMIT;";
$sql[] = "ALTER TABLE `productos` AUTO_INCREMENT = " . (max($ids) + 1) . ";";
file_put_contents(__DIR__ . "/productos_nuevos.sql", implode(PHP_EOL, $sql) . PHP_EOL);

echo PHP_EOL . "LISTO: " . count($plan) . " productos actualizados y $copiadas fotos copiadas." . PHP_EOL;
echo "Fotos en: imagenes/computadoras-desarrollo y imagenes/computadoras-gaming" . PHP_EOL;
echo "SQL actualizado: _nuevos/productos_nuevos.sql" . PHP_EOL;

$consultaProducto->close();
$actualizarImagen->close();
$borrarImagenes->close();
$insertarImagen->close();
$bd->close();
