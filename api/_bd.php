<?php
// _bd.php — Utilidades compartidas por todos los endpoints de la API.
// Se incluye al inicio de cada archivo PHP de /api/.

declare(strict_types=1);

require __DIR__ . "/../conexion.php";

// ------------------------------------------------------------- sesión
// Todas las peticiones comparten la sesión de PHP (cookie PHPSESSID).
// La cookie es HttpOnly (JavaScript no puede leerla) y SameSite=Lax
// (frena CSRF entre sitios). "secure" se activa solo bajo HTTPS.
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        "httponly" => true,
        "samesite" => "Lax",
        "secure" => (($_SERVER["HTTPS"] ?? "") !== "" && $_SERVER["HTTPS"] !== "off")
    ]);
    session_start();
}

// ---------------------------------------------------------- cabeceras
// La API siempre responde JSON y solo acepta peticiones del mismo sitio.
function cabeceras_json(): void
{
    header("Content-Type: application/json; charset=utf-8");
    header("X-Content-Type-Options: nosniff");
}

// ------------------------------------------------------- cuerpo JSON
// Lee el cuerpo de la petición como JSON (fetch del frontend).
function leer_cuerpo(): array
{
    $crudo = file_get_contents("php://input");
    if ($crudo === false || trim($crudo) === "") {
        return [];
    }

    $datos = json_decode($crudo, true);
    return is_array($datos) ? $datos : [];
}

// ------------------------------------------------------- respuestas
function responder_ok(array $datos = []): never
{
    cabeceras_json();
    echo json_encode(array_merge(["ok" => true], $datos), JSON_UNESCAPED_UNICODE);
    exit;
}

function responder_error(string $mensaje, int $codigo_http = 400): never
{
    http_response_code($codigo_http);
    cabeceras_json();
    echo json_encode(["ok" => false, "mensaje" => $mensaje], JSON_UNESCAPED_UNICODE);
    exit;
}

// ---------------------------------------------------------- sesión
// Devuelve los datos del usuario con sesión abierta, o null.
function usuario_de_sesion(): ?array
{
    if (empty($_SESSION["usuario_id"])) {
        return null;
    }

    $bd = obtenerConexion();
    $consulta = $bd->prepare(
        "SELECT id, nombre, email, rol, direccion, telefono, rfc, metodo_pago
         FROM usuarios WHERE id = ? LIMIT 1"
    );
    $id = (int) $_SESSION["usuario_id"];
    $consulta->bind_param("i", $id);
    $consulta->execute();
    $usuario = $consulta->get_result()->fetch_assoc();
    $consulta->close();

    return $usuario ?: null;
}

// Permisos por rol (espejo de los que consume el panel).
function permisos_de_rol(string $rol): array
{
    $permisos = [
        "admin" => [
            "panel", "productos.ver", "precios.ver", "productos.editar", "productos.crear",
            "productos.eliminar", "imagenes.editar", "ofertas.editar", "config.editar",
            "solicitudes.ver", "solicitudes.aprobar", "usuarios.ver", "usuarios.editar"
        ],
        "gerente" => [
            "panel", "productos.ver", "precios.ver", "productos.editar", "ofertas.editar",
            "solicitudes.ver"
        ],
        "cliente" => ["comprar"]
    ];

    return $permisos[$rol] ?? $permisos["cliente"];
}

// Exige sesión con uno de los roles indicados; si no, corta con 403.
function exigir_rol(array $roles): array
{
    $usuario = usuario_de_sesion();

    if (!$usuario || !in_array($usuario["rol"], $roles, true)) {
        responder_error("No tienes permiso para esta operación.", 403);
    }

    return $usuario;
}

// ------------------------------------------------------------ bitácora
function registrar_bitacora(mysqli $bd, string $autor, string $rol, string $accion, string $detalle): void
{
    $consulta = $bd->prepare(
        "INSERT INTO bitacora (autor, rol, accion, detalle) VALUES (?, ?, ?, ?)"
    );
    $consulta->bind_param("ssss", $autor, $rol, $accion, $detalle);
    $consulta->execute();
    $consulta->close();
}

// ------------------------------------------------------- cálculo de precio
// Margen de ganancia global guardado en configuracion (35 % por regla de negocio).
function margen_global(mysqli $bd): float
{
    $resultado = $bd->query("SELECT valor FROM configuracion WHERE clave = 'margen_global' LIMIT 1");
    $fila = $resultado ? $resultado->fetch_assoc() : null;

    return $fila ? (float) $fila["valor"] : 35.0;
}

// Recalcula y guarda el precio_final de un producto con su margen efectivo.
function recalcular_precio(mysqli $bd, int $id_producto): float
{
    $consulta = $bd->prepare("SELECT costo_base, margen_propio FROM productos WHERE id = ? LIMIT 1");
    $consulta->bind_param("i", $id_producto);
    $consulta->execute();
    $producto = $consulta->get_result()->fetch_assoc();
    $consulta->close();

    if (!$producto) {
        return 0.0;
    }

    $margen = $producto["margen_propio"] !== null
        ? (float) $producto["margen_propio"]
        : margen_global($bd);
    $precio = round(((float) $producto["costo_base"]) * (1 + $margen / 100), 2);

    $actualizar = $bd->prepare("UPDATE productos SET precio_final = ? WHERE id = ?");
    $actualizar->bind_param("di", $precio, $id_producto);
    $actualizar->execute();
    $actualizar->close();

    return $precio;
}
