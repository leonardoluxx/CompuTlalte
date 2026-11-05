<?php
// reportes.php — Reportes de ventas, exclusivos del administrador.
// GET → totales de ventas, productos más vendidos, stock bajo y
//       últimas ventas. El panel lo muestra en la vista Resumen.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    responder_error("Método no permitido.", 405);
}

$usuario = exigir_rol(["admin"]);
$bd = obtenerConexion();

// ------------------------------------------------- totales generales
$totales = $bd->query(
    "SELECT
        COUNT(*) AS total_ventas,
        COALESCE(SUM(total), 0) AS ingresos_totales,
        COALESCE(AVG(total), 0) AS ticket_promedio,
        COALESCE(SUM(CASE WHEN DATE(fecha) = CURDATE() THEN 1 ELSE 0 END), 0) AS ventas_hoy,
        COALESCE(SUM(CASE WHEN DATE(fecha) = CURDATE() THEN total ELSE 0 END), 0) AS ingresos_hoy
     FROM ventas"
)->fetch_assoc();

// --------------------------------------------- productos más vendidos
$top_productos = [];
$resultado = $bd->query(
    "SELECT nombre_producto,
            SUM(cantidad) AS unidades,
            SUM(cantidad * precio_unitario) AS ingresos
     FROM detalle_ventas
     GROUP BY nombre_producto
     ORDER BY unidades DESC
     LIMIT 5"
);
while ($fila = $resultado->fetch_assoc()) {
    $top_productos[] = [
        "nombre" => (string) $fila["nombre_producto"],
        "unidades" => (int) $fila["unidades"],
        "ingresos" => (float) $fila["ingresos"]
    ];
}

// --------------------------------------------------------- stock bajo
$stock_bajo = [];
$resultado = $bd->query(
    "SELECT id, nombre, stock FROM productos
     WHERE estado <> 'eliminado' AND stock <= 2
     ORDER BY stock ASC, nombre ASC
     LIMIT 8"
);
while ($fila = $resultado->fetch_assoc()) {
    $stock_bajo[] = [
        "id" => (int) $fila["id"],
        "nombre" => (string) $fila["nombre"],
        "stock" => (int) $fila["stock"]
    ];
}

// ----------------------------------------------------- ventas recientes
$ventas_recientes = [];
$resultado = $bd->query(
    "SELECT v.folio, v.fecha, v.total, v.metodo_pago, v.estado_pedido,
            COALESCE(u.nombre, 'Invitado') AS cliente
     FROM ventas v LEFT JOIN usuarios u ON u.id = v.usuario_id
     ORDER BY v.id DESC
     LIMIT 8"
);
while ($fila = $resultado->fetch_assoc()) {
    $ventas_recientes[] = [
        "folio" => (string) $fila["folio"],
        "fecha" => (string) $fila["fecha"],
        "total" => (float) $fila["total"],
        "metodo" => (string) $fila["metodo_pago"],
        "estado" => (string) $fila["estado_pedido"],
        "cliente" => (string) $fila["cliente"]
    ];
}

cabeceras_json();
echo json_encode([
    "ok" => true,
    "totales" => [
        "totalVentas" => (int) $totales["total_ventas"],
        "ventasHoy" => (int) $totales["ventas_hoy"],
        "ingresosTotales" => (float) $totales["ingresos_totales"],
        "ingresosHoy" => (float) $totales["ingresos_hoy"],
        "ticketPromedio" => (float) $totales["ticket_promedio"]
    ],
    "topProductos" => $top_productos,
    "stockBajo" => $stock_bajo,
    "ventasRecientes" => $ventas_recientes
], JSON_UNESCAPED_UNICODE);
