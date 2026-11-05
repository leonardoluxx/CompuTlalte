<?php
// sesion.php — Consulta y cierre de la sesión actual.
// GET  → { ok, usuario: {...} | null, permisos: [...] }
// POST { accion: "salir" } → cierra la sesión.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {
    cabeceras_json();
    $usuario = usuario_de_sesion();

    echo json_encode([
        "ok" => true,
        "usuario" => $usuario,
        "permisos" => $usuario ? permisos_de_rol((string) $usuario["rol"]) : []
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($metodo === "POST") {
    $cuerpo = leer_cuerpo();

    if (($cuerpo["accion"] ?? "") !== "salir") {
        responder_error("Acción no reconocida.");
    }

    $_SESSION = [];
    session_destroy();
    responder_ok();
}

responder_error("Método no permitido.", 405);
