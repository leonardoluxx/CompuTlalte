<?php
// resenas.php — Reseñas de productos.
// GET  ?producto_id=N  → { reseñas, promedio, total }
// POST                 → guarda una reseña nueva (producto_id, nombre, estrellas, comentario)

declare(strict_types=1);

require __DIR__ . "/_bd.php";

$bd = obtenerConexion();
$metodo = $_SERVER["REQUEST_METHOD"];

// --------------------------------------------------------------- lectura
if ($metodo === "GET") {
    cabeceras_json();

    $producto_id = (int) ($_GET["producto_id"] ?? 0);
    if ($producto_id <= 0) {
        responder_error("Falta producto_id.", 400);
    }

    $consulta = $bd->prepare(
        "SELECT id, producto_id, nombre_usuario, calificacion, comentario, fecha
         FROM resenas_productos WHERE producto_id = ? ORDER BY id DESC"
    );
    $consulta->bind_param("i", $producto_id);
    $consulta->execute();
    $resultado = $consulta->get_result();

    $reseñas = [];
    $suma = 0;
    $total = 0;
    while ($fila = $resultado->fetch_assoc()) {
        $reseñas[] = [
            "id" => (int) $fila["id"],
            "producto_id" => (int) $fila["producto_id"],
            "nombre_usuario" => (string) $fila["nombre_usuario"],
            "calificacion" => (int) $fila["calificacion"],
            "comentario" => (string) ($fila["comentario"] ?? ""),
            "fecha" => (string) $fila["fecha"]
        ];
        $suma += (int) $fila["calificacion"];
        $total++;
    }
    $consulta->close();

    $promedio = $total > 0 ? round($suma / $total, 1) : 0.0;

    echo json_encode([
        "ok" => true,
        "producto_id" => $producto_id,
        "reseñas" => $reseñas,
        "promedio" => $promedio,
        "total" => $total
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($metodo !== "POST") {
    responder_error("Método no permitido.", 405);
}

$cuerpo = leer_cuerpo();
csrf_exigir();
rate_limit("resenas", 20, 60);

$producto_id = (int) ($cuerpo["producto_id"] ?? 0);
$nombre = trim((string) ($cuerpo["nombre"] ?? $cuerpo["nombre_usuario"] ?? ""));
$estrellas = (int) ($cuerpo["estrellas"] ?? $cuerpo["calificacion"] ?? 0);
$comentario = trim((string) ($cuerpo["comentario"] ?? ""));

if ($producto_id <= 0) {
    responder_error("Falta el producto.");
}

if ($nombre === "") {
    $u = usuario_de_sesion();
    if ($u) {
        $nombre = (string) $u["nombre"];
    }
}
if ($nombre === "") {
    responder_error("Escribe tu nombre.");
}

if ($estrellas < 1 || $estrellas > 5) {
    responder_error("La calificación debe ser de 1 a 5 estrellas.");
}

$insertar = $bd->prepare(
    "INSERT INTO resenas_productos (producto_id, nombre_usuario, calificacion, comentario)
     VALUES (?, ?, ?, ?)"
);
$insertar->bind_param("isis", $producto_id, $nombre, $estrellas, $comentario);
$insertar->execute();
$insertar->close();

responder_ok(["mensaje" => "Tu reseña se guardó correctamente."]);
