<?php
// recuperar_password.php — Solicitud de recuperación de contraseña.
// GET  ?accion=estado&email=... → estado de la última solicitud de ese correo.
// POST { email, razon }         → crea la solicitud para que el admin la revise.
//
// Si el correo NO existe en usuarios, la solicitud también se guarda pero
// marcada como "Correo no registrado / Posible trampa" para que el
// administrador lo vea en el panel. La respuesta al visitante es siempre
// genérica: nunca se revela si la cuenta existe.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

$metodo = $_SERVER["REQUEST_METHOD"];
$bd = obtenerConexion();

// ------------------------------------------------------------ estado (GET)
if ($metodo === "GET" && ($_GET["accion"] ?? "") === "estado") {
    cabeceras_json();
    header("Cache-Control: no-store");

    $email = strtolower(trim((string) ($_GET["email"] ?? "")));
    if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["ok" => true, "solicitud" => null], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $consulta = $bd->prepare(
        "SELECT id, estado, fecha_solicitud, fecha_resolucion, clave_temporal, token
         FROM solicitudes_password WHERE email = ? ORDER BY id DESC LIMIT 1"
    );
    $consulta->bind_param("s", $email);
    $consulta->execute();
    $fila = $consulta->get_result()->fetch_assoc();
    $consulta->close();

    if (!$fila) {
        echo json_encode(["ok" => true, "solicitud" => null], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $solicitud = [
        "estado" => (string) $fila["estado"],
        "fecha" => (string) $fila["fecha_solicitud"],
        "fechaResolucion" => (string) ($fila["fecha_resolucion"] ?? "")
    ];

    // La contraseña temporal solo se entrega a quien conserva la ficha
    // secreta que se generó al crear la solicitud (comparación en tiempo
    // constante). Saber el correo no basta para leerla.
    $token_guardado = (string) ($fila["token"] ?? "");
    $token_recibido = trim((string) ($_GET["token"] ?? ""));
    $token_valido = $token_guardado !== ""
        && $token_recibido !== ""
        && hash_equals($token_guardado, $token_recibido);

    if ($token_valido && $fila["estado"] === "aprobada" && $fila["clave_temporal"] !== null) {
        $solicitud["claveTemporal"] = (string) $fila["clave_temporal"];
    }

    echo json_encode(["ok" => true, "solicitud" => $solicitud], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($metodo !== "POST") {
    responder_error("Método no permitido.", 405);
}

// ----------------------------------------------------------- alta (POST)
$cuerpo = leer_cuerpo();
csrf_exigir();
// Evita que un script pida recuperaciones en masa sin sesión.
limitar_por_ip("recuperar_password", 10, 300);
rate_limit("recuperar_password", 5, 300);

$email = strtolower(trim((string) ($cuerpo["email"] ?? "")));
$razon = trim((string) ($cuerpo["razon"] ?? ""));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder_error("Escribe un correo electrónico válido.");
}

if (strlen($razon) < 5) {
    responder_error("Cuéntanos brevemente por qué necesitas recuperar tu contraseña.");
}

if (strlen($razon) > 500) {
    $razon = substr($razon, 0, 500);
}

// ¿Existe la cuenta? La bandera se guarda para el panel, no se responde.
$consulta = $bd->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
$consulta->bind_param("s", $email);
$consulta->execute();
$existe = (bool) $consulta->get_result()->fetch_assoc();
$consulta->close();

// Una solicitud pendiente por correo: se evita llenar el panel de duplicados.
$consulta = $bd->prepare(
    "SELECT id FROM solicitudes_password
     WHERE email = ? AND estado = 'pendiente' LIMIT 1"
);
$consulta->bind_param("s", $email);
$consulta->execute();
$ya_pendiente = (bool) $consulta->get_result()->fetch_assoc();
$consulta->close();

if ($ya_pendiente) {
    // Si esta misma sesión creó la solicitud, se le devuelve su ficha para
    // que pueda recibir la contraseña temporal sin volver a pedirla.
    $token_previo = (string) ($_SESSION["recuperacion_tokens"][$email] ?? "");

    responder_ok([
        "estado" => "pendiente",
        "token" => $token_previo,
        "mensaje" => "Tu solicitud ya está pendiente. El administrador la revisará."
    ]);
}

$nota = $existe ? null : "Correo no registrado / Posible trampa";
$registrado = $existe ? 1 : 0;

// Ficha secreta de la solicitud: es la llave con la que el solicitante
// consulta el estado y recibe (solo él) la contraseña temporal aprobada.
$token_solicitud = bin2hex(random_bytes(16));

$insertar = $bd->prepare(
    "INSERT INTO solicitudes_password (email, razon, correo_registrado, nota, token)
     VALUES (?, ?, ?, ?, ?)"
);
$insertar->bind_param("ssiss", $email, $razon, $registrado, $nota, $token_solicitud);
$insertar->execute();
$insertar->close();

$_SESSION["recuperacion_tokens"][$email] = $token_solicitud;

responder_ok([
    "estado" => "pendiente",
    "token" => $token_solicitud,
    "mensaje" => "Tu solicitud ha sido enviada. El administrador la revisará y te avisaremos. No cierres sesión."
]);
