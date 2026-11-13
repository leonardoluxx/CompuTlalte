<?php
// encuesta.php — Encuesta de satisfacción del sitio.
// GET  accion=estado → { ok, respondida }: ¿este visitante ya respondió?
// POST               → guarda calificacion (1-5), facilidad (1-5) y comentario.
// "Inteligente": si ya respondió (por cuenta, o por cookie en este
// navegador), el frontend deja de preguntarle. El panel la muestra al
// administrador y al gerente.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

// Cookie que marca que ESTE navegador ya respondió (para invitados; con
// cuenta se pregunta directamente a la base de datos).
const COOKIE_ENCUESTA = "computlalte_encuesta";

$metodo = $_SERVER["REQUEST_METHOD"];

// ---------------------------------------------------------- ¿ya respondió?
if ($metodo === "GET" && ($_GET["accion"] ?? "") === "estado") {
    cabeceras_json();
    header("Cache-Control: no-store");

    $respondida = false;
    $usuario = usuario_de_sesion();

    if ($usuario) {
        // Con cuenta: la respuesta quedó amarrada a su usuario_id.
        $bd = obtenerConexion();
        $consulta = $bd->prepare(
            "SELECT COUNT(*) AS t FROM resenas_sitio WHERE usuario_id = ?"
        );
        $id = (int) $usuario["id"];
        $consulta->bind_param("i", $id);
        $consulta->execute();
        $respondida = (int) $consulta->get_result()->fetch_assoc()["t"] > 0;
        $consulta->close();
    } else {
        // Invitado: la cookie del navegador lo recuerda.
        $respondida = isset($_COOKIE[COOKIE_ENCUESTA]);
    }

    echo json_encode(["ok" => true, "respondida" => $respondida], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($metodo !== "POST") {
    responder_error("Método no permitido.", 405);
}

$bd = obtenerConexion();
$cuerpo = leer_cuerpo();
csrf_exigir();
rate_limit("encuesta", 10, 60);

$calificacion = (int) ($cuerpo["calificacion"] ?? $cuerpo["estrellas"] ?? 0);
$facilidad = (int) ($cuerpo["facilidad"] ?? 0);
$comentario = trim((string) ($cuerpo["comentario"] ?? ""));

if ($calificacion < 1 || $calificacion > 5) {
    responder_error("La calificación debe ser de 1 a 5 estrellas.");
}

if ($facilidad < 0 || $facilidad > 5) {
    responder_error("La facilidad debe ser de 1 a 5.");
}

// Si hay sesión, la encuesta queda amarrada a la cuenta: la detección de
// "ya respondió" funciona aunque entre desde otro navegador.
$usuario = usuario_de_sesion();
$usuario_id = $usuario ? (int) $usuario["id"] : null;

// La facilidad y el comentario son opcionales: si no vienen, quedan vacíos.
$insertar = $bd->prepare(
    "INSERT INTO resenas_sitio (usuario_id, calificacion, facilidad, comentario) VALUES (?, ?, ?, ?)"
);
$facilidad_guardada = $facilidad > 0 ? $facilidad : null;
$insertar->bind_param("iiis", $usuario_id, $calificacion, $facilidad_guardada, $comentario);
$insertar->execute();
$insertar->close();

// Marca el navegador para que el sitio no vuelva a preguntar a este
// invitado (90 días).
setcookie(COOKIE_ENCUESTA, "1", [
    "expires" => time() + 90 * 24 * 3600,
    "path" => "/",
    "samesite" => "Lax"
]);

responder_ok(["mensaje" => "¡Gracias por tu feedback!"]);
