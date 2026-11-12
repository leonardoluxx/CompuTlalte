<?php
// _compat.php — Capa de compatibilidad entre versiones de PHP.
// -----------------------------------------------------------------
// El proyecto tiene que correr igual en el XAMPP viejo de una escuela
// (PHP 7.1 - 7.3) y en uno recién descargado (PHP 8.x). Aquí se concentra
// lo poquito que cambia entre versiones, en lugar de repartir comprobaciones
// por todos los archivos.
//
// Regla del proyecto: nada de sintaxis posterior a PHP 7.1.
//   ✗ funciones flecha  fn() =>      (PHP 7.4)
//   ✗ tipo never                     (PHP 8.1)
//   ✗ str_contains / str_starts_with (PHP 8.0)
//   ✓ ?? , ?tipo , : void            (PHP 7.0 / 7.1)

declare(strict_types=1);

// Versión mínima soportada. Se compara contra PHP_VERSION_ID (entero).
const PHP_VERSION_MINIMA = "7.1.0";
const PHP_VERSION_MINIMA_ID = 70100;

// ¿Este servidor puede ejecutar el proyecto?
function php_compatible(): bool
{
    return PHP_VERSION_ID >= PHP_VERSION_MINIMA_ID;
}

// Etiqueta corta de la versión detectada, para mostrarla en diagnósticos.
function php_resumen(): string
{
    if (PHP_VERSION_ID >= 80000) {
        return "PHP " . PHP_VERSION . " (moderno)";
    }

    if (PHP_VERSION_ID >= 70400) {
        return "PHP " . PHP_VERSION . " (compatible)";
    }

    return "PHP " . PHP_VERSION . " (modo compatibilidad)";
}

// Si el servidor es demasiado antiguo, se detiene con un mensaje entendible
// en lugar de dejar un error de sintaxis a media página.
function exigir_php_compatible(): void
{
    if (php_compatible()) {
        return;
    }

    http_response_code(500);
    header("Content-Type: text/plain; charset=utf-8");
    echo "Este proyecto necesita PHP " . PHP_VERSION_MINIMA . " o superior.\n\n";
    echo "Este servidor tiene PHP " . PHP_VERSION . ".\n\n";
    echo "Actualiza XAMPP desde https://www.apachefriends.org o instala una\n";
    echo "versión más reciente de PHP y vuelve a intentarlo.\n";
    echo "Puedes ver el diagnóstico completo en instalacion/requisitos.php";
    exit;
}

// Cookie de sesión con HttpOnly + SameSite=Lax.
// La forma con array existe desde PHP 7.3; en versiones anteriores se pasan
// los mismos valores como argumentos sueltos (con el truco oficial de
// escribir "samesite" dentro del path).
function configurar_cookie_sesion(): void
{
    $https = (($_SERVER["HTTPS"] ?? "") !== "" && $_SERVER["HTTPS"] !== "off");

    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            "httponly" => true,
            "samesite" => "Lax",
            "secure" => $https
        ]);
        return;
    }

    session_set_cookie_params(0, "/; samesite=Lax", "", $https, true);
}
