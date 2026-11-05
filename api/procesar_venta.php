<?php
// procesar_venta.php — Registra la venta en la base de datos.
// Entrada:  { items: [{ id, cantidad, opciones: [{grupo, valor}] }],
//             metodoPago: "tarjeta"|"transferencia", referencia?, rfc?, cupon? }
// Reglas de integridad (el servidor nunca confía en el cliente):
//  · El precio unitario se recalcula desde la BD (precio_final + extras).
//  · Los extras se validan contra las opciones guardadas del producto.
//  · El cupón se valida en la BD antes de aplicarse.
//  · Todo ocurre en una transacción: venta + detalles + descuento de stock.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder_error("Método no permitido.", 405);
}

$cuerpo = leer_cuerpo();
$items = $cuerpo["items"] ?? [];
$metodo = (string) ($cuerpo["metodoPago"] ?? "");
$referencia = trim((string) ($cuerpo["referencia"] ?? ""));
$rfc = trim((string) ($cuerpo["rfc"] ?? ""));
$direccion = trim((string) ($cuerpo["direccion"] ?? ""));
$codigo_cupon = strtoupper(trim((string) ($cuerpo["cupon"] ?? "")));

if (!is_array($items) || !count($items)) {
    responder_error("El carrito está vacío.");
}
if (!in_array($metodo, ["tarjeta", "transferencia"], true)) {
    responder_error("Método de pago no válido.");
}

$usuario = usuario_de_sesion();
$bd = obtenerConexion();

// Folio legible: CTL-20261104-AB3F
function generar_folio(): string
{
    return "CTL-" . date("Ymd") . "-" . strtoupper(bin2hex(random_bytes(2)));
}

$bd->begin_transaction();

try {
    $total = 0.0;
    $lineas = []; // [producto_id, nombre_snapshot, cantidad, precio_unitario]

    $consulta_producto = $bd->prepare(
        "SELECT nombre, precio_final, en_oferta, descuento, stock, estado, personalizacion
         FROM productos WHERE id = ? LIMIT 1 FOR UPDATE"
    );

    foreach ($items as $item) {
        $id = (int) ($item["id"] ?? 0);
        $cantidad = min(99, max(1, (int) ($item["cantidad"] ?? 1)));
        $opciones_enviadas = is_array($item["opciones"] ?? null) ? $item["opciones"] : [];

        if ($id <= 0) {
            throw new RuntimeException("Hay un artículo sin identificador de producto.");
        }

        $consulta_producto->bind_param("i", $id);
        $consulta_producto->execute();
        $producto = $consulta_producto->get_result()->fetch_assoc();

        if (!$producto) {
            throw new RuntimeException("Un producto del carrito ya no existe.");
        }
        if ($producto["estado"] === "eliminado") {
            throw new RuntimeException("\"{$producto["nombre"]}\" ya no está disponible.");
        }
        if ((int) $producto["stock"] < $cantidad) {
            throw new RuntimeException("No hay stock suficiente de \"{$producto["nombre"]}\".");
        }

        // Precio base: el guardado en la BD (ya incluye el margen) menos
        // la oferta vigente del producto, igual que ve el carrito.
        $unitario = (float) $producto["precio_final"];
        if (((int) $producto["en_oferta"]) === 1) {
            $descuento_producto = min(95, max(0, (int) $producto["descuento"]));
            if ($descuento_producto > 0) {
                $unitario = round($unitario * (1 - $descuento_producto / 100), 2);
            }
        }
        $etiquetas_elegidas = [];

        // Extras de personalización validados contra lo guardado en la BD.
        $grupos = json_decode((string) ($producto["personalizacion"] ?? "null"), true);
        if (is_array($grupos)) {
            foreach ($grupos as $grupo) {
                $valor_enviado = null;
                foreach ($opciones_enviadas as $opcion) {
                    if (($opcion["grupo"] ?? "") === ($grupo["grupo"] ?? "")) {
                        $valor_enviado = (string) ($opcion["valor"] ?? "");
                        break;
                    }
                }

                $elegida = null;
                foreach (($grupo["opciones"] ?? []) as $opcion_bd) {
                    if ($valor_enviado !== null && ($opcion_bd["valor"] ?? "") === $valor_enviado) {
                        $elegida = $opcion_bd;
                        break;
                    }
                }

                // Sin opción enviada (o inválida) se usa la primera (incluida).
                if (!$elegida) {
                    $elegida = $grupo["opciones"][0] ?? null;
                }
                if (!$elegida) {
                    continue;
                }

                $unitario += (float) ($elegida["extra"] ?? 0);
                $etiquetas_elegidas[] = (string) ($elegida["etiqueta"] ?? "");
            }
        }

        $unitario = round($unitario, 2);
        $total += $unitario * $cantidad;

        $nombre_snapshot = $producto["nombre"];
        $descripcion_texto = trim((string) ($item["descripcion"] ?? ""));
        if ($descripcion_texto === "" && count($etiquetas_elegidas)) {
            $descripcion_texto = implode(", ", $etiquetas_elegidas);
        }
        if ($descripcion_texto !== "") {
            $nombre_snapshot .= " — " . $descripcion_texto;
        }

        $lineas[] = [$id, $nombre_snapshot, $cantidad, $unitario];
    }
    $consulta_producto->close();

    // Cupón: solo cuenta si existe y está activo.
    $cupon_aplicado = null;
    if ($codigo_cupon !== "") {
        $consulta = $bd->prepare(
            "SELECT codigo, descuento_porcentaje FROM cupones WHERE codigo = ? AND activo = 1 LIMIT 1"
        );
        $consulta->bind_param("s", $codigo_cupon);
        $consulta->execute();
        $cupon = $consulta->get_result()->fetch_assoc();
        $consulta->close();

        if (!$cupon) {
            throw new RuntimeException("El cupón \"$codigo_cupon\" no existe o ya no está activo.");
        }

        $cupon_aplicado = $cupon["codigo"];
        $total = round($total * (1 - ((int) $cupon["descuento_porcentaje"]) / 100), 2);
    }

    $total = round($total, 2);
    $folio = generar_folio();
    $estado = $metodo === "tarjeta" ? "pagado" : "pendiente";
    $usuario_id = $usuario ? (int) $usuario["id"] : null;

    // Cabecera de la venta.
    $insertar_venta = $bd->prepare(
        "INSERT INTO ventas (folio, usuario_id, total, metodo_pago, referencia_pago, rfc_factura,
                             direccion_envio, cupon, estado_pedido)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    // Tipos: folio s · usuario_id i · total d · resto s (7 campos de texto).
    $insertar_venta->bind_param(
        "sidssssss",
        $folio, $usuario_id, $total, $metodo, $referencia, $rfc, $direccion, $cupon_aplicado, $estado
    );
    $insertar_venta->execute();
    $venta_id = (int) $bd->insert_id;
    $insertar_venta->close();

    // Renglones de la venta.
    $insertar_detalle = $bd->prepare(
        "INSERT INTO detalle_ventas (venta_id, producto_id, nombre_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?, ?)"
    );
    $actualizar_stock = $bd->prepare(
        "UPDATE productos SET stock = stock - ? WHERE id = ?"
    );
    $marcar_agotado = $bd->prepare(
        "UPDATE productos SET estado = 'agotado' WHERE id = ? AND stock = 0 AND estado = 'activo'"
    );

    foreach ($lineas as [$id, $nombre_snapshot, $cantidad, $unitario]) {
        $insertar_detalle->bind_param("iisid", $venta_id, $id, $nombre_snapshot, $cantidad, $unitario);
        $insertar_detalle->execute();

        $actualizar_stock->bind_param("ii", $cantidad, $id);
        $actualizar_stock->execute();

        $marcar_agotado->bind_param("i", $id);
        $marcar_agotado->execute();
    }
    $insertar_detalle->close();
    $actualizar_stock->close();
    $marcar_agotado->close();

    // La preferencia de método de pago se actualiza en la cuenta.
    if ($usuario) {
        $actualizar_metodo = $bd->prepare("UPDATE usuarios SET metodo_pago = ? WHERE id = ?");
        $actualizar_metodo->bind_param("si", $metodo, $usuario_id);
        $actualizar_metodo->execute();
        $actualizar_metodo->close();
    }

    $bd->commit();

    registrar_bitacora(
        $bd,
        $usuario["nombre"] ?? "Invitado",
        $usuario["rol"] ?? "cliente",
        "venta",
        "Venta $folio por $total MXN (" . count($lineas) . " renglones)"
    );

    responder_ok([
        "folio" => $folio,
        "total" => $total,
        "estado" => $estado,
        "cupon" => $cupon_aplicado
    ]);
} catch (Throwable $error) {
    $bd->rollback();
    responder_error($error->getMessage(), 409);
}
