<?php
// csrf.php — Emite un token vigente para renovar formularios abiertos.

declare(strict_types=1);

require __DIR__ . "/_bd.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    responder_error("Método no permitido.", 405);
}

header("Cache-Control: no-store, private");
responder_ok(["csrf" => csrf_token()]);