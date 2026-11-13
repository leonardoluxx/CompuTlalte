<?php
// _datos.php — Construye el "paquete de datos" que consume el frontend.
// Lo usan bootstrap.php (lo emite como JavaScript) y datos.php (como JSON).
// El formato de cada producto es EXACTAMENTE el que la interfaz ya consume,
// así que las tarjetas, el buscador y los modales no se rehacen.

declare(strict_types=1);

// Convierte una fila de la BD al formato del frontend.
// $resenas trae el conteo y promedio REALES de la tabla resenas_productos
// (agrupados por producto_id); las reseñas nunca se inventan en el código.
function adaptar_producto(array $fila, array $especificaciones, array $imagenes, float $margen_global, array $resenas = []): array
{
    $margen_propio = $fila["margen_propio"] !== null ? (float) $fila["margen_propio"] : null;
    $margen_aplicado = $margen_propio ?? $margen_global;
    $precio_lista = (float) $fila["precio_final"];
    $descuento = ((int) ($fila["en_oferta"] ?? 0)) === 1
        ? min(95, max(0, (int) $fila["descuento"]))
        : 0;
    $precio_venta = $descuento > 0
        ? round($precio_lista * (1 - $descuento / 100), 2)
        : $precio_lista;

    $resenas_producto = $resenas[(int) $fila["id"]] ?? null;

    return [
        "id" => (int) $fila["id"],
        "nombre" => (string) $fila["nombre"],
        "marca" => (string) ($fila["marca"] ?? ""),
        "categoria" => (string) ($fila["categoria_nombre"] ?? ""),
        "tipo" => (string) $fila["tipo"],
        "etiqueta" => (string) ($fila["etiqueta"] ?? ""),
        "disponible" => $fila["estado"] === "activo" && (int) $fila["stock"] > 0,
        "estado" => (string) $fila["estado"],
        "stock" => (int) $fila["stock"],
        "destacado" => ((int) $fila["destacado"]) === 1,
        // El frontend usa la llave con ñ; se envía tal cual.
        "reseñas" => $resenas_producto ? (int) $resenas_producto["total"] : 0,
        "promedioResenas" => $resenas_producto ? round((float) $resenas_producto["promedio"], 1) : 0,
        "vendidos" => (int) ($fila["vendidos"] ?? 0),
        "fechaAlta" => (string) ($fila["fecha_alta"] ?? ""),
        "costoBase" => (float) $fila["costo_base"],
        "margen" => $margen_propio,
        "margenAplicado" => $margen_aplicado,
        // Precio de lista: viene YA calculado desde la BD (regla de negocio).
        "precioLista" => $precio_lista,
        "descuento" => $descuento,
        "precioVenta" => $precio_venta,
        "oferta" => [
            "activa" => ((int) ($fila["en_oferta"] ?? 0)) === 1,
            "descuento" => $descuento
        ],
        "descripcionLarga" => (string) ($fila["descripcion"] ?? ""),
        "especificacionesCortas" => (string) ($fila["descripcion_corta"] ?? ""),
        "caracteristicasClave" => $especificaciones["clave"] ?? [],
        "especificacionesTecnicas" => $especificaciones["tecnica"] ?? [],
        "imagenPrincipal" => (string) ($fila["imagen_url"] ?? ""),
        "imagenesGaleria" => $imagenes,
        "terminosBusqueda" => json_decode((string) ($fila["terminos_busqueda"] ?? "[]"), true) ?: [],
        "personalizacion" => json_decode((string) ($fila["personalizacion"] ?? "null"), true),
        "videoUrl" => (string) ($fila["video_url"] ?? ""),
        "creado" => (string) $fila["creado"],
        "actualizado" => (string) $fila["actualizado"]
    ];
}

// Consulta el catálogo completo y lo devuelve adaptado.
function obtener_productos(mysqli $bd, float $margen_global): array
{
    $filas = [];
    $resultado = $bd->query(
        "SELECT p.*, c.nombre AS categoria_nombre
         FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
         ORDER BY p.id"
    );
    while ($fila = $resultado->fetch_assoc()) {
        $filas[(int) $fila["id"]] = $fila;
    }

    // Reseñas REALES por producto (conteo y promedio de calificaciones).
    // Una sola consulta agrupada alimenta a todo el catálogo.
    $resenas = [];
    $resultado = $bd->query(
        "SELECT producto_id, COUNT(*) AS total, AVG(calificacion) AS promedio
         FROM resenas_productos GROUP BY producto_id"
    );
    while ($fila = $resultado->fetch_assoc()) {
        $resenas[(int) $fila["producto_id"]] = $fila;
    }

    // Especificaciones agrupadas por producto y tipo (una sola consulta).
    $especificaciones = [];
    $resultado = $bd->query(
        "SELECT producto_id, tipo, descripcion FROM especificaciones
         ORDER BY producto_id, id"
    );
    while ($fila = $resultado->fetch_assoc()) {
        $especificaciones[(int) $fila["producto_id"]][$fila["tipo"]][] = $fila["descripcion"];
    }

    // Galería ordenada por posición (la 1 es la principal).
    $imagenes = [];
    $resultado = $bd->query(
        "SELECT producto_id, url FROM imagenes_producto ORDER BY producto_id, posicion, id"
    );
    while ($fila = $resultado->fetch_assoc()) {
        $imagenes[(int) $fila["producto_id"]][] = $fila["url"];
    }

    $adaptados = [];
    foreach ($filas as $id => $fila) {
        $adaptados[] = adaptar_producto(
            $fila,
            $especificaciones[$id] ?? [],
            $imagenes[$id] ?? [],
            $margen_global,
            $resenas
        );
    }

    return $adaptados;
}

// ===================================================== escritura de productos
// Mapper inverso: toma cambios en formato frontend y los aplica a la BD.
// Solo toca las llaves presentes, así sirve para el editor completo del
// panel y para las solicitudes parciales del gerente.

// Busca el id de una categoría por nombre; la crea si no existe.
function id_de_categoria(mysqli $bd, string $nombre): ?int
{
    $nombre = trim($nombre);
    if ($nombre === "") {
        return null;
    }

    $consulta = $bd->prepare("SELECT id FROM categorias WHERE nombre = ? LIMIT 1");
    $consulta->bind_param("s", $nombre);
    $consulta->execute();
    $fila = $consulta->get_result()->fetch_assoc();
    $consulta->close();

    if ($fila) {
        return (int) $fila["id"];
    }

    $insertar = $bd->prepare("INSERT INTO categorias (nombre) VALUES (?)");
    $insertar->bind_param("s", $nombre);
    $insertar->execute();
    $insertar->close();

    return (int) $bd->insert_id;
}

// Aplica al producto los campos que vengan en $cambios (formato frontend).
function aplicar_cambios_producto(mysqli $bd, int $id, array $cambios): void
{
    $columnas_texto = [
        "nombre" => "nombre",
        "marca" => "marca",
        "tipo" => "tipo",
        "etiqueta" => "etiqueta",
        "descripcionLarga" => "descripcion",
        "especificacionesCortas" => "descripcion_corta",
        "imagenPrincipal" => "imagen_url",
        "videoUrl" => "video_url"
    ];

    $asignaciones = [];
    $tipos = "";
    $valores = [];

    foreach ($columnas_texto as $campo => $columna) {
        if (array_key_exists($campo, $cambios)) {
            $asignaciones[] = "$columna = ?";
            $tipos .= "s";
            $valores[] = (string) $cambios[$campo];
        }
    }

    if (array_key_exists("costoBase", $cambios)) {
        $asignaciones[] = "costo_base = ?";
        $tipos .= "d";
        $valores[] = max(0, (float) $cambios["costoBase"]);
    }

    if (array_key_exists("margen", $cambios)) {
        $margen = $cambios["margen"];
        $asignaciones[] = "margen_propio = ?";
        $tipos .= "d";
        $valores[] = ($margen === null || $margen === "" || !is_numeric($margen))
            ? null
            : min(300, max(0, (float) $margen));
    }

    if (array_key_exists("stock", $cambios)) {
        $asignaciones[] = "stock = ?";
        $tipos .= "i";
        $valores[] = max(0, (int) $cambios["stock"]);
    }

    if (array_key_exists("destacado", $cambios)) {
        $asignaciones[] = "destacado = ?";
        $tipos .= "i";
        $valores[] = !empty($cambios["destacado"]) ? 1 : 0;
    }

    if (array_key_exists("oferta", $cambios) && is_array($cambios["oferta"])) {
        $oferta = $cambios["oferta"];
        $asignaciones[] = "en_oferta = ?, descuento = ?";
        $tipos .= "ii";
        $valores[] = !empty($oferta["activa"]) ? 1 : 0;
        $valores[] = min(95, max(0, (int) ($oferta["descuento"] ?? 0)));
    }

    if (array_key_exists("disponible", $cambios)) {
        // Disponible/agotado solo afecta al estado si no está eliminado.
        $consulta = $bd->prepare("SELECT estado FROM productos WHERE id = ? LIMIT 1");
        $consulta->bind_param("i", $id);
        $consulta->execute();
        $estado_actual = (string) ($consulta->get_result()->fetch_assoc()["estado"] ?? "activo");
        $consulta->close();

        if ($estado_actual !== "eliminado") {
            $asignaciones[] = "estado = ?";
            $tipos .= "s";
            $valores[] = !empty($cambios["disponible"]) ? "activo" : "agotado";
        }
    }

    if (array_key_exists("categoria", $cambios)) {
        $categoria_id = id_de_categoria($bd, (string) $cambios["categoria"]);
        $asignaciones[] = "categoria_id = ?";
        $tipos .= "i";
        $valores[] = $categoria_id;
    }

    if (array_key_exists("terminosBusqueda", $cambios)) {
        $asignaciones[] = "terminos_busqueda = ?";
        $tipos .= "s";
        $valores[] = json_encode(array_values((array) $cambios["terminosBusqueda"]), JSON_UNESCAPED_UNICODE);
    }

    if (count($asignaciones)) {
        $sql = "UPDATE productos SET " . implode(", ", $asignaciones) . " WHERE id = ?";
        $tipos .= "i";
        $valores[] = $id;

        $consulta = $bd->prepare($sql);
        $consulta->bind_param($tipos, ...$valores);
        $consulta->execute();
        $consulta->close();
    }

    // Especificaciones: se reemplazan completas si venían en los cambios.
    foreach (
        [
            "caracteristicasClave" => "clave",
            "especificacionesTecnicas" => "tecnica"
        ] as $campo => $tipo_esp
    ) {
        if (!array_key_exists($campo, $cambios) || !is_array($cambios[$campo])) {
            continue;
        }

        $borrar = $bd->prepare("DELETE FROM especificaciones WHERE producto_id = ? AND tipo = ?");
        $borrar->bind_param("is", $id, $tipo_esp);
        $borrar->execute();
        $borrar->close();

        $insertar = $bd->prepare(
            "INSERT INTO especificaciones (producto_id, tipo, descripcion) VALUES (?, ?, ?)"
        );
        foreach ($cambios[$campo] as $texto) {
            $linea = trim((string) $texto);
            if ($linea === "") {
                continue;
            }
            $insertar->bind_param("iss", $id, $tipo_esp, $linea);
            $insertar->execute();
        }
        $insertar->close();
    }

    // Galería: se reemplaza completa; la posición 1 es la imagen principal.
    if (array_key_exists("imagenesGaleria", $cambios) && is_array($cambios["imagenesGaleria"])) {
        $borrar = $bd->prepare("DELETE FROM imagenes_producto WHERE producto_id = ?");
        $borrar->bind_param("i", $id);
        $borrar->execute();
        $borrar->close();

        $insertar = $bd->prepare(
            "INSERT INTO imagenes_producto (producto_id, url, posicion) VALUES (?, ?, ?)"
        );
        $posicion = 1;
        foreach ($cambios["imagenesGaleria"] as $url) {
            $url_limpia = trim((string) $url);
            if ($url_limpia === "") {
                continue;
            }
            $insertar->bind_param("isi", $id, $url_limpia, $posicion);
            $insertar->execute();
            $posicion++;
        }
        $insertar->close();
    }

    // El precio final siempre se recalcula en el servidor (costo + margen).
    recalcular_precio($bd, $id);
}

// Carga un producto en formato frontend (para diffs y respuestas).
function producto_adaptado_por_id(mysqli $bd, int $id): ?array
{
    foreach (obtener_productos($bd, margen_global($bd)) as $producto) {
        if ($producto["id"] === $id) {
            return $producto;
        }
    }
    return null;
}

// Diferencias campo por campo entre lo enviado y lo guardado.
function diferencias(array $actual, array $cambios): array
{
    $diff = [];
    foreach ($cambios as $campo => $despues) {
        $antes = array_key_exists($campo, $actual) ? $actual[$campo] : null;
        if (json_encode($antes) !== json_encode($despues)) {
            $diff[$campo] = ["antes" => $antes, "despues" => $despues];
        }
    }
    return $diff;
}

// Regla de negocio: el costo base y los márgenes solo los ven admin y
// gerente. A clientes e invitados se les quitan del payload para que
// nunca puedan verlos ni en el JSON de la página.
function filtrar_costos(array $productos, ?string $rol): array
{
    if ($rol === "admin" || $rol === "gerente") {
        return $productos;
    }

    return array_map(function (array $producto) {
        $producto["costoBase"] = null;
        $producto["margen"] = null;
        $producto["margenAplicado"] = null;
        return $producto;
    }, $productos);
}

// Paquete completo de datos para el frontend.
function datos_para_frontend(mysqli $bd): array
{
    $usuario = usuario_de_sesion();
    $rol = $usuario["rol"] ?? null;
    $es_admin = $rol === "admin";
    $es_gestor = $rol === "admin" || $rol === "gerente";
    $margen = margen_global($bd);

    $datos = [
        "productos" => filtrar_costos(obtener_productos($bd, $margen), $rol),
        "categorias" => [],
        "config" => [
            "margenGlobal" => $margen,
            "heroImagen" => null,
            "imagenComputadoras" => null,
            "imagenAccesorios" => null,
            "imagenOfertas" => null
        ],
        "sesion" => null,
        "permisos" => [],
        "usuarios" => [],
        "solicitudes" => [],
        "bitacora" => [],
        "resenasSitio" => ["promedio" => 0, "total" => 0, "lista" => []],
        "resenasProductos" => ["total" => 0, "lista" => []]
    ];

    // Imágenes configurables de la tienda (portada y secciones).
    $mapa_imagenes = [
        "heroImagen" => "hero_imagen",
        "imagenComputadoras" => "imagen_computadoras",
        "imagenAccesorios" => "imagen_accesorios",
        "imagenOfertas" => "imagen_ofertas"
    ];
    $resultado = $bd->query(
        "SELECT clave, valor FROM configuracion WHERE clave IN ('hero_imagen','imagen_computadoras','imagen_accesorios','imagen_ofertas')"
    );
    while ($fila = $resultado->fetch_assoc()) {
        $indice = array_search($fila["clave"], $mapa_imagenes, true);
        if ($indice !== false) {
            $datos["config"][$indice] = (string) $fila["valor"];
        }
    }

    $resultado = $bd->query("SELECT nombre FROM categorias ORDER BY nombre");
    while ($fila = $resultado->fetch_assoc()) {
        $datos["categorias"][] = $fila["nombre"];
    }

    if ($usuario) {
        $datos["sesion"] = [
            "id" => (int) $usuario["id"],
            "nombre" => (string) $usuario["nombre"],
            "email" => (string) $usuario["email"],
            "rol" => (string) $usuario["rol"],
            "direccion" => (string) ($usuario["direccion"] ?? ""),
            "telefono" => (string) ($usuario["telefono"] ?? ""),
            "rfc" => (string) ($usuario["rfc"] ?? ""),
            "metodoPago" => (string) ($usuario["metodo_pago"] ?? "")
        ];
        $datos["permisos"] = permisos_de_rol($usuario["rol"]);
    }

    // La lista de cuentas solo viaja para el administrador.
    if ($es_admin) {
        $resultado = $bd->query(
            "SELECT id, nombre, email, rol, direccion, telefono, rfc, creado
             FROM usuarios ORDER BY id"
        );
        while ($fila = $resultado->fetch_assoc()) {
            $datos["usuarios"][] = [
                "id" => (int) $fila["id"],
                "nombre" => (string) $fila["nombre"],
                "email" => (string) $fila["email"],
                "rol" => (string) $fila["rol"],
                "direccion" => (string) ($fila["direccion"] ?? ""),
                "telefono" => (string) ($fila["telefono"] ?? ""),
                "rfc" => (string) ($fila["rfc"] ?? ""),
                "creado" => (string) $fila["creado"]
            ];
        }
    }

    // Solicitudes y bitácora: solo para quien administra o gestiona.
    if ($es_gestor) {
        $resultado = $bd->query(
            "SELECT s.*, u.nombre AS autor
             FROM solicitudes s LEFT JOIN usuarios u ON u.id = s.usuario_id
             ORDER BY s.estado = 'pendiente' DESC, s.id DESC"
        );
        while ($fila = $resultado->fetch_assoc()) {
            $datos["solicitudes"][] = [
                "id" => (int) $fila["id"],
                "productoId" => $fila["producto_id"] !== null ? (int) $fila["producto_id"] : null,
                "productoNombre" => (string) ($fila["producto_nombre"] ?? "Producto"),
                "cambios" => json_decode((string) $fila["cambios"], true) ?: new stdClass(),
                "resumen" => (string) ($fila["resumen"] ?? ""),
                "estado" => (string) $fila["estado"],
                "autor" => (string) ($fila["autor"] ?? "Usuario"),
                "fecha" => (string) $fila["creado"],
                "resueltoPor" => (string) ($fila["resuelto_por"] ?? ""),
                "fechaResolucion" => (string) ($fila["fecha_resolucion"] ?? "")
            ];
        }

        $resultado = $bd->query(
            "SELECT fecha, autor, rol, accion, detalle FROM bitacora ORDER BY id DESC LIMIT 60"
        );
        while ($fila = $resultado->fetch_assoc()) {
            $datos["bitacora"][] = [
                "fecha" => (string) $fila["fecha"],
                "autor" => (string) $fila["autor"],
                "rol" => (string) $fila["rol"],
                "accion" => (string) $fila["accion"],
                "detalle" => (string) $fila["detalle"]
            ];
        }

        // ------------------------------------------- reseñas (admin + gerente)
        // Reseñas del sitio: la encuesta que los clientes responden al
        // terminar una compra (o al llegar al final de la página).
        $resultado = $bd->query(
            "SELECT COALESCE(AVG(calificacion), 0) AS promedio, COUNT(*) AS total FROM resenas_sitio"
        );
        $resumen_sitio = $resultado->fetch_assoc();
        $lista_sitio = [];
        $resultado = $bd->query(
            "SELECT id, calificacion, facilidad, comentario, fecha
             FROM resenas_sitio ORDER BY id DESC LIMIT 50"
        );
        while ($fila = $resultado->fetch_assoc()) {
            $lista_sitio[] = [
                "id" => (int) $fila["id"],
                "calificacion" => (int) $fila["calificacion"],
                "facilidad" => $fila["facilidad"] !== null ? (int) $fila["facilidad"] : null,
                "comentario" => (string) ($fila["comentario"] ?? ""),
                "fecha" => (string) $fila["fecha"]
            ];
        }
        $datos["resenasSitio"] = [
            "promedio" => round((float) $resumen_sitio["promedio"], 1),
            "total" => (int) $resumen_sitio["total"],
            "lista" => $lista_sitio
        ];

        // Últimas reseñas que los clientes dejaron a productos concretos.
        $resultado = $bd->query("SELECT COUNT(*) AS t FROM resenas_productos");
        $total_productos = (int) $resultado->fetch_assoc()["t"];
        $lista_productos = [];
        $resultado = $bd->query(
            "SELECT r.id, r.producto_id, p.nombre AS producto_nombre,
                    r.nombre_usuario, r.calificacion, r.comentario, r.fecha
             FROM resenas_productos r
             LEFT JOIN productos p ON p.id = r.producto_id
             ORDER BY r.id DESC LIMIT 20"
        );
        while ($fila = $resultado->fetch_assoc()) {
            $lista_productos[] = [
                "id" => (int) $fila["id"],
                "productoId" => (int) $fila["producto_id"],
                "productoNombre" => (string) ($fila["producto_nombre"] ?? "Producto"),
                "nombreUsuario" => (string) $fila["nombre_usuario"],
                "calificacion" => (int) $fila["calificacion"],
                "comentario" => (string) ($fila["comentario"] ?? ""),
                "fecha" => (string) $fila["fecha"]
            ];
        }
        $datos["resenasProductos"] = [
            "total" => $total_productos,
            "lista" => $lista_productos
        ];
    }

    return $datos;
}
