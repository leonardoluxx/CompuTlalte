<?php
// cuenta.php — Perfil y pedidos de la cuenta, leídos de la base de datos.
// GET                → { perfil, pedidos }
// POST accion=datos  → actualiza nombre, email, dirección, teléfono y RFC.
// POST accion=clave  → cambia la contraseña (verificando la actual).
// POST accion=metodo → guarda la preferencia de método de pago.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

$metodo_http = $_SERVER["REQUEST_METHOD"];
$usuario = usuario_de_sesion();

if (!$usuario) {
    responder_error("Tu sesión terminó. Inicia sesión de nuevo.", 401);
}

$bd = obtenerConexion();
$id = (int) $usuario["id"];

// ---------------------------------------------------------------- lectura
if ($metodo_http === "GET") {
    cabeceras_json();

    // Pedidos de la cuenta: ventas + renglones, en el formato que la
    // página de "Mis pedidos" ya dibuja.
    $pedidos = [];
    $consulta = $bd->prepare(
        "SELECT id, folio, fecha, total, metodo_pago, estado_pedido
         FROM ventas WHERE usuario_id = ? ORDER BY id DESC LIMIT 40"
    );
    $consulta->bind_param("i", $id);
    $consulta->execute();
    $resultado = $consulta->get_result();

    $consulta_detalle = $bd->prepare(
        "SELECT d.nombre_producto, d.cantidad, d.precio_unitario, p.imagen_url
         FROM detalle_ventas d LEFT JOIN productos p ON p.id = d.producto_id
         WHERE d.venta_id = ? ORDER BY d.id"
    );

    while ($venta = $resultado->fetch_assoc()) {
        $venta_id = (int) $venta["id"];
        $consulta_detalle->bind_param("i", $venta_id);
        $consulta_detalle->execute();
        $resultado_detalle = $consulta_detalle->get_result();

        $productos = [];
        $articulos = 0;
        while ($detalle = $resultado_detalle->fetch_assoc()) {
            $cantidad = (int) $detalle["cantidad"];
            $articulos += $cantidad;
            $productos[] = [
                "nombre" => (string) $detalle["nombre_producto"],
                "cantidad" => $cantidad,
                "precio" => (float) $detalle["precio_unitario"],
                "imagen" => (string) ($detalle["imagen_url"] ?? "")
            ];
        }

        $pedidos[] = [
            "folio" => (string) $venta["folio"],
            "fecha" => (string) $venta["fecha"],
            "total" => (float) $venta["total"],
            "metodo" => (string) $venta["metodo_pago"],
            "estado" => (string) $venta["estado_pedido"],
            "articulos" => $articulos,
            "productos" => $productos
        ];
    }
    $consulta_detalle->close();
    $consulta->close();

    echo json_encode([
        "ok" => true,
        "perfil" => [
            "nombre" => (string) $usuario["nombre"],
            "email" => (string) $usuario["email"],
            "direccion" => (string) ($usuario["direccion"] ?? ""),
            "telefono" => (string) ($usuario["telefono"] ?? ""),
            "rfc" => (string) ($usuario["rfc"] ?? ""),
            "metodoPago" => (string) ($usuario["metodo_pago"] ?? "")
        ],
        "pedidos" => $pedidos
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------- escritura
if ($metodo_http !== "POST") {
    responder_error("Método no permitido.", 405);
}

$cuerpo = leer_cuerpo();
$accion = (string) ($cuerpo["accion"] ?? "");
csrf_exigir();
rate_limit("cuenta", 30, 60);

switch ($accion) {
    case "datos":
        $nombre = trim((string) ($cuerpo["nombre"] ?? ""));
        $email = trim((string) ($cuerpo["email"] ?? ""));
        $direccion = trim((string) ($cuerpo["direccion"] ?? ""));
        $telefono = trim((string) ($cuerpo["telefono"] ?? ""));
        $rfc = strtoupper(trim((string) ($cuerpo["rfc"] ?? "")));

        if ($nombre === "") {
            responder_error("Escribe tu nombre completo.");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            responder_error("Escribe un correo válido.");
        }
        if ($rfc !== "" && !preg_match("/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/", $rfc)) {
            responder_error("El RFC no tiene un formato válido.");
        }

        // El correo es único: se comprueba contra otras cuentas.
        $consulta = $bd->prepare("SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1");
        $consulta->bind_param("si", $email, $id);
        $consulta->execute();
        if ($consulta->get_result()->fetch_assoc()) {
            $consulta->close();
            responder_error("Ese correo ya lo usa otra cuenta.");
        }
        $consulta->close();

        $actualizar = $bd->prepare(
            "UPDATE usuarios SET nombre = ?, email = ?, direccion = ?, telefono = ?, rfc = ? WHERE id = ?"
        );
        $actualizar->bind_param("sssssi", $nombre, $email, $direccion, $telefono, $rfc, $id);
        $actualizar->execute();
        $actualizar->close();

        // El correo cambia la llave de la sesión guardada.
        $_SESSION["usuario_id"] = $id;

        registrar_bitacora($bd, $nombre, $usuario["rol"], "cuenta", "Datos personales actualizados");
        responder_ok(["mensaje" => "Tus datos se guardaron correctamente."]);

    case "clave":
        $actual = (string) ($cuerpo["actual"] ?? "");
        $nueva = (string) ($cuerpo["nueva"] ?? "");

        if (strlen($nueva) < 8) {
            responder_error("La nueva contraseña debe tener al menos 8 caracteres.");
        }

        $consulta = $bd->prepare("SELECT password FROM usuarios WHERE id = ? LIMIT 1");
        $consulta->bind_param("i", $id);
        $consulta->execute();
        $hash_actual = (string) ($consulta->get_result()->fetch_assoc()["password"] ?? "");
        $consulta->close();

        if (!password_verify($actual, $hash_actual)) {
            responder_error("Tu contraseña actual no es correcta.");
        }

        $hash_nuevo = password_hash($nueva, PASSWORD_DEFAULT);
        $actualizar = $bd->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
        $actualizar->bind_param("si", $hash_nuevo, $id);
        $actualizar->execute();
        $actualizar->close();

        registrar_bitacora($bd, $usuario["nombre"], $usuario["rol"], "cuenta", "Contraseña actualizada");
        responder_ok(["mensaje" => "Tu contraseña se actualizó correctamente."]);

    case "metodo":
        $metodo = (string) ($cuerpo["metodo"] ?? "");
        if (!in_array($metodo, ["transferencia", "tarjeta"], true)) {
            responder_error("Método de pago no válido.");
        }

        $actualizar = $bd->prepare("UPDATE usuarios SET metodo_pago = ? WHERE id = ?");
        $actualizar->bind_param("si", $metodo, $id);
        $actualizar->execute();
        $actualizar->close();

        responder_ok();

    default:
        responder_error("Acción no reconocida.");
}
