<?php
// subir_imagen.php — Sube una imagen desde el equipo del administrador
// y la guarda en una carpeta REAL del proyecto (100 % offline).
// Entrada:  POST multipart/form-data con "archivo" y "carpeta".
// Salida:   { ok, url: "imagenes/.../nombre.webp" }
//
// Seguridad:
//  · Solo el administrador puede subir.
//  · La carpeta de destino se valida contra una lista blanca: nunca se
//    acepta una ruta arbitraria (no hay path traversal).
//  · Se comprueba el tipo real del archivo (finfo), no solo la extensión.
//  · El nombre se regenera con slug + azar: nunca se usa el original.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder_error("Método no permitido.", 405);
}

$usuario = exigir_rol(["admin"]);

// ------------------------------------------- carpetas permitidas (whitelist)
$carpetas = [
    "imagenes/computadoras-gaming" => "Computadoras para juegos",
    "imagenes/computadoras-uso-diario" => "Computadoras de uso diario",
    "imagenes/computadoras-desarrollo" => "Computadoras para desarrollo",
    "imagenes/imagenes-accesorios" => "Accesorios",
    "imagenes/anuncios" => "Anuncios y portada"
];

$carpeta = (string) ($_POST["carpeta"] ?? "");
if (!isset($carpetas[$carpeta])) {
    responder_error("Carpeta de destino no permitida.");
}

// ---------------------------------------------------- utilidad de slugs
// Convierte texto libre (nombre de producto, nombre de archivo) en un slug
// seguro: minúsculas, sin acentos y solo letras, números y guiones. El orden
// importa: primero acentos y minúsculas, DESPUÉS el limpiado; si el regex
// corriera sobre el texto original, las mayúsculas (que no están en
// [a-z0-9]) se convertirían en guiones y desaparecerían del slug.
function slug_limpio(string $texto): string
{
    // Transliteración manual de acentos (á→a, ñ→n, …). No se usa iconv con
    // //TRANSLIT porque en Windows corta o corrompe los caracteres acentuados.
    $mapa_acentos = [
        "á" => "a", "à" => "a", "ä" => "a", "â" => "a", "ã" => "a", "å" => "a",
        "é" => "e", "è" => "e", "ë" => "e", "ê" => "e",
        "í" => "i", "ì" => "i", "ï" => "i", "î" => "i",
        "ó" => "o", "ò" => "o", "ö" => "o", "ô" => "o", "õ" => "o",
        "ú" => "u", "ù" => "u", "ü" => "u", "û" => "u",
        "ñ" => "n", "ç" => "c",
        "Á" => "a", "À" => "a", "Ä" => "a", "Â" => "a", "Ã" => "a", "Å" => "a",
        "É" => "e", "È" => "e", "Ë" => "e", "Ê" => "e",
        "Í" => "i", "Ì" => "i", "Ï" => "i", "Î" => "i",
        "Ó" => "o", "Ò" => "o", "Ö" => "o", "Ô" => "o", "Õ" => "o",
        "Ú" => "u", "Ù" => "u", "Ü" => "u", "Û" => "u",
        "Ñ" => "n", "Ç" => "c"
    ];

    return trim(
        (string) preg_replace("/[^a-z0-9]+/", "-", strtolower(strtr($texto, $mapa_acentos))),
        "-"
    );
}

// ------------------------------------- subcarpeta dinámica por producto
// Si la imagen pertenece a un producto (ej. "PC VENGEANCE a7500"), se crea
// una subcarpeta con su nombre en formato slug DENTRO de la carpeta
// elegida: imagenes/computadoras-gaming/pc-vengeance-a7500/. Así cada
// producto tiene sus imágenes perfectamente organizadas en el disco.
// El slug se deriva de un alfabeto limitado (sin puntos ni barras), así
// que no puede haber path traversal.
$producto_nombre = trim((string) ($_POST["producto"] ?? ""));
$slug_producto = "";

if ($producto_nombre !== "") {
    $slug_producto = slug_limpio($producto_nombre);
    if (strlen($slug_producto) < 2) {
        $slug_producto = ""; // nombre demasiado corto o sin caracteres útiles
    }
}

$ruta_relativa = $carpeta . ($slug_producto !== "" ? "/" . $slug_producto : "");

// -------------------------------------------------------- archivo recibido
$archivo = $_FILES["archivo"] ?? null;

if (!$archivo || ($archivo["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    responder_error("No se recibió una imagen válida (código " . ($archivo["error"] ?? "desconocido") . ").");
}

if (($archivo["size"] ?? 0) > 4 * 1024 * 1024) {
    responder_error("La imagen pesa más de 4 MB. Usa una más ligera.");
}

// Tipo REAL del archivo (no confiamos en el nombre ni en la extensión).
$tipos_permitidos = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp",
    "image/gif" => "gif",
    "image/avif" => "avif"
];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = (string) $finfo->file($archivo["tmp_name"]);

if (!isset($tipos_permitidos[$mime])) {
    responder_error("El archivo no es una imagen permitida (JPG, PNG, WEBP, GIF o AVIF).");
}

if (getimagesize($archivo["tmp_name"]) === false) {
    responder_error("El archivo no contiene una imagen legible.");
}

// ------------------------------------------------- nombre seguro y único
$original = (string) ($archivo["name"] ?? "imagen");
$base = pathinfo($original, PATHINFO_FILENAME);
$slug = slug_limpio(substr($base, 0, 40));
if ($slug === "") {
    $slug = "imagen";
}
$extension = $tipos_permitidos[$mime];
$nombre = $slug . "-" . bin2hex(random_bytes(4)) . "." . $extension;

// ------------------------------------------------------------- guardado
$carpeta_absoluta = __DIR__ . "/../" . $ruta_relativa;

if (!is_dir($carpeta_absoluta) && !mkdir($carpeta_absoluta, 0777, true)) {
    responder_error("No se pudo preparar la carpeta de destino.", 500);
}

$destino = $carpeta_absoluta . "/" . $nombre;

if (!move_uploaded_file($archivo["tmp_name"], $destino)) {
    responder_error("No se pudo guardar la imagen en el servidor.", 500);
}

// Sin bitácora por imagen: el guardado del producto ya registra un
// resumen único ("Cambió: imágenes, ...") y así no se llena de ruido.
responder_ok([
    "url" => $ruta_relativa . "/" . $nombre,
    "carpeta" => $carpetas[$carpeta]
]);
