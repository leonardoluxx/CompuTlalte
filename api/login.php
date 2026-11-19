<?php
// login.php — Valida las credenciales contra la base de datos.
// Entrada:  { identificador: "correo", password: "..." }
// Salida:   { ok, usuario: {id, nombre, email, rol, ...}, permisos: [...] }
// Al validar, abre la sesión de PHP: las demás páginas la leen solas.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder_error("Método no permitido.", 405);
}

$cuerpo = leer_cuerpo();
rate_limit("login", 5, 300);
$identificador = trim((string) ($cuerpo["identificador"] ?? ""));
$password = (string) ($cuerpo["password"] ?? "");

if ($identificador === "" || $password === "") {
    responder_error("Escribe tu correo y tu contraseña.");
}

$bd = obtenerConexion();
$consulta = $bd->prepare(
    "SELECT id, nombre, email, password, rol, debe_cambiar_clave FROM usuarios WHERE email = ? LIMIT 1"
);
$consulta->bind_param("s", $identificador);
$consulta->execute();
$usuario = $consulta->get_result()->fetch_assoc();
$consulta->close();

// Si esa IP ya acumuló demasiados fallos, se corta ANTES de verificar el
// hash: el ataque no puede consumir CPU de bcrypt.
limitar_por_ip("login_fallido", 30, 60, true);

// Mensaje genérico a propósito: no se revela si el correo existe o no.
if (!$usuario || !password_verify($password, $usuario["password"])) {
    // Fuerza bruta: solo se cuentan los intentos fallidos por IP, para no
    // castigar a oficinas o redes compartidas con varios accesos válidos.
    limitar_por_ip("login_fallido", 30, 60);
    responder_error("Correo o contraseña incorrectos.", 401);
}

// Renueva el id de sesión para evitar fijación de sesión.
session_regenerate_id(true);
$_SESSION["usuario_id"] = (int) $usuario["id"];

responder_ok([
    "usuario" => [
        "id" => (int) $usuario["id"],
        "nombre" => (string) $usuario["nombre"],
        "email" => (string) $usuario["email"],
        "rol" => (string) $usuario["rol"],
        // Con contraseña temporal el frontend manda a cambiarla sí o sí.
        "debeCambiarClave" => (int) $usuario["debe_cambiar_clave"] === 1
    ],
    "permisos" => permisos_de_rol((string) $usuario["rol"])
]);
