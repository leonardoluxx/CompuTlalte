<?php
// productos.php — API del catálogo.
// GET            → lista completa (o ?id=N para un solo producto).
// POST crear     → (admin) crea un producto nuevo.
// POST guardar   → (admin) aplica cambios al instante;
//                  (gerente) los guarda como solicitud pendiente.
// POST eliminar  → (admin) marca el producto como eliminado.
// POST restaurar → (admin) vuelve a activar un producto eliminado.

declare(strict_types=1);

require __DIR__ . "/_bd.php";
require __DIR__ . "/_datos.php";

$bd = obtenerConexion();
$metodo = $_SERVER["REQUEST_METHOD"];

// ------------------------------------------------------------ lectura
if ($metodo === "GET") {
    cabeceras_json();
    $margen = margen_global($bd);
    $visitante = usuario_de_sesion();
    $productos = filtrar_costos(
        obtener_productos($bd, $margen),
        $visitante["rol"] ?? null
    );

    if (isset($_GET["id"])) {
        $id = (int) $_GET["id"];
        foreach ($productos as $producto) {
            if ($producto["id"] === $id) {
                echo json_encode(["ok" => true, "producto" => $producto], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
        responder_error("Ese producto no existe.", 404);
    }

    echo json_encode(["ok" => true, "productos" => $productos], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($metodo !== "POST") {
    responder_error("Método no permitido.", 405);
}

$cuerpo = leer_cuerpo();
$accion = (string) ($cuerpo["accion"] ?? "");

// ------------------------------------------------------------ escritura
$usuario = usuario_de_sesion();
$rol = $usuario["rol"] ?? "";
$nombre_autor = $usuario["nombre"] ?? "Sistema";

switch ($accion) {
    case "crear":
        $usuario = exigir_rol(["admin"]);
        $datos = $cuerpo["producto"] ?? [];
        $nombre = trim((string) ($datos["nombre"] ?? ""));

        if ($nombre === "") {
            responder_error("El producto necesita un nombre.");
        }

        $categoria_id = id_de_categoria($bd, (string) ($datos["categoria"] ?? "Juegos"));
        $costo = max(0, (float) ($datos["costoBase"] ?? 0));
        $margen_global_valor = margen_global($bd);
        $margen_propio = isset($datos["margen"]) && is_numeric($datos["margen"])
            ? min(300, max(0, (float) $datos["margen"]))
            : null;
        $margen_efectivo = $margen_propio ?? $margen_global_valor;
        $precio = round($costo * (1 + $margen_efectivo / 100), 2);
        $tipo = ($datos["tipo"] ?? "computadora") === "accesorio" ? "accesorio" : "computadora";
        $stock = max(0, (int) ($datos["stock"] ?? 0));
        $terminos = json_encode(array_values((array) ($datos["terminosBusqueda"] ?? [])), JSON_UNESCAPED_UNICODE);
        $personalizacion = $tipo === "computadora"
            ? json_encode($datos["personalizacion"] ?? null, JSON_UNESCAPED_UNICODE)
            : null;

        $insertar = $bd->prepare(
            "INSERT INTO productos
                (nombre, descripcion, descripcion_corta, categoria_id, costo_base, precio_final,
                 margen_propio, imagen_url, video_url, stock, estado, marca, tipo, etiqueta,
                 destacado, en_oferta, descuento, terminos_busqueda, personalizacion)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $descripcion = (string) ($datos["descripcionLarga"] ?? "");
        $corta = (string) ($datos["especificacionesCortas"] ?? "");
        $imagen = (string) ($datos["imagenPrincipal"] ?? "");
        $video = (string) ($datos["videoUrl"] ?? "");
        $marca = (string) ($datos["marca"] ?? "");
        $etiqueta = (string) ($datos["etiqueta"] ?? "");
        $destacado = !empty($datos["destacado"]) ? 1 : 0;
        $en_oferta = !empty($datos["oferta"]["activa"]) ? 1 : 0;
        $descuento = min(95, max(0, (int) ($datos["oferta"]["descuento"] ?? 0)));
        $insertar->bind_param(
            "sssiddississsiiiss",
            $nombre, $descripcion, $corta, $categoria_id, $costo, $precio,
            $margen_propio, $imagen, $video, $stock, $marca, $tipo, $etiqueta,
            $destacado, $en_oferta, $descuento, $terminos, $personalizacion
        );
        $insertar->execute();
        $id_nuevo = (int) $bd->insert_id;
        $insertar->close();

        // Especificaciones y galería usan el mismo mapper que la edición.
        aplicar_cambios_producto($bd, $id_nuevo, $datos);

        registrar_bitacora($bd, $usuario["nombre"], $usuario["rol"], "creacion", "$nombre (creado)");
        responder_ok(["id" => $id_nuevo]);

    case "guardar":
        $usuario = exigir_rol(["admin", "gerente"]);
        $id = (int) ($cuerpo["id"] ?? 0);
        $cambios = $cuerpo["cambios"] ?? [];
        $resumen = trim((string) ($cuerpo["resumen"] ?? "Cambios en el producto"));

        // Regla de negocio: las imágenes son territorio exclusivo del
        // administrador. Si una cuenta gerente intenta colar cambios de
        // imágenes, se eliminan aquí, en el servidor, antes de diferenciar.
        if ($rol === "gerente") {
            unset($cambios["imagenesGaleria"], $cambios["imagenPrincipal"], $cambios["videoUrl"]);
        }

        $actual = producto_adaptado_por_id($bd, $id);
        if (!$actual) {
            responder_error("Ese producto ya no existe.", 404);
        }

        $diff = diferencias($actual, $cambios);
        if (!count($diff)) {
            responder_ok(["aplicado" => false, "sinCambios" => true]);
        }

        if ($rol === "admin") {
            // El administrador tiene la última palabra: aplica al instante.
            // Las imágenes son territorio exclusivo del administrador.
            aplicar_cambios_producto($bd, $id, $cambios);
            registrar_bitacora($bd, $usuario["nombre"], $rol, "edicion", "$actual[nombre]: $resumen");
            responder_ok(["aplicado" => true]);
        }

        // El gerente propone: queda pendiente hasta que el admin apruebe.
        $insertar = $bd->prepare(
            "INSERT INTO solicitudes (usuario_id, producto_id, producto_nombre, cambios, resumen)
             VALUES (?, ?, ?, ?, ?)"
        );
        $usuario_id = (int) $usuario["id"];
        $cambios_json = json_encode(["diff" => $diff], JSON_UNESCAPED_UNICODE);
        $insertar->bind_param("iisss", $usuario_id, $id, $actual["nombre"], $cambios_json, $resumen);
        $insertar->execute();
        $insertar->close();

        responder_ok(["aplicado" => false, "solicitud" => true]);

    case "eliminar":
        $usuario = exigir_rol(["admin"]);
        $id = (int) ($cuerpo["id"] ?? 0);
        $actual = producto_adaptado_por_id($bd, $id);
        if (!$actual) {
            responder_error("Ese producto ya no existe.", 404);
        }

        $consulta = $bd->prepare("UPDATE productos SET estado = 'eliminado' WHERE id = ?");
        $consulta->bind_param("i", $id);
        $consulta->execute();
        $consulta->close();

        registrar_bitacora($bd, $usuario["nombre"], $rol, "eliminacion", (string) $actual["nombre"]);
        responder_ok();

    case "restaurar":
        $usuario = exigir_rol(["admin"]);
        $id = (int) ($cuerpo["id"] ?? 0);

        $consulta = $bd->prepare("UPDATE productos SET estado = 'activo' WHERE id = ?");
        $consulta->bind_param("i", $id);
        $consulta->execute();
        $consulta->close();

        registrar_bitacora($bd, $usuario["nombre"], $rol, "restauracion", "Producto $id restaurado");
        responder_ok();

    default:
        responder_error("Acción no reconocida.");
}
