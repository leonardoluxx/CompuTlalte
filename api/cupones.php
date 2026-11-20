<?php
// cupones.php — Valida un cupón SIN registrar la venta.
// GET ?codigo=COMPU10 → { ok, valido, codigo, descuento }
//
// La usa la pantalla de pago para mostrar el total REAL antes de cobrar.
// El descuento definitivo se vuelve a calcular en procesar_venta.php: este
// endpoint es solo informativo y nunca modifica nada.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    responder_error("Método no permitido.", 405);
}

cabeceras_json();
header("Cache-Control: no-store");

// Evita que alguien pruebe códigos en masa desde la misma conexión.
limitar_por_ip("validar_cupon", 90, 60);

$codigo = strtoupper(trim((string) ($_GET["codigo"] ?? "")));

if ($codigo === "" || strlen($codigo) > 40) {
    echo json_encode(
        ["ok" => true, "valido" => false, "descuento" => 0],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

$bd = obtenerConexion();
$consulta = $bd->prepare(
    "SELECT codigo, descuento_porcentaje FROM cupones WHERE codigo = ? AND activo = 1 LIMIT 1"
);
$consulta->bind_param("s", $codigo);
$consulta->execute();
$cupon = $consulta->get_result()->fetch_assoc();
$consulta->close();

if (!$cupon) {
    echo json_encode(
        ["ok" => true, "valido" => false, "descuento" => 0],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

echo json_encode([
    "ok" => true,
    "valido" => true,
    "codigo" => (string) $cupon["codigo"],
    "descuento" => (int) $cupon["descuento_porcentaje"]
], JSON_UNESCAPED_UNICODE);
