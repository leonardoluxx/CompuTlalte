<?php
// pedidos.php — Pedidos (ventas) de la tienda.
// GET  → { ok, pedidos: [...], estados: [...] }            (admin y gerente)
// POST { folio, estado } → cambia el estado de un pedido    (solo admin)
//
// Los estados válidos son los del enum de la tabla ventas:
// pendiente · pagado · enviado · entregado · cancelado.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

$usuario = exigir_rol(["admin", "gerente"]);
$bd = obtenerConexion();

// Espejo exacto del enum `estado_pedido` de la base de datos.
$ESTADOS = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];

// ---------------------------------------------------------------- listado
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    cabeceras_json();
    header("Cache-Control: no-store");

    $pedidos = [];
    $resultado = $bd->query(
        "SELECT v.id, v.folio, v.fecha, v.total, v.metodo_pago, v.cupon,
                v.estado_pedido, v.direccion_envio,
                COALESCE(u.nombre, 'Invitado') AS cliente,
                COALESCE(u.email, '') AS cliente_email,
                (SELECT COUNT(*) FROM detalle_ventas d WHERE d.venta_id = v.id) AS renglones
         FROM ventas v
         LEFT JOIN usuarios u ON u.id = v.usuario_id
         ORDER BY v.id DESC
         LIMIT 200"
    );

    while ($fila = $resultado->fetch_assoc()) {
        $pedidos[] = [
            "id" => (int) $fila["id"],
            "folio" => (string) $fila["folio"],
            "fecha" => (string) $fila["fecha"],
            "total" => (float) $fila["total"],
            "metodo" => (string) $fila["metodo_pago"],
            "cupon" => $fila["cupon"] !== null ? (string) $fila["cupon"] : "",
            "estado" => (string) $fila["estado_pedido"],
            "cliente" => (string) $fila["cliente"],
            "clienteEmail" => (string) $fila["cliente_email"],
            "direccion" => (string) ($fila["direccion_envio"] ?? ""),
            "renglones" => (int) $fila["renglones"]
        ];
    }

    echo json_encode([
        "ok" => true,
        "pedidos" => $pedidos,
        "estados" => $ESTADOS
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder_error("Método no permitido.", 405);
}

// -------------------------------------------------------- cambio de estado
// El gerente puede consultar los pedidos, pero solo el administrador los mueve.
if ($usuario["rol"] !== "admin") {
    responder_error("Solo el administrador puede cambiar el estado de un pedido.", 403);
}

$cuerpo = leer_cuerpo();
csrf_exigir();
rate_limit("pedidos", 40, 60);

$folio = trim((string) ($cuerpo["folio"] ?? ""));
$estado = strtolower(trim((string) ($cuerpo["estado"] ?? "")));

if ($folio === "" || !in_array($estado, $ESTADOS, true)) {
    responder_error("Pedido o estado no válido.");
}

$consulta = $bd->prepare("SELECT folio, estado_pedido FROM ventas WHERE folio = ? LIMIT 1");
$consulta->bind_param("s", $folio);
$consulta->execute();
$venta = $consulta->get_result()->fetch_assoc();
$consulta->close();

if (!$venta) {
    responder_error("Ese pedido no existe.", 404);
}

$estado_anterior = (string) $venta["estado_pedido"];

if ($estado_anterior !== $estado) {
    $actualizar = $bd->prepare("UPDATE ventas SET estado_pedido = ? WHERE folio = ?");
    $actualizar->bind_param("ss", $estado, $folio);
    $actualizar->execute();
    $actualizar->close();

    registrar_bitacora(
        $bd,
        $usuario["nombre"],
        $usuario["rol"],
        "pedidos",
        "Pedido $folio: estado $estado_anterior → $estado"
    );
}

responder_ok([
    "folio" => $folio,
    "estado" => $estado,
    "anterior" => $estado_anterior
]);
