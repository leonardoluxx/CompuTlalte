<?php
// prueba-conexion.php — Comprueba la cadena completa Apache + PHP + MySQL.
// Si todo está bien imprime "Conexión exitosa" con los datos del servidor.

require __DIR__ . "/conexion.php";

try {
    $conexion = obtenerConexion();

    $resultado = $conexion->query("SELECT VERSION() AS version, DATABASE() AS base");
    $fila = $resultado->fetch_assoc();

    echo "Conexión exitosa";
    echo "<br>Servidor: MariaDB " . htmlspecialchars($fila["version"], ENT_QUOTES, "UTF-8");
    echo "<br>Base de datos: " . htmlspecialchars($fila["base"], ENT_QUOTES, "UTF-8");
    echo "<br>Charset: " . htmlspecialchars($conexion->character_set_name(), ENT_QUOTES, "UTF-8");
} catch (Throwable $error) {
    http_response_code(500);
    echo "Error de conexión: " . htmlspecialchars($error->getMessage(), ENT_QUOTES, "UTF-8");
}
