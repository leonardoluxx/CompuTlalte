<?php
// _datos.php — Construye el "paquete de datos" que consume el frontend.
// Lo usan bootstrap.php (lo emite como JavaScript) y datos.php (como JSON).
// El formato de cada producto es EXACTAMENTE el que la interfaz ya consume,
// así que las tarjetas, el buscador y los modales no se rehacen.

declare(strict_types=1);

// Secciones visibles de la página de ofertas. Cualquier valor desconocido
// se guarda como vacío y la tienda lo coloca en Ofertas de la semana.
function normalizar_grupo_oferta($valor): string
{
    $grupo = strtolower(trim((string) $valor));
    $grupo = (string) preg_replace("/[^a-z0-9_-]+/", "-", $grupo);
    $grupo = trim($grupo, "-");
    return substr($grupo, 0, 60);
}

// Claves de texto que el editor visual puede modificar. La lista blanca vive
// en el servidor para que nadie pueda escribir configuraciones arbitrarias.
function claves_contenido_validas(): array
{
    return [
        "inicio.hero.titulo",
        "inicio.hero.subtitulo",
        "inicio.hero.descripcion",
        "inicio.hero.boton",
        "inicio.computadoras.titulo",
        "inicio.computadoras.acento",
        "inicio.computadoras.descripcion",
        "accesorios.hero.titulo",
        "accesorios.hero.subtitulo",
        "accesorios.hero.descripcion",
        "accesorios.hero.boton",
        "accesorios.titulo",
        "accesorios.acento",
        "accesorios.descripcion",
        "ofertas.hero.etiqueta",
        "ofertas.hero.titulo",
        "ofertas.hero.descripcion",
        "ofertas.hero.boton",
        "ofertas.intro.etiqueta",
        "ofertas.intro.titulo",
        "ofertas.intro.acento",
        "ofertas.intro.descripcion"
    ];
}

// Textos editables guardados en la base. Sin fila guardada, la página
// conserva el texto original del diseño.
function obtener_contenido_sitio(mysqli $bd): array
{
    $contenido = [];
    try {
        $resultado = $bd->query("SELECT clave, valor FROM contenido_sitio");
        while ($fila = $resultado->fetch_assoc()) {
            $contenido[(string) $fila["clave"]] = (string) $fila["valor"];
        }
    } catch (Throwable $e) {
        return [];
    }
    return $contenido;
}

// Secciones de la página de ofertas, en el orden que decidió el admin.
function obtener_secciones_oferta(mysqli $bd): array
{
    $secciones = [];
    try {
        $resultado = $bd->query(
            "SELECT id, clave, etiqueta, titulo, acento, descripcion, orden
             FROM secciones_oferta ORDER BY orden, id"
        );
        while ($fila = $resultado->fetch_assoc()) {
            $secciones[] = [
                "id" => (int) $fila["id"],
                "clave" => (string) $fila["clave"],
                "etiqueta" => (string) ($fila["etiqueta"] ?? ""),
                "titulo" => (string) $fila["titulo"],
                "acento" => (string) ($fila["acento"] ?? ""),
                "descripcion" => (string) ($fila["descripcion"] ?? ""),
                "orden" => (int) $fila["orden"]
            ];
        }
    } catch (Throwable $e) {
        return [];
    }
    return $secciones;
}

// Guarda un lote de textos. Devuelve cuántas claves se aplicaron.
function guardar_contenido_sitio(mysqli $bd, array $cambios): int
{
    $validas = array_flip(claves_contenido_validas());
    $guardar = $bd->prepare(
        "INSERT INTO contenido_sitio (clave, valor) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado = CURRENT_TIMESTAMP"
    );
    $aplicadas = 0;

    foreach ($cambios as $clave => $valor) {
        if (!isset($validas[$clave])) {
            continue;
        }
        $texto = trim((string) $valor);
        if (strlen($texto) > 5000) {
            $texto = substr($texto, 0, 5000);
        }
        $guardar->bind_param("ss", $clave, $texto);
        $guardar->execute();
        $aplicadas++;
    }

    $guardar->close();
    if ($aplicadas === 0) {
        throw new RuntimeException("No hay textos válidos para guardar.");
    }
    return $aplicadas;
}

// Convierte un nombre visible en una clave segura para una sección nueva.
function slug_seccion_oferta(string $texto): string
{
    $mapa = [
        "á" => "a", "à" => "a", "ä" => "a", "â" => "a", "ã" => "a",
        "é" => "e", "è" => "e", "ë" => "e", "ê" => "e",
        "í" => "i", "ì" => "i", "ï" => "i", "î" => "i",
        "ó" => "o", "ò" => "o", "ö" => "o", "ô" => "o", "õ" => "o",
        "ú" => "u", "ù" => "u", "ü" => "u", "û" => "u",
        "ñ" => "n", "ç" => "c",
        "Á" => "a", "À" => "a", "Ä" => "a", "Â" => "a", "Ã" => "a",
        "É" => "e", "È" => "e", "Ë" => "e", "Ê" => "e",
        "Í" => "i", "Ì" => "i", "Ï" => "i", "Î" => "i",
        "Ó" => "o", "Ò" => "o", "Ö" => "o", "Ô" => "o", "Õ" => "o",
        "Ú" => "u", "Ù" => "u", "Ü" => "u", "Û" => "u",
        "Ñ" => "n", "Ç" => "c"
    ];
    $slug = strtolower(strtr($texto, $mapa));
    $slug = trim((string) preg_replace("/[^a-z0-9]+/", "-", $slug), "-");
    return substr($slug !== "" ? $slug : "seccion", 0, 48);
}

// Aplica una propuesta de contenido aprobada (o un cambio directo del admin).
// Las acciones de secciones incluyen crear, renombrar y eliminar; al eliminar
// se reasignan las ofertas a otra sección para no dejar productos huérfanos.
function aplicar_cambios_contenido(mysqli $bd, array $paquete): void
{
    $accion = (string) ($paquete["accion"] ?? "");
    $datos = is_array($paquete["datos"] ?? null) ? $paquete["datos"] : [];

    if ($accion === "textos") {
        guardar_contenido_sitio($bd, $datos);
        return;
    }

    if ($accion === "seccion_guardar") {
        $id = (int) ($datos["id"] ?? 0);
        $titulo = trim((string) ($datos["titulo"] ?? ""));
        if ($id <= 0 || $titulo === "") {
            throw new RuntimeException("La sección necesita un título.");
        }
        $etiqueta = substr(trim((string) ($datos["etiqueta"] ?? "")), 0, 60);
        $acento = substr(trim((string) ($datos["acento"] ?? "")), 0, 120);
        $descripcion = substr(trim((string) ($datos["descripcion"] ?? "")), 0, 500);
        $consulta = $bd->prepare(
            "UPDATE secciones_oferta SET etiqueta = ?, titulo = ?, acento = ?, descripcion = ? WHERE id = ?"
        );
        $consulta->bind_param("ssssi", $etiqueta, $titulo, $acento, $descripcion, $id);
        $consulta->execute();
        if ($consulta->affected_rows === 0) {
            $existe = $bd->prepare("SELECT id FROM secciones_oferta WHERE id = ?");
            $existe->bind_param("i", $id);
            $existe->execute();
            if (!$existe->get_result()->fetch_assoc()) {
                $existe->close();
                $consulta->close();
                throw new RuntimeException("Esa sección ya no existe.");
            }
            $existe->close();
        }
        $consulta->close();
        return;
    }

    if ($accion === "seccion_crear") {
        $titulo = trim((string) ($datos["titulo"] ?? ""));
        if ($titulo === "") {
            throw new RuntimeException("La nueva sección necesita un título.");
        }
        $etiqueta = substr(trim((string) ($datos["etiqueta"] ?? "")), 0, 60);
        $acento = substr(trim((string) ($datos["acento"] ?? "")), 0, 120);
        $descripcion = substr(trim((string) ($datos["descripcion"] ?? "")), 0, 500);
        $base = slug_seccion_oferta($titulo . " " . $acento);
        $clave = $base;
        $intento = 2;
        while (true) {
            $existe = $bd->prepare("SELECT id FROM secciones_oferta WHERE clave = ? LIMIT 1");
            $existe->bind_param("s", $clave);
            $existe->execute();
            $duplicada = $existe->get_result()->fetch_assoc();
            $existe->close();
            if (!$duplicada) {
                break;
            }
            $clave = substr($base, 0, 55) . "-" . $intento;
            $intento++;
        }
        $orden = (int) ($bd->query("SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM secciones_oferta")->fetch_assoc()["siguiente"] ?? 1);
        $insertar = $bd->prepare(
            "INSERT INTO secciones_oferta (clave, etiqueta, titulo, acento, descripcion, orden) VALUES (?, ?, ?, ?, ?, ?)"
        );
        $insertar->bind_param("sssssi", $clave, $etiqueta, $titulo, $acento, $descripcion, $orden);
        $insertar->execute();
        $insertar->close();
        return;
    }

    if ($accion === "seccion_eliminar") {
        $id = (int) ($datos["id"] ?? 0);
        $total = (int) ($bd->query("SELECT COUNT(*) AS total FROM secciones_oferta")->fetch_assoc()["total"] ?? 0);
        if ($total <= 1) {
            throw new RuntimeException("Debe quedar al menos una sección de ofertas.");
        }
        $consulta = $bd->prepare("SELECT clave FROM secciones_oferta WHERE id = ? LIMIT 1");
        $consulta->bind_param("i", $id);
        $consulta->execute();
        $seccion = $consulta->get_result()->fetch_assoc();
        $consulta->close();
        if (!$seccion) {
            throw new RuntimeException("Esa sección ya no existe.");
        }
        $otra = $bd->query("SELECT clave FROM secciones_oferta WHERE id <> " . $id . " ORDER BY orden, id LIMIT 1");
        $clave_destino = (string) ($otra->fetch_assoc()["clave"] ?? "");
        if ($clave_destino !== "") {
            $mover = $bd->prepare("UPDATE productos SET grupo_oferta = ? WHERE grupo_oferta = ?");
            $mover->bind_param("ss", $clave_destino, $seccion["clave"]);
            $mover->execute();
            $mover->close();
        }
        $borrar = $bd->prepare("DELETE FROM secciones_oferta WHERE id = ?");
        $borrar->bind_param("i", $id);
        $borrar->execute();
        $borrar->close();
        return;
    }

    if ($accion === "seccion_orden") {
        $ids = array_values(array_filter(array_map("intval", (array) ($datos["ids"] ?? [])), function ($id) {
            return $id > 0;
        }));
        $actualizar = $bd->prepare("UPDATE secciones_oferta SET orden = ? WHERE id = ?");
        foreach ($ids as $indice => $id) {
            $orden = $indice + 1;
            $actualizar->bind_param("ii", $orden, $id);
            $actualizar->execute();
        }
        $actualizar->close();
        return;
    }

    throw new RuntimeException("Cambio de contenido no reconocido.");
}

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
    $grupo_oferta = normalizar_grupo_oferta($fila["grupo_oferta"] ?? "");
    if ($descuento > 0 && $grupo_oferta === "") {
        $grupo_oferta = "semana";
    }

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
        "grupoOferta" => $grupo_oferta,
        "oferta" => [
            "activa" => ((int) ($fila["en_oferta"] ?? 0)) === 1,
            "descuento" => $descuento,
            "grupo" => $grupo_oferta
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

// Consulta el catálogo y lo devuelve adaptado. Con $solo_id se limita a un
// producto: así una ficha o una edición no cargan el catálogo entero.
function obtener_productos(mysqli $bd, float $margen_global, ?int $solo_id = null): array
{
    $filas = [];

    if ($solo_id !== null) {
        $consulta = $bd->prepare(
            "SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
             WHERE p.id = ? ORDER BY p.id"
        );
        $consulta->bind_param("i", $solo_id);
        $consulta->execute();
        $resultado = $consulta->get_result();
    } else {
        $resultado = $bd->query(
            "SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
             ORDER BY p.id"
        );
    }

    while ($fila = $resultado->fetch_assoc()) {
        $filas[(int) $fila["id"]] = $fila;
    }

    if (!count($filas)) {
        return [];
    }

    $filtro = $solo_id !== null ? " WHERE producto_id = ?" : "";

    // Reseñas REALES por producto (conteo y promedio de calificaciones).
    // Una sola consulta agrupada alimenta a todo el catálogo.
    $resenas = [];
    if ($solo_id !== null) {
        $consulta = $bd->prepare(
            "SELECT producto_id, COUNT(*) AS total, AVG(calificacion) AS promedio
             FROM resenas_productos" . $filtro . " GROUP BY producto_id"
        );
        $consulta->bind_param("i", $solo_id);
        $consulta->execute();
        $resultado = $consulta->get_result();
    } else {
        $resultado = $bd->query(
            "SELECT producto_id, COUNT(*) AS total, AVG(calificacion) AS promedio
             FROM resenas_productos GROUP BY producto_id"
        );
    }
    while ($fila = $resultado->fetch_assoc()) {
        $resenas[(int) $fila["producto_id"]] = $fila;
    }

    // Especificaciones agrupadas por producto y tipo (una sola consulta).
    $especificaciones = [];
    if ($solo_id !== null) {
        $consulta = $bd->prepare(
            "SELECT producto_id, tipo, descripcion FROM especificaciones" . $filtro .
            " ORDER BY producto_id, id"
        );
        $consulta->bind_param("i", $solo_id);
        $consulta->execute();
        $resultado = $consulta->get_result();
    } else {
        $resultado = $bd->query(
            "SELECT producto_id, tipo, descripcion FROM especificaciones
             ORDER BY producto_id, id"
        );
    }
    while ($fila = $resultado->fetch_assoc()) {
        $especificaciones[(int) $fila["producto_id"]][$fila["tipo"]][] = $fila["descripcion"];
    }

    // Galería ordenada por posición (la 1 es la principal).
    $imagenes = [];
    if ($solo_id !== null) {
        $consulta = $bd->prepare(
            "SELECT producto_id, url FROM imagenes_producto" . $filtro .
            " ORDER BY producto_id, posicion, id"
        );
        $consulta->bind_param("i", $solo_id);
        $consulta->execute();
        $resultado = $consulta->get_result();
    } else {
        $resultado = $bd->query(
            "SELECT producto_id, url FROM imagenes_producto ORDER BY producto_id, posicion, id"
        );
    }
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
        $activa = !empty($oferta["activa"]);
        $grupo = normalizar_grupo_oferta($cambios["grupoOferta"] ?? ($oferta["grupo"] ?? ""));
        if ($activa && $grupo === "") {
            // El editor general del producto no envía la sección: se conserva
            // la que ya tenía para no moverla de lugar sin querer.
            $consulta_grupo = $bd->prepare("SELECT grupo_oferta FROM productos WHERE id = ? LIMIT 1");
            $consulta_grupo->bind_param("i", $id);
            $consulta_grupo->execute();
            $grupo_actual = (string) ($consulta_grupo->get_result()->fetch_assoc()["grupo_oferta"] ?? "");
            $consulta_grupo->close();
            $grupo = normalizar_grupo_oferta($grupo_actual) ?: "semana";
        }
        $asignaciones[] = "en_oferta = ?, descuento = ?, grupo_oferta = ?";
        $tipos .= "iis";
        $valores[] = $activa ? 1 : 0;
        $valores[] = min(95, max(0, (int) ($oferta["descuento"] ?? 0)));
        $valores[] = $activa ? $grupo : null;
    } elseif (array_key_exists("grupoOferta", $cambios)) {
        $asignaciones[] = "grupo_oferta = ?";
        $tipos .= "s";
        $valores[] = normalizar_grupo_oferta($cambios["grupoOferta"]) ?: null;
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
// Solo consulta ese producto: no arma el catálogo completo.
function producto_adaptado_por_id(mysqli $bd, int $id): ?array
{
    $productos = obtener_productos($bd, margen_global($bd), $id);
    return $productos[0] ?? null;
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
        // Se eliminan del payload (no solo se anulan): así el JSON público
        // no contiene ninguna clave de costo ni de margen interno.
        unset($producto["costoBase"], $producto["margen"], $producto["margenAplicado"]);
        return $producto;
    }, $productos);
}

// Paquete LIGERO para bootstrap.php (solo sesión, config, permisos — SIN productos).
// Los productos se cargan aparte vía api/productos-lista.php cuando la página los necesite.
function datos_para_frontend_ligero(mysqli $bd): array
{
    $usuario = usuario_de_sesion();
    $margen = margen_global($bd);

    $datos = [
        "productos" => [], // VACÍO: se carga por fetch aparte
        "categorias" => [],
        "config" => [
            // El margen global es información interna: solo lo reciben los
            // roles que gestionan precios.
            "margenGlobal" => ($usuario && in_array($usuario["rol"], ["admin", "gerente"], true))
                ? $margen
                : null,
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
        "resenasProductos" => ["total" => 0, "lista" => []],
        "contenido" => obtener_contenido_sitio($bd),
        "seccionesOferta" => obtener_secciones_oferta($bd)
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
            "metodoPago" => (string) ($usuario["metodo_pago"] ?? ""),
            // true cuando la contraseña es temporal y debe cambiarse.
            "debeCambiarClave" => ((int) ($usuario["debe_cambiar_clave"] ?? 0)) === 1
        ];
        $datos["permisos"] = permisos_de_rol($usuario["rol"]);
    }

    return $datos;
}

// Convierte una solicitud de la BD al formato que dibuja el panel. Incluye
// "antes" y "despues" ya separados para que las propuestas de productos y de
// contenido muestren exactamente qué va a cambiar.
function normalizar_solicitud(array $fila): array
{
    $paquete = json_decode((string) $fila["cambios"], true);
    $paquete = is_array($paquete) ? $paquete : [];
    $diff = is_array($paquete["diff"] ?? null) ? $paquete["diff"] : [];
    $antes = [];
    $despues = [];
    foreach ($diff as $campo => $valores) {
        if (!is_array($valores)) {
            continue;
        }
        $antes[$campo] = $valores["antes"] ?? null;
        $despues[$campo] = $valores["despues"] ?? null;
    }

    return [
        "id" => (int) $fila["id"],
        "productoId" => $fila["producto_id"] !== null ? (int) $fila["producto_id"] : null,
        "productoNombre" => (string) ($fila["producto_nombre"] ?? "Producto"),
        "cambios" => $paquete,
        "antes" => $antes,
        "despues" => $despues,
        "resumen" => (string) ($fila["resumen"] ?? ""),
        "estado" => (string) $fila["estado"],
        "autor" => (string) ($fila["autor"] ?? "Usuario"),
        "fecha" => (string) $fila["creado"],
        "resueltoPor" => (string) ($fila["resuelto_por"] ?? ""),
        "fechaResolucion" => (string) ($fila["fecha_resolucion"] ?? "")
    ];
}

// Datos de gestión para el panel (usuarios, solicitudes, bitácora y reseñas).
// Se piden aparte con api/panel-datos.php SOLO cuando el panel los necesita;
// así bootstrap.php no los envía en cada página. No incluye productos.
function datos_gestion(mysqli $bd): array
{
    $usuario = usuario_de_sesion();
    $rol = $usuario["rol"] ?? null;
    $es_admin = $rol === "admin";
    $es_gestor = $rol === "admin" || $rol === "gerente";

    $datos = [
        "usuarios" => [],
        "solicitudes" => [],
        "bitacora" => [],
        "resenasSitio" => ["promedio" => 0, "total" => 0, "lista" => []],
        "resenasProductos" => ["total" => 0, "lista" => []]
    ];

    if (!$es_gestor) {
        return $datos;
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

    $resultado = $bd->query(
        "SELECT s.*, u.nombre AS autor
         FROM solicitudes s LEFT JOIN usuarios u ON u.id = s.usuario_id
         ORDER BY s.estado = 'pendiente' DESC, s.id DESC"
    );
    while ($fila = $resultado->fetch_assoc()) {
        $datos["solicitudes"][] = normalizar_solicitud($fila);
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

    return $datos;
}

// Paquete COMPLETO para panel y páginas admin (CON productos).
// Mantiene la firma original para compatibilidad.
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
            "margenGlobal" => $es_gestor ? $margen : null,
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
        "resenasProductos" => ["total" => 0, "lista" => []],
        "contenido" => obtener_contenido_sitio($bd),
        "seccionesOferta" => obtener_secciones_oferta($bd)
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
            "metodoPago" => (string) ($usuario["metodo_pago"] ?? ""),
            "debeCambiarClave" => ((int) ($usuario["debe_cambiar_clave"] ?? 0)) === 1
        ];
        $datos["permisos"] = permisos_de_rol($usuario["rol"]);
    }

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

    if ($es_gestor) {
        $resultado = $bd->query(
            "SELECT s.*, u.nombre AS autor
             FROM solicitudes s LEFT JOIN usuarios u ON u.id = s.usuario_id
             ORDER BY s.estado = 'pendiente' DESC, s.id DESC"
        );
        while ($fila = $resultado->fetch_assoc()) {
            $datos["solicitudes"][] = normalizar_solicitud($fila);
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
