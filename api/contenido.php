<?php
// contenido.php — Textos y secciones editables de la tienda.
// GET  → contenido guardado + secciones de ofertas (público).
// POST → el administrador aplica al instante; el gerente crea una solicitud.
//        El cliente nunca puede modificar el contenido.

declare(strict_types=1);

require __DIR__ . "/_bd.php";
require __DIR__ . "/_datos.php";

$metodo_http = $_SERVER["REQUEST_METHOD"];

if ($metodo_http === "GET") {
    cabeceras_json();
    header("Cache-Control: no-store");
    $bd = obtenerConexion();
    echo json_encode(
        [
            "ok" => true,
            "contenido" => obtener_contenido_sitio($bd),
            "seccionesOferta" => obtener_secciones_oferta($bd)
        ],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

if ($metodo_http !== "POST") {
    responder_error("Método no permitido.", 405);
}

$usuario = exigir_rol(["admin", "gerente"]);
$bd = obtenerConexion();
$cuerpo = leer_cuerpo();
csrf_exigir();
rate_limit("contenido", 30, 60);

$es_admin = $usuario["rol"] === "admin";
$accion = (string) ($cuerpo["accion"] ?? "");
$datos = is_array($cuerpo["datos"] ?? null) ? $cuerpo["datos"] : [];
$acciones_validas = ["textos", "seccion_guardar", "seccion_crear", "seccion_eliminar", "seccion_orden"];

if (!in_array($accion, $acciones_validas, true)) {
    responder_error("Acción de contenido no válida.");
}

// Etiquetas legibles para que el administrador vea qué texto cambia.
$etiquetas = [
    "inicio.hero.titulo" => "Portada · Título",
    "inicio.hero.subtitulo" => "Portada · Subtítulo",
    "inicio.hero.descripcion" => "Portada · Descripción",
    "inicio.hero.boton" => "Portada · Botón",
    "inicio.computadoras.titulo" => "Computadoras · Título",
    "inicio.computadoras.acento" => "Computadoras · Título rojo",
    "inicio.computadoras.descripcion" => "Computadoras · Descripción",
    "accesorios.hero.titulo" => "Accesorios · Título",
    "accesorios.hero.subtitulo" => "Accesorios · Subtítulo",
    "accesorios.hero.descripcion" => "Accesorios · Descripción",
    "accesorios.hero.boton" => "Accesorios · Botón",
    "accesorios.titulo" => "Accesorios · Título de catálogo",
    "accesorios.acento" => "Accesorios · Título rojo",
    "accesorios.descripcion" => "Accesorios · Descripción",
    "ofertas.hero.etiqueta" => "Ofertas · Etiqueta",
    "ofertas.hero.titulo" => "Ofertas · Título",
    "ofertas.hero.descripcion" => "Ofertas · Descripción",
    "ofertas.hero.boton" => "Ofertas · Botón",
    "ofertas.intro.etiqueta" => "Ofertas · Etiqueta de sección",
    "ofertas.intro.titulo" => "Ofertas · Título de sección",
    "ofertas.intro.acento" => "Ofertas · Título rojo",
    "ofertas.intro.descripcion" => "Ofertas · Descripción de sección"
];

$diff = [];
$resumen = "";
$nombre_solicitud = "Contenido del sitio";
$paquete = ["tipo" => "contenido", "accion" => $accion, "datos" => $datos, "diff" => []];

if ($accion === "textos") {
    $cambios = is_array($datos["cambios"] ?? null) ? $datos["cambios"] : $datos;
    $validas = array_flip(claves_contenido_validas());
    $antes = obtener_contenido_sitio($bd);
    $limpios = [];

    foreach ($cambios as $clave => $valor) {
        if (!isset($validas[$clave])) {
            continue;
        }
        $texto = trim((string) $valor);
        if (strlen($texto) > 5000) {
            $texto = substr($texto, 0, 5000);
        }
        $limpios[$clave] = $texto;
        $anterior = (string) ($antes[$clave] ?? "");
        if ($anterior !== $texto) {
            $diff[$etiquetas[$clave] ?? $clave] = ["antes" => $anterior, "despues" => $texto];
        }
    }

    if (!$limpios) {
        responder_error("No hay textos válidos para guardar.");
    }
    if (!$diff) {
        responder_error("No cambió ningún texto.");
    }

    $datos = $limpios;
    $resumen = count($diff) === 1
        ? "Cambió " . array_key_first($diff)
        : "Cambió " . count($diff) . " textos del sitio";
} elseif ($accion === "seccion_guardar") {
    $id = (int) ($datos["id"] ?? 0);
    $consulta = $bd->prepare("SELECT * FROM secciones_oferta WHERE id = ? LIMIT 1");
    $consulta->bind_param("i", $id);
    $consulta->execute();
    $seccion = $consulta->get_result()->fetch_assoc();
    $consulta->close();

    if (!$seccion) {
        responder_error("Esa sección ya no existe.", 404);
    }

    $nuevos = [
        "etiqueta" => substr(trim((string) ($datos["etiqueta"] ?? "")), 0, 60),
        "titulo" => substr(trim((string) ($datos["titulo"] ?? "")), 0, 120),
        "acento" => substr(trim((string) ($datos["acento"] ?? "")), 0, 120),
        "descripcion" => substr(trim((string) ($datos["descripcion"] ?? "")), 0, 500)
    ];
    if ($nuevos["titulo"] === "") {
        responder_error("La sección necesita un título.");
    }

    foreach (["etiqueta", "titulo", "acento", "descripcion"] as $campo) {
        $anterior = (string) ($seccion[$campo] ?? "");
        if ($anterior !== $nuevos[$campo]) {
            $etiqueta_campo = $campo === "titulo" ? "Título" : ucfirst($campo);
            $diff[$etiqueta_campo] = ["antes" => $anterior, "despues" => $nuevos[$campo]];
        }
    }
    if (!$diff) {
        responder_error("No cambió ningún dato de la sección.");
    }

    $datos = array_merge(["id" => $id], $nuevos);
    $nombre_solicitud = "Sección de ofertas: " . $nuevos["titulo"];
    $resumen = "Editó la sección " . $nuevos["titulo"];
} elseif ($accion === "seccion_crear") {
    $titulo = substr(trim((string) ($datos["titulo"] ?? "")), 0, 120);
    if ($titulo === "") {
        responder_error("La nueva sección necesita un título.");
    }
    $datos = [
        "etiqueta" => substr(trim((string) ($datos["etiqueta"] ?? "")), 0, 60),
        "titulo" => $titulo,
        "acento" => substr(trim((string) ($datos["acento"] ?? "")), 0, 120),
        "descripcion" => substr(trim((string) ($datos["descripcion"] ?? "")), 0, 500)
    ];
    $nombre_solicitud = "Sección de ofertas: " . $titulo;
    $diff["Nueva sección"] = [
        "antes" => "No existía",
        "despues" => trim($titulo . " " . $datos["acento"])
    ];
    $resumen = "Creó la sección " . $titulo;
} elseif ($accion === "seccion_eliminar") {
    $id = (int) ($datos["id"] ?? 0);
    $consulta = $bd->prepare("SELECT * FROM secciones_oferta WHERE id = ? LIMIT 1");
    $consulta->bind_param("i", $id);
    $consulta->execute();
    $seccion = $consulta->get_result()->fetch_assoc();
    $consulta->close();

    if (!$seccion) {
        responder_error("Esa sección ya no existe.", 404);
    }
    $nombre_solicitud = "Sección de ofertas: " . $seccion["titulo"];
    $diff["Sección"] = [
        "antes" => trim($seccion["titulo"] . " " . $seccion["acento"]),
        "despues" => "Eliminada (sus ofertas pasan a otra sección)"
    ];
    $resumen = "Eliminó la sección " . $seccion["titulo"];
    $datos = ["id" => $id];
} elseif ($accion === "seccion_orden") {
    $ids = array_values(array_filter(array_map("intval", (array) ($datos["ids"] ?? [])), function ($id) {
        return $id > 0;
    }));
    if (count($ids) < 2) {
        responder_error("No hay suficientes secciones para reordenar.");
    }
    $datos = ["ids" => $ids];
    $nombre_solicitud = "Orden de secciones de ofertas";
    $diff["Orden de secciones"] = ["antes" => "Orden anterior", "despues" => "Nuevo orden"];
    $resumen = "Reordenó las secciones de ofertas";
}

$paquete["datos"] = $datos;
$paquete["diff"] = $diff;

if ($es_admin) {
    try {
        aplicar_cambios_contenido($bd, $paquete);
    } catch (Throwable $e) {
        responder_error($e->getMessage());
    }
    registrar_bitacora($bd, $usuario["nombre"], "admin", "contenido", $resumen);

    cabeceras_json();
    header("Cache-Control: no-store");
    echo json_encode(
        [
            "ok" => true,
            "aplicado" => true,
            "propuesta" => false,
            "mensaje" => "Contenido actualizado.",
            "contenido" => obtener_contenido_sitio($bd),
            "seccionesOferta" => obtener_secciones_oferta($bd)
        ],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

// Gerente: se guarda una propuesta pendiente. Nada cambia en la tienda hasta
// que el administrador la apruebe desde el panel.
$json = json_encode($paquete, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$nombre_solicitud = substr($nombre_solicitud, 0, 180);
$resumen = substr($resumen, 0, 255);
$insertar = $bd->prepare(
    "INSERT INTO solicitudes (usuario_id, producto_id, producto_nombre, cambios, resumen)
     VALUES (?, NULL, ?, ?, ?)"
);
$usuario_id = (int) $usuario["id"];
$insertar->bind_param("isss", $usuario_id, $nombre_solicitud, $json, $resumen);
$insertar->execute();
$id_solicitud = (int) $insertar->insert_id;
$insertar->close();

cabeceras_json();
header("Cache-Control: no-store");
echo json_encode(
    [
        "ok" => true,
        "aplicado" => false,
        "propuesta" => true,
        "solicitudId" => $id_solicitud,
        "mensaje" => "Propuesta enviada. El administrador debe aprobarla.",
        "contenido" => obtener_contenido_sitio($bd),
        "seccionesOferta" => obtener_secciones_oferta($bd)
    ],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
