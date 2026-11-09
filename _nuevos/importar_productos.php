<?php
// importar_productos.php — Importa los 40 productos de _nuevos a la tienda.
// ---------------------------------------------------------------------------
// Este script es NUEVO y no modifica ningún archivo existente del proyecto.
// Lee los .txt generados desde los .docx, empareja las carpetas de imágenes
// (1-20 de cada categoría) y, solo con --apply, copia las fotos a imagenes/
// e inserta los productos en MySQL.
//
// Uso:
//   php _nuevos/importar_productos.php            (solo revisión, no toca nada)
//   php _nuevos/importar_productos.php --apply    (copia imágenes e inserta)
//
// También genera:
//   _nuevos/productos_parseados.json
//   _nuevos/reporte_productos.txt
//   _nuevos/productos_nuevos.sql (solo al aplicar)

declare(strict_types=1);
mb_internal_encoding("UTF-8");

require_once __DIR__ . "/../api/_bd.php";

$aplicar = in_array("--apply", $argv, true);
$raiz = dirname(__DIR__);

// Misma configuración de personalización que ya usan los equipos existentes,
// para que los extras del modal se validen y cobren igual en el checkout.
$personalizacion_estandar = json_encode([
    [
        "grupo" => "almacenamiento",
        "grupoEtiqueta" => "Almacenamiento",
        "opciones" => [
            ["valor" => "1-tb", "etiqueta" => "1 TB", "extra" => 0],
            ["valor" => "2-tb", "etiqueta" => "2 TB", "extra" => 2000],
        ],
    ],
    [
        "grupo" => "memoria",
        "grupoEtiqueta" => "Memoria RAM",
        "opciones" => [
            ["valor" => "16-gb", "etiqueta" => "16 GB", "extra" => 0],
            ["valor" => "32-gb", "etiqueta" => "32 GB", "extra" => 3500],
        ],
    ],
    [
        "grupo" => "color",
        "grupoEtiqueta" => "Color",
        "opciones" => [
            ["valor" => "plata", "etiqueta" => "Plata", "extra" => 0],
            ["valor" => "negro-espacial", "etiqueta" => "Negro Espacial", "extra" => 500],
        ],
    ],
], JSON_UNESCAPED_UNICODE);

$fuentes = [
    [
        "texto" => __DIR__ . "/pc de desarollo.txt",
        "imagenes" => __DIR__ . "/imagenes de pc de desarollo",
        "categoria" => "Desarrollo",
        "categoria_id" => 2,
        "destino" => "imagenes/computadoras-desarrollo",
    ],
    [
        "texto" => __DIR__ . "/pc gamer.txt",
        "imagenes" => __DIR__ . "/imagenes de pc gamer",
        "categoria" => "Juegos",
        "categoria_id" => 1,
        "destino" => "imagenes/computadoras-gaming",
    ],
];

// ------------------------------------------------------------------ utilidades
function texto_limpio(string $texto): string
{
    $texto = str_replace(["\xc2\xa0", "\r"], [" ", ""], $texto);
    return trim(preg_replace('/\s+/u', ' ', $texto) ?? $texto);
}

function sin_marcas(string $texto): string
{
    return trim(str_replace(["®", "™", "©"], "", $texto));
}

function slugify(string $texto, int $maximo = 48): string
{
    $mapa = [
        "á" => "a", "é" => "e", "í" => "i", "ó" => "o", "ú" => "u", "ü" => "u",
        "ñ" => "n", "Á" => "A", "É" => "E", "Í" => "I", "Ó" => "O", "Ú" => "U",
        "Ü" => "U", "Ñ" => "N",
    ];
    $texto = strtr($texto, $mapa);
    $texto = strtolower($texto);
    $texto = preg_replace('/[^a-z0-9]+/u', '-', $texto) ?? "";
    $texto = trim($texto, "-");
    if (strlen($texto) > $maximo) {
        $texto = substr($texto, 0, $maximo);
        $texto = rtrim($texto, "-");
    }
    return $texto !== "" ? $texto : "producto";
}

function bloques(string $texto): array
{
    $lineas = preg_split('/\R/u', $texto) ?: [];
    $bloques = [];
    $actual = null;

    foreach ($lineas as $linea) {
        // Algunos encabezados vienen pegados al título ("9----Laptop ...").
        if (preg_match('/^\s*(\d+)-{3,}\s*(.*)$/u', $linea, $m)) {
            if ($actual !== null) {
                $bloques[] = $actual;
            }
            $actual = ["numero" => (int) $m[1], "lineas" => []];
            $resto = rtrim($m[2]);
            if ($resto !== "") {
                $actual["lineas"][] = $resto;
            }
        } elseif ($actual !== null) {
            $actual["lineas"][] = rtrim($linea);
        }
    }
    if ($actual !== null) {
        $bloques[] = $actual;
    }

    return $bloques;
}

function es_ruido(string $linea): bool
{
    $l = texto_limpio($linea);
    if ($l === "") {
        return true;
    }
    if (preg_match('/^(Principio del formulario|Final del formulario|Agregar a favoritos|Nuevo|MÁS VENDIDO|OFERTA IMPERDIBLE|IVA incluido|Ver los medios de pago|Ver características|Combina medios de pago)$/iu', $l)) {
        return true;
    }
    if (preg_match('/^(¡?[ÚU]LTIMA UNIDAD!?|[ÚU]LTIMAS \d+ UNIDADES|\d+º en .*)$/iu', $l)) {
        return true;
    }
    if (preg_match('/^[MÁA]S VENDIDO$/iu', $l)) {
        return true;
    }
    if (stripos($l, "Calificación") !== false) {
        return true;
    }
    if (str_starts_with($l, "$") || preg_match('/^(Color|Memoria RAM|Tarjeta gráfica|Capacidad|Modelo|Línea|Marca|Edición|Versión|Nombre|Frecuencia|Con pantalla|Resolución|Sistema operativo|Estado del|Incluye|Uso recomendado)/iu', $l)) {
        return true;
    }
    if (stripos($l, "Paga con tarjetas") !== false || stripos($l, "meses") !== false) {
        return true;
    }
    return false;
}

// Convierte "12,512,03" o "47,899" o "6,475,9" a número.
function monto(string $bruto): float
{
    $s = str_replace(["$", " "], "", trim($bruto));
    $s = trim($s, ",");
    if ($s === "") {
        return 0.0;
    }

    $partes = explode(",", $s);
    $ultima = end($partes);

    // Formato con punto decimal y coma de miles (por si acaso).
    if (str_contains($s, ".") && str_contains($s, ",")) {
        return (float) str_replace(",", "", $s);
    }

    if (count($partes) >= 2 && strlen($ultima) <= 2) {
        $decimales = array_pop($partes);
        return (float) (implode("", $partes) . "." . $decimales);
    }

    return (float) implode("", $partes);
}

// Separa precio y descuento de una línea como "$12,512,0330% OFF".
function precio_con_descuento(string $linea, float $referencia = 0.0): array
{
    $s = preg_replace('/\$\s*/u', '', $linea) ?? $linea;
    $s = preg_replace('/\s*%\s*OFF\s*$/iu', '', $s) ?? $s;
    $s = texto_limpio($s);

    if (!preg_match('/^(.*),(\d+)$/u', $s, $m)) {
        return [monto($s), 0];
    }

    $prefijo = $m[1];
    $grupo = $m[2];
    $n = strlen($grupo);
    $entero = preg_replace('/[^\d]/', '', $prefijo) ?? "";
    $candidatos = [];

    // La pegada "precio+descuento" es ambigua; se generan las lecturas
    // posibles y se descartan descuentos imposibles.
    if ($n === 1) {
        $candidatos[] = [(float) ($entero . "." . $grupo . "0"), 0];
    } elseif ($n === 2) {
        $candidatos[] = [(float) $entero, (int) $grupo];
    } elseif ($n === 3) {
        $candidatos[] = [(float) ($entero . "." . substr($grupo, 0, 2)), (int) substr($grupo, 2, 1)];
    } elseif ($n === 4) {
        $candidatos[] = [(float) ($entero . "." . substr($grupo, 0, 2)), (int) substr($grupo, 2, 2)];
        $candidatos[] = [(float) ($entero . substr($grupo, 0, 3)), (int) substr($grupo, 3, 1)];
    } elseif ($n === 5) {
        $candidatos[] = [(float) ($entero . substr($grupo, 0, 3)), (int) substr($grupo, 3, 2)];
    } else {
        $candidatos[] = [(float) ($entero . substr($grupo, 0, -2)), (int) substr($grupo, -2)];
    }

    // Descuento realista (1-80 %). Si hay varias lecturas, gana la que
    // deja el precio más cerca del precio de lista de referencia.
    $validos = array_values(array_filter(
        $candidatos,
        fn($c) => $c[0] > 0 && $c[1] >= 1 && $c[1] <= 80
    ));
    if (!$validos) {
        return [monto($s), 0];
    }
    if (count($validos) === 1) {
        return [$validos[0][0], $validos[0][1]];
    }

    usort($validos, function ($a, $b) use ($referencia) {
        $da = $referencia > 0 ? abs($a[0] - $referencia) : $a[1];
        $db = $referencia > 0 ? abs($b[0] - $referencia) : $b[1];
        return $da <=> $db;
    });

    return [$validos[0][0], $validos[0][1]];
}

function buscar_spec(array $specs, array $claves): string
{
    foreach ($specs as $clave => $valor) {
        foreach ($claves as $buscada) {
            if (mb_strtolower($clave) === mb_strtolower($buscada)) {
                return $valor;
            }
        }
    }
    return "";
}

function recortar(string $texto, int $maximo): string
{
    if (mb_strlen($texto) <= $maximo) {
        return $texto;
    }
    return rtrim(mb_substr($texto, 0, $maximo - 1)) . "…";
}

function marca_de(string $nombre): string
{
    $pistas = [
        "ACER" => ["acer", "aspire", "nitro", "predator"],
        "LENOVO" => ["lenovo", "thinkpad", "ideapad", "loq", "legion"],
        "HP" => ["hp", "probook", "pavilion", "omen"],
        "DELL" => ["dell", "latitude", "inspiron", "xps"],
        "ASUS" => ["asus", "tuf", "rog", "zenbook", "vivobook"],
        "ACEMAGIC" => ["acemagic"],
        "MSI" => ["msi", "katana", "cyborg"],
        "APPLE" => ["apple", "macbook"],
        "POWERBIT" => ["powerbit"],
    ];
    foreach ($pistas as $marca => $claves) {
        foreach ($claves as $clave) {
            if (preg_match('/\b' . preg_quote($clave, "/") . '\b/iu', $nombre)) {
                return $marca;
            }
        }
    }
    return "COMPUTLALTE";
}

// ---------------------------------------------------------------- parseo
$productos = [];
$avisos = [];
$slugs_usados = [];
$id_siguiente = 5;

foreach ($fuentes as $fuente) {
    if (!is_file($fuente["texto"])) {
        fwrite(STDERR, "Falta el archivo: {$fuente["texto"]}\n");
        exit(1);
    }

    $contenido = file_get_contents($fuente["texto"]);
    foreach (bloques($contenido) as $bloque) {
        $numero = $bloque["numero"];
        $lineas = $bloque["lineas"];

        // Título: primera línea que no sea ruido.
        $nombre = "";
        foreach ($lineas as $linea) {
            if (!es_ruido($linea)) {
                $nombre = texto_limpio($linea);
                break;
            }
        }
        if ($nombre === "") {
            $avisos[] = "{$fuente["categoria"]} #$numero: no encontré nombre.";
            continue;
        }
        $nombre = recortar($nombre, 180);

        // Precios.
        $precios = [];
        $resenas = 0;
        $stock = 8;

        foreach ($lineas as $linea) {
            $l = texto_limpio($linea);

            if (stripos($l, "Calificación") !== false && preg_match('/\((\d+)\)\s*$/u', $l, $rm)) {
                $resenas = (int) $rm[1];
            }

            if (preg_match('/¡?[ÚU]LTIMA UNIDAD!?/iu', $l)) {
                $stock = 1;
            } elseif (preg_match('/[ÚU]LTIMAS\s+(\d+)\s+UNIDADES/iu', $l, $sm)) {
                $stock = max(1, (int) $sm[1]);
            }

            if (str_contains($l, "meses") || str_contains($l, "Cupón") || str_contains($l, "cupón")) {
                continue;
            }
            if (!str_starts_with($l, "$")) {
                continue;
            }
            if (preg_match('/%\s*OFF\s*$/iu', $l)) {
                $referencia = (float) ($precios[0]["valor"] ?? 0);
                [$valor, $pct] = precio_con_descuento($l, $referencia);
                if ($valor > 0) {
                    $precios[] = ["valor" => $valor, "descuento" => $pct];
                }
            } elseif (preg_match('/^\$\s*[\d.,]+\s*$/u', $l)) {
                $valor = monto($l);
                if ($valor > 0) {
                    $precios[] = ["valor" => $valor, "descuento" => 0];
                }
            }
        }

        // Especificaciones "Clave: Valor".
        $specs = [];
        foreach ($lineas as $linea) {
            $l = texto_limpio($linea);
            if ($l === "" || preg_match('/^HYPERLINK\b/iu', $l)) {
                continue;
            }
            if (!preg_match('/^([^:]{2,60}):\s*(.+)$/u', $l, $m)) {
                continue;
            }
            $clave = texto_limpio($m[1]);
            $valor = texto_limpio(rtrim($m[2], "."));
            if ($valor === "" || stripos($valor, "http") !== false) {
                continue;
            }
            if (in_array(mb_strtolower($clave), ["principio del formulario", "final del formulario"], true)) {
                continue;
            }
            if (!isset($specs[$clave])) {
                $specs[$clave] = $valor;
            }
        }
        if (stripos(implode(" ", $lineas), "reacondicionado") !== false && !isset($specs["Estado"])) {
            $specs["Estado"] = "Reacondicionado excelente";
        }

        // Armado de características legibles.
        $cpuLinea = buscar_spec($specs, ["Línea del procesador"]);
        $cpuModelo = buscar_spec($specs, ["Modelo del procesador"]);
        $cpuMarca = buscar_spec($specs, ["Marca del procesador"]);
        $cpu = "";
        if ($cpuModelo !== "" && !preg_match('/^\d{1,3}$/', $cpuModelo)) {
            $cpu = sin_marcas($cpuModelo);
            if ($cpuLinea !== "" && stripos($cpu, $cpuLinea) === false) {
                $cpu = $cpuLinea . " " . $cpu;
            }
            if ($cpuMarca !== "" && stripos($cpu, $cpuMarca) === false) {
                $cpu = $cpuMarca . " " . $cpu;
            }
        } elseif ($cpuLinea !== "") {
            $cpu = $cpuLinea;
            if ($cpuMarca !== "" && stripos($cpu, $cpuMarca) === false) {
                $cpu = $cpuMarca . " " . $cpu;
            }
        }
        $cpu = texto_limpio(str_ireplace(["Processor", "Processor."], "", $cpu));

        $gpu = buscar_spec($specs, [
            "Tarjeta gráfica",
            "Modelo de la tarjeta gráfica dedicada",
            "Modelo de la tarjeta gráfica integrada",
        ]);
        $gpu = texto_limpio(sin_marcas($gpu));
        if (stripos($gpu, "Adreno") !== false) {
            $gpu = "Qualcomm Adreno";
        }

        $ram = buscar_spec($specs, ["Memoria RAM"]);
        $almacenamientoSsd = buscar_spec($specs, ["Capacidad de disco SSD"]);
        $almacenamiento = buscar_spec($specs, [
            "Capacidad de disco SSD",
            "Capacidad del disco",
            "Capacidad del disco duro",
        ]);
        if ($almacenamiento !== "" && $almacenamiento === $almacenamientoSsd
            && stripos($almacenamiento, "SSD") === false) {
            $almacenamiento .= " SSD";
        }
        $pantalla = buscar_spec($specs, ["Resolución de pantalla"]);
        $tactil = buscar_spec($specs, ["Con pantalla táctil"]);
        $sistema = buscar_spec($specs, ["Sistema operativo"]);
        if ($sistema === "") {
            $soNombre = buscar_spec($specs, ["Nombre del sistema operativo"]);
            $soVersion = buscar_spec($specs, ["Versión del sistema operativo"]);
            $soEdicion = buscar_spec($specs, ["Edición del sistema operativo"]);
            $sistema = texto_limpio(implode(" ", array_filter([$soNombre, $soVersion, $soEdicion])));
        }
        $color = buscar_spec($specs, ["Color"]);

        // Respaldo desde el título cuando el documento no trae especificaciones.
        if ($cpu === "") {
            $patronesCpu = [
                '/((?:Intel\s+)?Core\s+Ultra\s*\d+(?:\s+\d{3,5}[A-Z]*)?)/iu',
                '/((?:Intel\s+)?Core\s+i[3579][\s-]?\d{0,5}[A-Z]*)/iu',
                '/((?:Intel\s+)?i[3579][\s-]?\d{3,5}[A-Z]*)/iu',
                '/((?:AMD\s+)?Ryzen\s*[3579]\s*\d{0,4}[A-Z]*)/iu',
                '/(Snapdragon\s+X(?:\s+\w+)?)/iu',
                '/\b(i[3579])\b/iu',
            ];
            foreach ($patronesCpu as $patron) {
                if (preg_match($patron, $nombre, $cm)) {
                    $cpu = texto_limpio($cm[1]);
                    break;
                }
            }
        }

        $capacidades = [];
        if (preg_match_all('/(\d+)\s*(gb|tb)\b/iu', $nombre, $cm2, PREG_SET_ORDER)) {
            foreach ($cm2 as $c) {
                $capacidades[] = [
                    "num" => (int) $c[1],
                    "unidad" => strtoupper($c[2]),
                    "texto" => $c[1] . " " . strtoupper($c[2]),
                ];
            }
        }

        if ($ram === "") {
            if (preg_match('/(\d+)\s*gb\s*(?:de\s*)?(?:ram|memoria)/iu', $nombre, $rm)) {
                $ram = $rm[1] . " GB";
            } else {
                foreach ($capacidades as $c) {
                    if ($c["unidad"] === "GB" && in_array($c["num"], [4, 8, 12, 16, 24, 32, 48, 64, 96, 128], true)) {
                        $ram = $c["texto"];
                        break;
                    }
                }
            }
        }

        if ($almacenamiento === "") {
            $ramNum = $ram !== "" ? (int) filter_var($ram, FILTER_SANITIZE_NUMBER_INT) : 0;
            foreach (array_reverse($capacidades) as $c) {
                if ($c["unidad"] === "TB") {
                    $almacenamiento = $c["texto"] . " SSD";
                    break;
                }
            }
            if ($almacenamiento === "") {
                foreach ($capacidades as $c) {
                    if ($c["unidad"] === "GB" && $c["num"] >= 128 && $c["num"] !== $ramNum) {
                        $almacenamiento = $c["texto"] . " SSD";
                        break;
                    }
                }
            }
        }

        if ($pantalla === "" && preg_match('/(\d{2}(?:\.\d)?)\s*(?:\'\'|"|pulgadas)/iu', $nombre, $pm)) {
            $pantalla = $pm[1] . " pulgadas";
        }

        if ($gpu === "" && preg_match('/((?:RTX|GTX|RX)\s?\d{3,4}\s?(?:Ti|XT|SUPER)?)/iu', $nombre, $gm)) {
            $gpu = texto_limpio($gm[1]);
        }

        // Normaliza el procesador y completa la línea si el documento solo
        // traía el modelo (por ejemplo "AMD 5700" -> "AMD Ryzen 7 5700").
        if ($cpu !== "" && !preg_match('/Ryzen|Core|Snapdragon|Xeon|Athlon|Celeron|Pentium/iu', $cpu)) {
            if (preg_match('/((?:AMD\s+)?Ryzen\s*[3579]\s*\d{0,4}[A-Z]*)/iu', $nombre, $rm)) {
                $cpu = texto_limpio($rm[1]);
            }
        }
        if ($cpu !== "") {
            $cpu = preg_replace('/\bIntel\s+i([3579])\b/iu', 'Intel Core i$1', $cpu) ?? $cpu;
            $cpu = preg_replace('/(?<!Core\s)\bi([3579])\b/iu', 'Intel Core i$1', $cpu) ?? $cpu;
            $cpu = preg_replace('/\bAmd\b/iu', 'AMD', $cpu) ?? $cpu;
            $cpu = preg_replace('/\bCORE\b/iu', 'Core', $cpu) ?? $cpu;
        }
        // "Intel 14900KF" + título "Intel I9" -> "Intel Core i9 14900KF".
        if ($cpu !== "" && !preg_match('/Ryzen|Core|Snapdragon/iu', $cpu)) {
            if (preg_match('/\bIntel\s+i([3579])\b/iu', $nombre, $im) || preg_match('/\bi([3579])\b/iu', $nombre, $im)) {
                $modelo = preg_replace('/^Intel\s*/iu', '', $cpu) ?? $cpu;
                $cpu = "Intel Core i" . $im[1] . ($modelo !== "" ? " " . $modelo : "");
            }
        }

        // Si el documento no traía ficha técnica, se completa con lo que sí
        // se pudo leer del título para que el modal nunca quede vacío.
        if (count($specs) < 3) {
            $derivadas = [
                "Procesador" => $cpu,
                "Gráfica" => $gpu,
                "Memoria RAM" => $ram,
                "Almacenamiento" => $almacenamiento,
                "Pantalla" => $pantalla,
                "Sistema operativo" => $sistema,
                "Color" => $color,
            ];
            foreach ($derivadas as $clave_derivada => $valor_derivado) {
                if ($valor_derivado !== "" && !isset($specs[$clave_derivada])) {
                    $specs[$clave_derivada] = $valor_derivado;
                }
            }
        }

        $clave = [];
        if ($cpu !== "") {
            $clave[] = "Procesador " . $cpu;
        }
        if ($gpu !== "") {
            $clave[] = "Gráfica " . $gpu;
        }
        if ($ram !== "") {
            $clave[] = $ram . " de memoria RAM";
        }
        if ($almacenamiento !== "") {
            $clave[] = "Almacenamiento " . $almacenamiento;
        }
        if ($pantalla !== "") {
            $clave[] = "Pantalla " . $pantalla . (stripos($tactil, "sí") !== false ? " táctil" : "");
        }
        if ($sistema !== "") {
            $clave[] = $sistema;
        }
        if ($color !== "") {
            $clave[] = "Color " . $color;
        }
        if (stripos(implode(" ", $lineas), "reacondicionado") !== false) {
            $clave[] = "Equipo reacondicionado en estado excelente";
        }
        $clave = array_values(array_unique($clave));
        if (count($clave) < 3) {
            $clave[] = "Equipo de la categoría " . $fuente["categoria"];
            $clave[] = "Disponible en existencia";
        }
        $clave = array_slice($clave, 0, 6);

        // Precio final: se usa el precio de venta real (el más bajo si hay dos).
        $venta = 0.0;
        $descuento = 0;
        if (count($precios) >= 2) {
            $valores = array_column($precios, "valor");
            $venta = (float) min($valores);
        } elseif (count($precios) === 1) {
            $venta = (float) $precios[0]["valor"];
        }
        if ($venta <= 0) {
            $avisos[] = "{$fuente["categoria"]} #$numero ($nombre): sin precio.";
            continue;
        }

        // Costo base para que el margen global de 35 % reproduzca el precio.
        $costo = round($venta / 1.35, 2);

        // Imágenes de la carpeta correspondiente.
        $carpeta = rtrim($fuente["imagenes"], "/\\") . DIRECTORY_SEPARATOR . $numero;
        $archivos = [];
        if (is_dir($carpeta)) {
            $todos = glob($carpeta . DIRECTORY_SEPARATOR . "*") ?: [];
            $todos = array_values(array_filter($todos, 'is_file'));
            usort($todos, function ($a, $b) {
                $fa = stripos(basename($a), "-F.") !== false ? 0 : 1;
                $fb = stripos(basename($b), "-F.") !== false ? 0 : 1;
                return $fa <=> $fb ?: strnatcasecmp(basename($a), basename($b));
            });
            $vistos = [];
            foreach ($todos as $archivo) {
                $huella = sha1_file($archivo);
                if ($huella !== false && isset($vistos[$huella])) {
                    continue;
                }
                if ($huella !== false) {
                    $vistos[$huella] = true;
                }
                $archivos[] = $archivo;
            }
        } else {
            $avisos[] = "{$fuente["categoria"]} #$numero: falta la carpeta de imágenes.";
        }

        // Slug único.
        $slug = slugify($nombre);
        $base = $slug;
        $contador = 2;
        while (isset($slugs_usados[$slug])) {
            $slug = $base . "-" . $contador;
            $contador++;
        }
        $slugs_usados[$slug] = true;

        $productos[] = [
            "id" => $id_siguiente++,
            "numero" => $numero,
            "categoria" => $fuente["categoria"],
            "categoria_id" => $fuente["categoria_id"],
            "destino_base" => $fuente["destino"],
            "slug" => $slug,
            "nombre" => $nombre,
            "marca" => marca_de($nombre),
            "precio" => $venta,
            "costo" => $costo,
            "descuento" => $descuento,
            "stock" => $stock,
            "resenas" => $resenas,
            "specs" => $specs,
            "clave" => $clave,
            "descripcion" => "",
            "descripcion_corta" => "",
            "imagenes" => $archivos,
        ];
    }
}

// Descripciones.
foreach ($productos as &$p) {
    $categoria = $p["categoria"];
    $corta = implode(", ", array_slice($p["clave"], 0, 4));
    $p["descripcion_corta"] = recortar($corta, 255);

    $uso = $categoria === "Juegos"
        ? "Ideal para gaming, estudio y multitarea."
        : "Ideal para desarrollo, estudio y trabajo diario.";
    $p["descripcion"] = recortar(
        $p["nombre"] . " es un equipo de la categoría " . $categoria
        . ". Incluye " . implode(", ", array_slice($p["clave"], 0, 5)) . ". " . $uso,
        1000
    );
}
unset($p);

// -------------------------------------------------------------- reporte
$reporte = [];
$reporte[] = "IMPORTACIÓN DE PRODUCTOS — " . date("Y-m-d H:i:s");
$reporte[] = "Modo: " . ($aplicar ? "APLICAR" : "REVISIÓN (no se modificó nada)");
$reporte[] = str_repeat("=", 110);
foreach ($productos as $p) {
    $reporte[] = sprintf(
        "#%02d %-12s %-46s | %-12s | %10s | %2d img | %2d esp | stock %d | reseñas %d",
        $p["numero"],
        $p["categoria"],
        mb_substr($p["nombre"], 0, 46),
        $p["marca"],
        "$" . number_format($p["precio"], 2),
        count($p["imagenes"]),
        count($p["specs"]),
        $p["stock"],
        $p["resenas"]
    );
}
$reporte[] = str_repeat("=", 110);
$reporte[] = "Total productos: " . count($productos);
$reporte[] = "Total imágenes: " . array_sum(array_map(fn($p) => count($p["imagenes"]), $productos));
$reporte[] = "";
if ($avisos) {
    $reporte[] = "AVISOS:";
    foreach ($avisos as $aviso) {
        $reporte[] = " - " . $aviso;
    }
} else {
    $reporte[] = "Sin avisos.";
}

file_put_contents(__DIR__ . "/reporte_productos.txt", implode(PHP_EOL, $reporte) . PHP_EOL);
file_put_contents(
    __DIR__ . "/productos_parseados.json",
    json_encode($productos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

echo implode(PHP_EOL, $reporte) . PHP_EOL;

if (!$aplicar) {
    echo PHP_EOL . "Revisa _nuevos/reporte_productos.txt. Cuando todo esté bien: php _nuevos/importar_productos.php --apply" . PHP_EOL;
    exit(0);
}

// -------------------------------------------------------------- aplicar
$bd = obtenerConexion();
$bd->set_charset("utf8mb4");

// Seguridad: no duplicar productos ni pisar IDs ocupados.
$nombres = array_column($productos, "nombre");
$existentes = [];
$consulta = $bd->prepare("SELECT id, nombre FROM productos WHERE nombre = ? LIMIT 1");
foreach ($nombres as $nombre) {
    $consulta->bind_param("s", $nombre);
    $consulta->execute();
    $fila = $consulta->get_result()->fetch_assoc();
    if ($fila) {
        $existentes[] = $fila["nombre"];
    }
}
$consulta->close();
if ($existentes) {
    fwrite(STDERR, "Ya existen productos con estos nombres:\n - " . implode("\n - ", $existentes) . "\nNo se insertó nada.\n");
    exit(1);
}

$ids = array_column($productos, "id");
$rango = implode(",", $ids);
$ocupados = $bd->query("SELECT COUNT(*) AS t FROM productos WHERE id IN ($rango)")->fetch_assoc()["t"] ?? 0;
if ((int) $ocupados > 0) {
    fwrite(STDERR, "Los IDs $rango ya están ocupados. No se insertó nada.\n");
    exit(1);
}

$sql_lineas = [];
$sql_lineas[] = "-- Productos nuevos importados desde _nuevos (" . date("Y-m-d H:i:s") . ")";
$sql_lineas[] = "-- Ejecutar después de instalar la base original.";
$sql_lineas[] = "START TRANSACTION;";

$insertar = $bd->prepare(
    "INSERT INTO productos
     (id, nombre, descripcion, descripcion_corta, categoria_id, costo_base, precio_final,
      margen_propio, imagen_url, video_url, stock, estado, marca, tipo, etiqueta,
      destacado, en_oferta, descuento, resenas, vendidos, fecha_alta, terminos_busqueda,
      personalizacion)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?, 'activo', ?, 'computadora', '',
             0, 0, 0, ?, 0, ?, ?, ?)"
);
$insertar_spec = $bd->prepare(
    "INSERT INTO especificaciones (producto_id, tipo, descripcion) VALUES (?, ?, ?)"
);
$insertar_imagen = $bd->prepare(
    "INSERT INTO imagenes_producto (producto_id, url, posicion) VALUES (?, ?, ?)"
);

try {
    $bd->begin_transaction();
    $copiadas = 0;

    foreach ($productos as $p) {
        // Copiar imágenes.
        $carpeta_destino_rel = $p["destino_base"] . "/" . $p["slug"];
        $carpeta_destino_abs = $raiz . "/" . $carpeta_destino_rel;
        if (!is_dir($carpeta_destino_abs) && !mkdir($carpeta_destino_abs, 0775, true) && !is_dir($carpeta_destino_abs)) {
            throw new RuntimeException("No pude crear la carpeta $carpeta_destino_rel");
        }

        $rutas = [];
        foreach ($p["imagenes"] as $indice => $origen) {
            $numero_foto = $indice + 1;
            // La extensión se toma del archivo original: antes se forzaba
            // .webp y un PNG terminaba guardado como .webp (tipo incorrecto).
            $extension = strtolower(pathinfo($origen, PATHINFO_EXTENSION));
            if ($extension === "jpeg") {
                $extension = "jpg";
            }
            if (!in_array($extension, ["png", "jpg", "webp", "avif", "gif"], true)) {
                $extension = "webp";
            }
            $nombre_foto = sprintf("%s-%02d.%s", $p["slug"], $numero_foto, $extension);
            $destino_abs = $carpeta_destino_abs . "/" . $nombre_foto;
            if (!copy($origen, $destino_abs)) {
                throw new RuntimeException("No pude copiar la imagen " . basename($origen));
            }
            $rutas[] = $carpeta_destino_rel . "/" . $nombre_foto;
            $copiadas++;
        }

        $imagen_principal = $rutas[0] ?? "";
        $terminos = json_encode(
            array_values(array_unique(array_filter(
                preg_split('/[^a-z0-9áéíóúüñ]+/iu', mb_strtolower($p["nombre"] . " " . $p["marca"] . " " . $p["categoria"])) ?: [],
                fn($t) => mb_strlen($t) >= 3
            ))),
            JSON_UNESCAPED_UNICODE
        );
        $fecha = date("Y-m-d");

        $insertar->bind_param(
            "isssiddsisisss",
            $p["id"],
            $p["nombre"],
            $p["descripcion"],
            $p["descripcion_corta"],
            $p["categoria_id"],
            $p["costo"],
            $p["precio"],
            $imagen_principal,
            $p["stock"],
            $p["marca"],
            $p["resenas"],
            $fecha,
            $terminos,
            $personalizacion_estandar
        );
        $insertar->execute();

        foreach ($p["clave"] as $descripcion) {
            $tipo = "clave";
            $insertar_spec->bind_param("iss", $p["id"], $tipo, $descripcion);
            $insertar_spec->execute();
        }
        foreach ($p["specs"] as $clave => $valor) {
            $descripcion = recortar($clave . ": " . $valor, 255);
            $tipo = "tecnica";
            $insertar_spec->bind_param("iss", $p["id"], $tipo, $descripcion);
            $insertar_spec->execute();
        }
        foreach ($rutas as $indice => $ruta) {
            $posicion = $indice + 1;
            $insertar_imagen->bind_param("isi", $p["id"], $ruta, $posicion);
            $insertar_imagen->execute();
        }

        // SQL de respaldo.
        $e = fn($v) => "'" . str_replace(["\\", "'"], ["\\\\", "''"], (string) $v) . "'";
        $sql_lineas[] = "INSERT INTO `productos` (`id`,`nombre`,`descripcion`,`descripcion_corta`,`categoria_id`,`costo_base`,`precio_final`,`margen_propio`,`imagen_url`,`video_url`,`stock`,`estado`,`marca`,`tipo`,`etiqueta`,`destacado`,`en_oferta`,`descuento`,`resenas`,`vendidos`,`fecha_alta`,`terminos_busqueda`,`personalizacion`) VALUES ("
            . $p["id"] . "," . $e($p["nombre"]) . "," . $e($p["descripcion"]) . "," . $e($p["descripcion_corta"]) . ","
            . $p["categoria_id"] . "," . $p["costo"] . "," . $p["precio"] . ",NULL," . $e($imagen_principal) . ",NULL,"
            . $p["stock"] . ",'activo'," . $e($p["marca"]) . ",'computadora','',0,0,0," . $p["resenas"] . ",0,"
            . $e($fecha) . "," . $e($terminos) . "," . $e($personalizacion_estandar) . ");";
        foreach ($p["clave"] as $descripcion) {
            $sql_lineas[] = "INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (" . $p["id"] . ",'clave'," . $e($descripcion) . ");";
        }
        foreach ($p["specs"] as $clave => $valor) {
            $sql_lineas[] = "INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (" . $p["id"] . ",'tecnica'," . $e(recortar($clave . ": " . $valor, 255)) . ");";
        }
        foreach ($rutas as $indice => $ruta) {
            $sql_lineas[] = "INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (" . $p["id"] . "," . $e($ruta) . "," . ($indice + 1) . ");";
        }
    }

    $bd->commit();
    $sql_lineas[] = "COMMIT;";
    $sql_lineas[] = "ALTER TABLE `productos` AUTO_INCREMENT = " . (max($ids) + 1) . ";";
    file_put_contents(__DIR__ . "/productos_nuevos.sql", implode(PHP_EOL, $sql_lineas) . PHP_EOL);

    echo PHP_EOL . "LISTO: " . count($productos) . " productos insertados y $copiadas imágenes copiadas." . PHP_EOL;
    echo "SQL de respaldo: _nuevos/productos_nuevos.sql" . PHP_EOL;
} catch (Throwable $error) {
    $bd->rollback();
    fwrite(STDERR, "ERROR, se deshizo todo: " . $error->getMessage() . PHP_EOL);
    exit(1);
}

$insertar->close();
$insertar_spec->close();
$insertar_imagen->close();
