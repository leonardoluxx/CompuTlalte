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
        "SELECT estado, fecha_solicitud, fecha_resolucion
         FROM solicitudes_password WHERE email = ? ORDER BY id DESC LIMIT 1"
    );
    $consulta->bind_param("s", $email);
    $consulta->execute();
    $fila = $consulta->get_result()->fetch_assoc();
    $consulta->close();

    echo json_encode([
        "ok" => true,
        "solicitud" => $fila ? [
            "estado" => (string) $fila["estado"],
            "fecha" => (string) $fila["fecha_solicitud"],
            "fechaResolucion" => (string) ($fila["fecha_resolucion"] ?? "")
        ] : null
    ], JSON_UNESCAPED_UNICODE);
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
    responder_ok([
        "estado" => "pendiente",
        "mensaje" => "Tu solicitud ya está pendiente. El administrador la revisará."
    ]);
}

$nota = $existe ? null : "Correo no registrado / Posible trampa";
$registrado = $existe ? 1 : 0;

$insertar = $bd->prepare(
    "INSERT INTO solicitudes_password (email, razon, correo_registrado, nota)
     VALUES (?, ?, ?, ?)"
);
$insertar->bind_param("ssis", $email, $razon, $registrado, $nota);
$insertar->execute();
$insertar->close();

responder_ok([
    "estado" => "pendiente",
    "mensaje" => "Tu solicitud ha sido enviada. El administrador la revisará y te avisaremos. No cierres sesión."
]);
