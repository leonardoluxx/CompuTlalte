<?php
// registro.php — Crea cuentas nuevas de clientes en la base de datos.
// Entrada:  { nombre, email, direccion, password, metodoPago? }
// El registro de la tienda siempre crea clientes; los roles se asignan
// desde el panel por el administrador.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder_error("Método no permitido.", 405);
}

$cuerpo = leer_cuerpo();
$nombre = trim((string) ($cuerpo["nombre"] ?? ""));
$email = trim((string) ($cuerpo["email"] ?? ""));
$direccion = trim((string) ($cuerpo["direccion"] ?? ""));
$password = (string) ($cuerpo["password"] ?? "");
$metodo = (string) ($cuerpo["metodoPago"] ?? "");
$metodo = in_array($metodo, ["transferencia", "tarjeta"], true) ? $metodo : null;

if ($nombre === "") {
    responder_error("Escribe tu nombre.");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder_error("Escribe un correo válido.");
}
if ($direccion === "") {
    responder_error("Escribe tu dirección.");
}
if (strlen($password) < 8) {
    responder_error("La contraseña debe tener al menos 8 caracteres.");
}

$bd = obtenerConexion();

// El correo es único: se comprueba antes de insertar.
$consulta = $bd->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
$consulta->bind_param("s", $email);
$consulta->execute();
if ($consulta->get_result()->fetch_assoc()) {
    $consulta->close();
    responder_error("Este correo ya está registrado.");
}
$consulta->close();

$hash = password_hash($password, PASSWORD_DEFAULT);
$insertar = $bd->prepare(
    "INSERT INTO usuarios (nombre, email, password, rol, direccion, metodo_pago)
     VALUES (?, ?, ?, 'cliente', ?, ?)"
);
$insertar->bind_param("sssss", $nombre, $email, $hash, $direccion, $metodo);
$insertar->execute();
$insertar->close();

registrar_bitacora($bd, $nombre, "cliente", "registro", "Nueva cuenta: $email");

responder_ok(["mensaje" => "Cuenta registrada con éxito. Ahora puedes iniciar sesión."]);
