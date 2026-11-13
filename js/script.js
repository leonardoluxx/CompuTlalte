// Guarda referencias a los elementos HTML que controla este archivo.
const menuMovil = document.querySelector("#menu-movil");
const botonMenu = document.querySelector(".boton-menu");
const botonCerrar = document.querySelector(".boton-cerrar");
const botonAcordeon = document.querySelector(".boton-acordeon");
const submenuMovil = document.querySelector("#opciones-movil");

// Abre el panel, bloquea el desplazamiento del fondo y mueve el foco a la X.
function abrirMenu() {
    menuMovil.classList.add("esta-abierto");
    menuMovil.setAttribute("aria-hidden", "false");
    menuMovil.inert = false;
    botonMenu.setAttribute("aria-expanded", "true");
    botonMenu.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-abierto");
    botonCerrar.focus();
    if (document.activeElement !== botonCerrar) {
        requestAnimationFrame(() => botonCerrar.focus());
    }
}

// Cierra el panel, permite desplazar el fondo y devuelve el foco al botón.
function cerrarMenu() {
    menuMovil.classList.remove("esta-abierto");
    menuMovil.setAttribute("aria-hidden", "true");
    menuMovil.inert = true;
    botonMenu.setAttribute("aria-expanded", "false");
    botonMenu.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-abierto");
    botonMenu.focus();
}

// Cambia el estado del acordeón y actualiza su información de accesibilidad.
function cambiarEstadoSubmenu(estaAbierto) {
    botonAcordeon.setAttribute("aria-expanded", String(estaAbierto));
    submenuMovil.classList.toggle("esta-expandido", estaAbierto);
    submenuMovil.inert = !estaAbierto;
}

// Al pulsar la hamburguesa se abre el menú, y la X lo cierra.
botonMenu.addEventListener("click", abrirMenu);
botonCerrar.addEventListener("click", cerrarMenu);

// Al pulsar Computadoras se muestran u ocultan las opciones del acordeón.
botonAcordeon.addEventListener("click", () => {
    const estaAbierto = botonAcordeon.getAttribute("aria-expanded") === "true";
    cambiarEstadoSubmenu(!estaAbierto);
});

// Cierra el menú después de elegir un enlace.
menuMovil.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", cerrarMenu);
});

// Escape cierra el menú; Tab mantiene el foco dentro del panel móvil.
document.addEventListener("keydown", (evento) => {
    if (!menuMovil.classList.contains("esta-abierto")) {
        return;
    }

    if (evento.key === "Escape") {
        cerrarMenu();
        return;
    }

    if (evento.key === "Tab") {
        // Excluye los controles del submenú mientras esté cerrado (inert).
        const elementosEnfocables = [...menuMovil.querySelectorAll("a[href], button:not([disabled])")]
            .filter((elemento) => !elemento.closest("[inert]"));
        const primerElemento = elementosEnfocables[0];
        const ultimoElemento = elementosEnfocables[elementosEnfocables.length - 1];

        if (!menuMovil.contains(document.activeElement)) {
            evento.preventDefault();
            (evento.shiftKey ? ultimoElemento : primerElemento).focus();
        } else if (evento.shiftKey && document.activeElement === primerElemento) {
            evento.preventDefault();
            ultimoElemento.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimoElemento) {
            evento.preventDefault();
            primerElemento.focus();
        }
    }
});

// ============================================================= mega menú
// El panel de escritorio se abre al pasar el cursor (CSS) o cuando el foco
// llega por teclado (la clase .menu-abierto-teclado la pone este bloque).
// Un clic en un enlace debe cerrarlo de inmediato: antes el foco quedaba
// en el enlace y el panel se quedaba pegado en pantalla tras el clic.
const menusEscritorio = document.querySelectorAll(".menu-mega, .menu-ofertas");

menusEscritorio.forEach((menu) => {
    const panel = menu.querySelector(".contenido-mega, .contenido-ofertas");
    if (!panel) {
        return;
    }

    // Teclado: al llegar el foco por Tab el panel se abre; al salir, se cierra.
    menu.addEventListener("focusin", (evento) => {
        if (evento.target.matches(":focus-visible")) {
            menu.classList.add("menu-abierto-teclado");
            menu.classList.remove("mega-cerrado-forzado");
        }
    });

    menu.addEventListener("focusout", () => {
        menu.classList.remove("menu-abierto-teclado");
    });

    // Escape cierra el panel y devuelve el foco al enlace principal del menú.
    menu.addEventListener("keydown", (evento) => {
        if (evento.key !== "Escape") {
            return;
        }
        menu.classList.remove("menu-abierto-teclado");
        const enlacePrincipal = menu.querySelector(":scope > a");
        if (enlacePrincipal) {
            enlacePrincipal.focus();
        }
    });

    // Clic en un enlace del panel: navega y cierra el menú aunque el cursor
    // siga encima. El cierre forzado se retira al salir del área del menú,
    // así la siguiente pasada del cursor lo vuelve a abrir con normalidad.
    panel.querySelectorAll("a").forEach((enlace) => {
        enlace.addEventListener("click", () => {
            menu.classList.remove("menu-abierto-teclado");
            menu.classList.add("mega-cerrado-forzado");
            enlace.blur();
        });
    });

    menu.addEventListener("mouseleave", () => {
        menu.classList.remove("mega-cerrado-forzado");
    });
});

// Si la ventana pasa a escritorio, cierra el panel y reinicia el acordeón.
window.matchMedia("(min-width: 769px)").addEventListener("change", (cambio) => {
    if (cambio.matches && menuMovil.classList.contains("esta-abierto")) {
        cerrarMenu();
        cambiarEstadoSubmenu(false);
    }
});

// Formatea los importes como pesos mexicanos sin depender de servicios externos.
const formateadorMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
});

// Configuración que incluye cada equipo sin costo adicional. Se guarda con el
// producto para que el carrito pueda mostrarla y volver a editarla.
const mejorasPredeterminadas = [
    { grupo: "almacenamiento", grupoEtiqueta: "Almacenamiento", valor: "1-tb", etiqueta: "1 TB", extra: 0 },
    { grupo: "memoria", grupoEtiqueta: "Memoria RAM", valor: "16-gb", etiqueta: "16 GB", extra: 0 },
    { grupo: "color", grupoEtiqueta: "Color", valor: "plata", etiqueta: "Plata", extra: 0 }
];

// La interfaz consume el catálogo que vive en MySQL: api/bootstrap.php
// lo entrega sincrónicamente en window.DatosBD antes de este archivo.
const productos = window.Tienda
    ? window.Tienda.productos()
    : [];

// Elementos de la página que reciben las tarjetas y los datos del modal.
const contenedorCatalogoComputadoras = document.querySelector("#catalogo");
const rejillaComputadoras = document.querySelector("#rejilla-computadoras");
const filtrosComputadoras = document.querySelector("#filtros-computadoras");
const selectorOrdenComputadoras = document.querySelector("#orden-computadoras");
const conteoComputadoras = document.querySelector("#conteo-computadoras");
const mensajeSinComputadoras = document.querySelector("#sin-resultados-computadoras");
const botonLimpiarFiltrosComputadoras = document.querySelector("#limpiar-filtros-computadoras");
const contenedorComputadoras = document.querySelector("#contenedor-catalogo-computadoras");
const botonAlternarFiltrosComputadoras = document.querySelector("#alternar-filtros-computadoras");
const textoAlternarFiltrosComputadoras = document.querySelector("#texto-alternar-filtros-computadoras");
const rejillaOfertas = document.querySelector("#rejilla-ofertas");
const rejillaAccesorios = document.querySelector("#rejilla-accesorios");
const filtrosAccesorios = document.querySelector("#filtros-accesorios");
const selectorOrdenAccesorios = document.querySelector("#orden-accesorios");
const conteoAccesorios = document.querySelector("#conteo-accesorios");
const mensajeSinAccesorios = document.querySelector("#sin-resultados-accesorios");
const botonLimpiarFiltros = document.querySelector("#limpiar-filtros");
const contenedorCatalogo = document.querySelector("#contenedor-catalogo");
const botonAlternarFiltros = document.querySelector("#alternar-filtros");
const textoAlternarFiltros = document.querySelector("#texto-alternar-filtros");
const modalProducto = document.querySelector("#modal-producto");
const botonAbrirBusqueda = document.querySelector("#abrir-busqueda");
const modalBusqueda = document.querySelector("#modal-busqueda");
const botonCerrarBusqueda = document.querySelector("#cerrar-busqueda");
const campoBusqueda = document.querySelector("#campo-busqueda");
const estadoBusqueda = document.querySelector("#estado-busqueda");
const resultadosBusqueda = document.querySelector("#resultados-busqueda");
const historialBusqueda = document.querySelector("#historial-busqueda");
const etiquetasHistorial = document.querySelector("#etiquetas-historial");
const botonLimpiarHistorial = document.querySelector("#limpiar-historial");
const CLAVE_HISTORIAL_BUSQUEDA = "computlalte-busquedas-recientes";
const MAXIMO_HISTORIAL_BUSQUEDA = 6;
const CLAVE_PRODUCTOS_VISTOS = "computlalte-productos-vistos";
const MAXIMO_PRODUCTOS_VISTOS = 4;
const botonCerrarModal = document.querySelector("#cerrar-modal-producto");
const modalResenas = document.querySelector("#modal-resenas");
const botonCerrarResenas = document.querySelector("#cerrar-modal-resenas");
const promedioResenas = document.querySelector("#promedio-resenas");
const listaResenas = document.querySelector("#lista-resenas");
const botonEscribirResena = document.querySelector("#escribir-resena");
const botonCancelarResena = document.querySelector("#cancelar-resena");
const formResena = document.querySelector("#form-resena");
const publicarComoResena = document.querySelector("#resena-como");
const avisoResena = document.querySelector("#aviso-resena");
const contenedorEstrellasResena = document.querySelector("#estrellas-resena");
const botonesEstrellasResena = contenedorEstrellasResena
    ? Array.from(contenedorEstrellasResena.querySelectorAll("button"))
    : [];
const inputResenaComentario = document.querySelector("#resena-comentario");
const imagenPrincipalProducto = document.querySelector("#imagen-principal-producto");
const miniaturasProducto = document.querySelector("#miniaturas-producto");
const botonImagenAnterior = document.querySelector("#imagen-anterior");
const botonImagenSiguiente = document.querySelector("#imagen-siguiente");
const galeriaProducto = document.querySelector(".galeria-producto");
const DURACION_FLECHAS_GALERIA = 4000;
let temporizadorFlechasGaleria = null;
const tituloModal = document.querySelector("#modal-titulo");
const categoriaProducto = document.querySelector("#categoria-producto");
const precioProducto = document.querySelector("#precio-producto");
const totalPersonalizacion = document.querySelector("#total-personalizacion");
const seccionPersonalizacion = document.querySelector("#personalizacion-producto");
const botonPersonalizacion = document.querySelector("#alternar-personalizacion");
const contenedorOpcionesPersonalizacion = document.querySelector("#opciones-personalizacion");
const interiorOpcionesPersonalizacion = contenedorOpcionesPersonalizacion?.querySelector(".interior-opciones-personalizacion");
const textoBotonPersonalizacion = document.querySelector(".texto-boton-personalizacion");
const descripcionProducto = document.querySelector("#descripcion-producto");
const listaCaracteristicas = document.querySelector("#caracteristicas-producto");
const listaEspecificaciones = document.querySelector("#especificaciones-producto");
const estadoCompra = document.querySelector("#estado-compra-producto");
const botonComprarProducto = document.querySelector("#comprar-producto");
const listasDetallesProducto = document.querySelector("#listas-detalles-producto");
const botonAlternarDetalles = document.querySelector("#alternar-detalles");
let elementoQueAbrioModal = null;
let productoModalActual = null;
let indiceImagenActual = 0;
let descuentoProductoActual = 0;

// Las categorías del menú se aplican como filtro del catálogo de computadoras.
const categoriasPorAncla = {
    juegos: "Juegos",
    desarrollo: "Desarrollo",
    "uso-diario": "Uso Diario"
};

// Crea un elemento de texto con su etiqueta y clase, sin insertar HTML dinámico.
function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    elemento.textContent = texto;
    return elemento;
}

// Devuelve el costo base más el margen configurado en el panel (global o propio).
function calcularPrecioFinal(producto) {
    if (window.Tienda) {
        return window.Tienda.precioLista(producto);
    }

    return Math.round((Number(producto.costoBase) || 0) * 1.35);
}

// Precio público: usa la oferta del producto salvo que se indique otra.
function calcularPrecioOferta(producto, descuentoPorcentaje) {
    if (!window.Tienda) {
        const descuento = Number(descuentoPorcentaje) || 0;
        return Math.round(calcularPrecioFinal(producto) * (1 - descuento / 100));
    }

    if (descuentoPorcentaje === undefined || descuentoPorcentaje === null) {
        return window.Tienda.precioVenta(producto);
    }

    return window.Tienda.precioConDescuento(producto, descuentoPorcentaje);
}

// Descuento vigente del producto según las ofertas que definió el panel.
function descuentoVigente(producto) {
    return window.Tienda ? window.Tienda.descuentoDe(producto) : 0;
}

// Opciones de personalización marcadas actualmente en el modal.
function obtenerOpcionesPersonalizacion() {
    if (!seccionPersonalizacion) {
        return [];
    }

    return [...seccionPersonalizacion.querySelectorAll('input[type="radio"]:checked')];
}

// Suma únicamente los extras de las mejoras seleccionadas.
function calcularExtrasPersonalizacion() {
    return obtenerOpcionesPersonalizacion().reduce(
        (total, opcion) => total + Number(opcion.dataset.extra || 0),
        0
    );
}

// Texto legible de la configuración elegida, por ejemplo "2 TB, 32 GB, Plata".
function describirPersonalizacion() {
    return obtenerOpcionesPersonalizacion()
        .map((opcion) => opcion.closest(".opcion-personalizacion")?.querySelector("strong")?.textContent.trim() || "")
        .filter(Boolean)
        .join(", ");
}

// Versión estructurada de las mejoras elegidas. Se guarda en el carrito para
// poder mostrar cada cambio y reabrir el editor sin perder la selección.
function describirOpcionesPersonalizacion() {
    return obtenerOpcionesPersonalizacion().map((opcion) => {
        const grupo = opcion.closest(".grupo-personalizacion");

        return {
            grupo: opcion.name.replace("personalizacion-", ""),
            grupoEtiqueta: grupo?.querySelector("legend")?.textContent.trim() || "",
            valor: opcion.value,
            etiqueta: opcion.closest(".opcion-personalizacion")?.querySelector("strong")?.textContent.trim() || opcion.value,
            extra: Number(opcion.dataset.extra || 0)
        };
    });
}

function renderizarPersonalizacion(producto) {
    if (!interiorOpcionesPersonalizacion) {
        return false;
    }

    const grupos = Array.isArray(producto.personalizacion) ? producto.personalizacion : [];
    const contenido = document.createDocumentFragment();

    grupos.forEach((grupo) => {
        const opciones = Array.isArray(grupo.opciones) ? grupo.opciones : [];
        if (!opciones.length) {
            return;
        }

        const campo = document.createElement("fieldset");
        campo.className = "grupo-personalizacion";
        const titulo = document.createElement("legend");
        titulo.textContent = grupo.grupoEtiqueta || grupo.grupo || "Opciones";
        campo.append(titulo);

        const lista = document.createElement("div");
        lista.className = "opciones-personalizacion";

        opciones.forEach((opcion, indice) => {
            const etiqueta = document.createElement("label");
            etiqueta.className = "opcion-personalizacion";
            const entrada = document.createElement("input");
            entrada.type = "radio";
            entrada.name = `personalizacion-${grupo.grupo}`;
            entrada.value = String(opcion.valor ?? indice);
            entrada.dataset.extra = String(Math.max(0, Number(opcion.extra) || 0));
            entrada.checked = indice === 0;

            const contenidoOpcion = document.createElement("span");
            contenidoOpcion.className = "contenido-opcion";
            const nombreOpcion = document.createElement("strong");
            nombreOpcion.textContent = String(opcion.etiqueta || opcion.valor || "Opción");
            const precioOpcion = document.createElement("small");
            precioOpcion.textContent = Number(opcion.extra) > 0
                ? `+ ${formateadorMoneda.format(Number(opcion.extra))}`
                : "Incluido";

            contenidoOpcion.append(nombreOpcion, precioOpcion);
            etiqueta.append(entrada, contenidoOpcion);
            lista.append(etiqueta);
        });

        campo.append(lista);
        contenido.append(campo);
    });

    if (totalPersonalizacion) {
        contenido.append(totalPersonalizacion);
    }
    interiorOpcionesPersonalizacion.replaceChildren(contenido);
    return grupos.some((grupo) => Array.isArray(grupo.opciones) && grupo.opciones.length > 0);
}

// Vuelve a la configuración incluida y deja las opciones cerradas al abrir un equipo.
function reiniciarPersonalizacion() {
    if (!seccionPersonalizacion) {
        return;
    }

    seccionPersonalizacion.querySelectorAll(".grupo-personalizacion").forEach((grupo) => {
        const primeraOpcion = grupo.querySelector('input[type="radio"]');
        if (primeraOpcion) {
            primeraOpcion.checked = true;
        }
    });

    establecerOpcionesPersonalizacion(false);
}

// Despliega o pliega las opciones de personalización y sincroniza el botón.
function establecerOpcionesPersonalizacion(abiertas) {
    if (!seccionPersonalizacion || !botonPersonalizacion) {
        return;
    }

    seccionPersonalizacion.classList.toggle("personalizacion-abierta", abiertas);
    botonPersonalizacion.setAttribute("aria-expanded", String(abiertas));

    if (contenedorOpcionesPersonalizacion) {
        contenedorOpcionesPersonalizacion.setAttribute("aria-hidden", String(!abiertas));
    }

    if (textoBotonPersonalizacion) {
        textoBotonPersonalizacion.textContent = abiertas ? "Ocultar opciones" : "Personalizar ahora";
    }
}

// Recalcula el precio visible y devuelve el total que debe cobrarse.
function actualizarPrecioProducto() {
    if (!productoModalActual) {
        return 0;
    }

    const extras = productoModalActual.tipo === "accesorio" ? 0 : calcularExtrasPersonalizacion();
    const precioBase = calcularPrecioOferta(productoModalActual, descuentoProductoActual);
    const precioTotal = precioBase + extras;
    precioProducto.textContent = descuentoProductoActual > 0
        ? `${formateadorMoneda.format(precioTotal)} · ${descuentoProductoActual}% de descuento`
        : formateadorMoneda.format(precioTotal);

    if (totalPersonalizacion) {
        totalPersonalizacion.textContent = extras > 0
            ? `Precio final: ${formateadorMoneda.format(precioTotal)} · +${formateadorMoneda.format(extras)} en mejoras`
            : `Precio final: ${formateadorMoneda.format(precioTotal)}`;
    }

    return precioTotal;
}

// Extrae del catálogo solo los accesorios que corresponden a la categoría indicada.
function obtenerAccesorios() {
    return productos.filter((producto) => producto.tipo === "accesorio");
}

// Normaliza mayúsculas y acentos para que la búsqueda tolere distintas escrituras.
function normalizarBusqueda(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Historial de búsquedas: vive en el navegador del usuario, no en un servidor.
function leerHistorialBusqueda() {
    try {
        const guardadas = JSON.parse(window.localStorage.getItem(CLAVE_HISTORIAL_BUSQUEDA) || "[]");

        if (!Array.isArray(guardadas)) {
            return [];
        }

        return guardadas
            .filter((termino) => typeof termino === "string" && termino.trim())
            .slice(0, MAXIMO_HISTORIAL_BUSQUEDA);
    } catch (error) {
        // Si el navegador bloquea el almacenamiento, el buscador sigue igual.
        return [];
    }
}

function guardarHistorialBusqueda(terminos) {
    try {
        window.localStorage.setItem(CLAVE_HISTORIAL_BUSQUEDA, JSON.stringify(terminos));
    } catch (error) {
        // Sin almacenamiento disponible el historial solo dura esta visita.
    }
}

// Guarda el término al frente y evita repetidos aunque cambien mayúsculas.
function registrarBusquedaEnHistorial(termino) {
    const limpio = termino.replace(/\s+/g, " ").trim();

    if (!limpio) {
        return;
    }

    const clave = normalizarBusqueda(limpio);
    const terminos = leerHistorialBusqueda()
        .filter((guardado) => normalizarBusqueda(guardado) !== clave);

    terminos.unshift(limpio);
    guardarHistorialBusqueda(terminos.slice(0, MAXIMO_HISTORIAL_BUSQUEDA));
    dibujarHistorialBusqueda();
}

// Pinta las búsquedas recientes y oculta el bloque cuando no hay ninguna.
function dibujarHistorialBusqueda() {
    if (!historialBusqueda || !etiquetasHistorial) {
        return;
    }

    const terminos = leerHistorialBusqueda();

    etiquetasHistorial.replaceChildren(
        ...terminos.map((termino) => {
            const boton = document.createElement("button");
            boton.className = "etiqueta-historial";
            boton.type = "button";
            boton.dataset.termino = termino;
            boton.append(crearElemento("span", "", termino));
            return boton;
        })
    );

    historialBusqueda.hidden = terminos.length === 0;
}

// Productos vistos hace poco: son el historial principal del buscador, con
// imagen, nombre y precio en lugar de solo texto.
function leerProductosVistos() {
    try {
        const guardados = JSON.parse(window.localStorage.getItem(CLAVE_PRODUCTOS_VISTOS) || "[]");

        if (!Array.isArray(guardados)) {
            return [];
        }

        return guardados
            .filter((id) => Number.isFinite(id))
            .slice(0, MAXIMO_PRODUCTOS_VISTOS);
    } catch (error) {
        return [];
    }
}

// Cada producto abierto sube al inicio de la lista sin repetirse.
function registrarProductoVisto(producto) {
    const vistos = leerProductosVistos().filter((id) => id !== producto.id);
    vistos.unshift(producto.id);

    try {
        window.localStorage.setItem(
            CLAVE_PRODUCTOS_VISTOS,
            JSON.stringify(vistos.slice(0, MAXIMO_PRODUCTOS_VISTOS))
        );
    } catch (error) {
        // Sin almacenamiento disponible la lista solo dura esta visita.
    }
}

// Opción del buscador: sirve para resultados y para productos vistos.
function crearOpcionResultado(producto, { conImagen = false } = {}) {
    const opcion = document.createElement("button");
    opcion.className = "resultado-busqueda";
    opcion.type = "button";
    opcion.dataset.productoId = producto.id;
    opcion.setAttribute("role", "option");

    if (conImagen) {
        const marco = document.createElement("span");
        marco.className = "imagen-resultado-busqueda";

        const imagen = document.createElement("img");
        imagen.src = producto.imagenPrincipal;
        imagen.alt = "";
        imagen.loading = "lazy";

        marco.append(imagen);
        opcion.append(marco);
    }

    const texto = document.createElement("span");
    texto.className = "texto-resultado-busqueda";
    texto.append(
        crearElemento("strong", "", producto.nombre),
        crearElemento("span", "", producto.especificacionesCortas)
    );

    const precio = crearElemento(
        "span",
        "precio-resultado-busqueda",
        formateadorMoneda.format(calcularPrecioFinal(producto))
    );
    opcion.append(texto, precio);

    return opcion;
}

// Con el campo vacío se muestran los últimos productos abiertos.
function mostrarProductosVistos() {
    dibujarHistorialBusqueda();
    const hayBusquedasGuardadas = historialBusqueda && !historialBusqueda.hidden;

    const vistos = leerProductosVistos()
        .map((id) => productos.find((producto) => producto.id === id))
        .filter(Boolean);

    resultadosBusqueda.replaceChildren(
        ...vistos.map((producto) => crearOpcionResultado(producto, { conImagen: true }))
    );

    if (vistos.length) {
        estadoBusqueda.textContent = "Productos que viste recientemente.";
    } else {
        estadoBusqueda.textContent = hayBusquedasGuardadas
            ? "Elige una búsqueda reciente o escribe un producto."
            : "Empieza a escribir para ver sugerencias.";
    }
}

// Filtra el catálogo mientras se escribe y construye opciones accesibles.
function actualizarSugerenciasBusqueda(consulta) {
    const termino = normalizarBusqueda(consulta);
    resultadosBusqueda.replaceChildren();

    // Sin texto se muestran los productos vistos y las búsquedas guardadas.
    if (!termino) {
        mostrarProductosVistos();
        return;
    }

    if (historialBusqueda) {
        historialBusqueda.hidden = true;
    }

    const coincidencias = productos.filter((producto) => {
        const camposProducto = [
            producto.marca,
            producto.nombre,
            producto.categoria,
            producto.especificacionesCortas,
            producto.descripcionLarga,
            ...producto.terminosBusqueda
        ];

        return camposProducto.some((campo) => normalizarBusqueda(campo).includes(termino));
    });

    estadoBusqueda.textContent = coincidencias.length
        ? `${coincidencias.length} producto${coincidencias.length === 1 ? "" : "s"} encontrado${coincidencias.length === 1 ? "" : "s"}`
        : "No encontramos productos con ese nombre.";

    coincidencias.forEach((producto) => {
        resultadosBusqueda.append(crearOpcionResultado(producto));
    });
}

// Abre la ventana y deja el cursor listo en el campo de búsqueda.
function abrirBusqueda() {
    campoBusqueda.value = "";
    actualizarSugerenciasBusqueda("");
    modalBusqueda.showModal();
    campoBusqueda.focus();
}

// Cada producto tiene su página: los equipos viven en index.html y los
// accesorios en accesorios.html. Devuelve dónde está su tarjeta de venta.
function paginaDeProducto(producto) {
    return producto.tipo === "accesorio" ? "accesorios.html" : "index.html";
}

// Nombre del archivo de la página que se está viendo ahora mismo.
function paginaActual() {
    return window.location.pathname.split("/").pop() || "index.html";
}

// Elige una sugerencia: si el producto es de esta página se abre su tarjeta
// aquí mismo; si es de otra, se viaja hasta ella para no enseñar una versión
// recortada del detalle.
function abrirProductoDesdeBusqueda(botonResultado) {
    const producto = productos.find((elemento) => elemento.id === Number(botonResultado.dataset.productoId));
    if (!producto) {
        return;
    }

    // La búsqueda que sí llevó a un producto merece quedarse en el historial.
    registrarBusquedaEnHistorial(campoBusqueda.value);

    const paginaDestino = paginaDeProducto(producto);

    if (paginaDestino !== paginaActual()) {
        window.location.href = `${paginaDestino}#producto-${producto.id}`;
        return;
    }

    if (producto.tipo !== "accesorio") {
        aplicarCategoriaComputadoras(producto.categoria);
    }

    modalBusqueda.close();
    mostrarDetallesProducto(producto, botonAbrirBusqueda);
}

// Construye la tarjeta de un producto. La misma función sirve para el catálogo,
// los accesorios y las ofertas, donde se aplica el descuento promocional.
function crearTarjetaProducto(producto, { descuentoPorcentaje = null, etiquetaOferta = "" } = {}) {
    // Sin descuento explícito se usa la oferta activa del producto.
    const descuento = descuentoPorcentaje === null
        ? descuentoVigente(producto)
        : (Number(descuentoPorcentaje) || 0);
    const textoOferta = etiquetaOferta || (descuento > 0 ? `${descuento}% de descuento` : "");

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";

    const botonTarjeta = document.createElement("button");
    botonTarjeta.className = "boton-tarjeta-producto";
    botonTarjeta.type = "button";
    botonTarjeta.dataset.productoId = producto.id;
    botonTarjeta.dataset.descuento = String(descuento);
    botonTarjeta.setAttribute("aria-haspopup", "dialog");

    const marcoImagen = document.createElement("div");
    marcoImagen.className = "imagen-tarjeta-producto";

    const imagen = document.createElement("img");
    imagen.src = producto.imagenPrincipal;
    imagen.alt = producto.tipo === "accesorio"
        ? `Vista del accesorio ${producto.nombre}`
        : `Vista del equipo ${producto.nombre}`;
    imagen.loading = "lazy";

    const etiquetaEstado = crearElemento(
        "span",
        `etiqueta-categoria-producto ${producto.disponible === false ? "etiqueta-agotado" : ""}`,
        producto.disponible === false ? "Agotado" : (producto.etiqueta || producto.categoria)
    );
    marcoImagen.append(imagen, etiquetaEstado);

    if (textoOferta) {
        marcoImagen.append(crearElemento("span", "etiqueta-oferta", textoOferta));
    }

    const contenido = document.createElement("div");
    contenido.className = "contenido-tarjeta-producto";
    contenido.append(
        crearElemento("p", "marca-producto", producto.marca),
        crearElemento("h3", "nombre-tarjeta-producto", producto.nombre),
        crearElemento("p", "especificaciones-cortas-producto", producto.especificacionesCortas)
    );

    const pie = document.createElement("div");
    pie.className = "pie-tarjeta-producto";

    const precio = document.createElement("div");
    precio.className = "precio-tarjeta-producto";
    precio.append(
        crearElemento("span", "", descuento > 0 ? "Precio de oferta" : "Precio"),
        crearElemento("strong", "", formateadorMoneda.format(calcularPrecioOferta(producto, descuento)))
    );

    if (descuento > 0) {
        precio.append(
            crearElemento("small", "precio-anterior", formateadorMoneda.format(calcularPrecioFinal(producto)))
        );
    }

    const accionesTarjeta = document.createElement("div");
    accionesTarjeta.className = "acciones-tarjeta-producto";

    const botonAnadirCarrito = document.createElement("button");
    botonAnadirCarrito.className = "boton-anadir-carrito";
    botonAnadirCarrito.type = "button";
    botonAnadirCarrito.textContent = "Añadir al carrito";
    botonAnadirCarrito.addEventListener("click", (evento) => {
        evento.stopPropagation();
        añadirProductoAlCarrito(producto, calcularPrecioOferta(producto, descuento));
        botonAnadirCarrito.textContent = "Añadido ✓";
        setTimeout(() => {
            botonAnadirCarrito.textContent = "Añadir al carrito";
        }, 1000);
    });

    const accion = document.createElement("span");
    accion.className = "accion-ver-detalles";
    accion.append(document.createTextNode("Ver detalles"));

    const flecha = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    flecha.setAttribute("viewBox", "0 0 24 24");
    flecha.setAttribute("aria-hidden", "true");
    const trazoFlecha = document.createElementNS("http://www.w3.org/2000/svg", "path");
    trazoFlecha.setAttribute("d", "M5 12h14m-6-6 6 6-6 6");
    flecha.append(trazoFlecha);
    accion.append(flecha);

    accionesTarjeta.append(botonAnadirCarrito, accion);
    pie.append(precio, accionesTarjeta);
    contenido.append(pie);
    botonTarjeta.append(marcoImagen, contenido);

    // Franja de reseñas bajo la tarjeta: SIEMPRE visible y cliqueable, con
    // el promedio y el total REALES de la base de datos. Sin reseñas dice
    // "Aún no tiene reseñas" y abre el panel para dejar la primera.
    const botonResenas = document.createElement("button");
    botonResenas.className = "reseñas-tarjeta";
    botonResenas.type = "button";
    botonResenas.dataset.idProductoResenas = String(producto.id);
    botonResenas.title = "Ver reseñas de este producto";
    botonResenas.setAttribute("aria-label", `Ver reseñas de ${producto.nombre}`);
    pintarResumenResenas(botonResenas, producto);
    botonResenas.addEventListener("click", () => {
        // Abre el detalle del producto y encima el panel de reseñas.
        mostrarDetallesProducto(producto, botonResenas, { descuentoPorcentaje: descuento });
        abrirResenasProducto();
    });

    tarjeta.append(botonTarjeta, botonResenas);

    return tarjeta;
}

// Dibuja el catálogo de computadoras aplicando disponibilidad, categoría,
// rango de precio y orden, igual que la página de accesorios.
function mostrarComputadoras() {
    if (!rejillaComputadoras || !filtrosComputadoras || !selectorOrdenComputadoras) {
        return;
    }

    const disponibilidadSeleccionada = [...filtrosComputadoras.querySelectorAll('input[name="disponibilidad-computadora"]:checked')]
        .map((filtro) => filtro.value);
    const categoriasSeleccionadas = [...filtrosComputadoras.querySelectorAll('input[name="categoria-computadora"]:checked')]
        .map((filtro) => filtro.value);
    const rangosSeleccionados = [...filtrosComputadoras.querySelectorAll('input[name="precio-computadora"]:checked')]
        .map((filtro) => filtro.value);

    const coincideRangoPrecio = (precio) => {
        if (!rangosSeleccionados.length) {
            return true;
        }

        return rangosSeleccionados.some((rango) => {
            if (rango === "menos-15000") {
                return precio < 15000;
            }
            if (rango === "15000-30000") {
                return precio >= 15000 && precio <= 30000;
            }
            return precio > 30000;
        });
    };

    const computadorasVisibles = productos.filter((producto) => {
        if (producto.tipo === "accesorio") {
            return false;
        }

        const estado = producto.disponible === false ? "agotado" : "disponible";
        const coincideDisponibilidad = !disponibilidadSeleccionada.length
            || disponibilidadSeleccionada.includes(estado);
        const coincideCategoria = !categoriasSeleccionadas.length
            || categoriasSeleccionadas.includes(producto.categoria);
        // El filtro usa el precio que realmente paga el cliente (con oferta).
        const coincidePrecio = coincideRangoPrecio(calcularPrecioOferta(producto));

        return coincideDisponibilidad && coincideCategoria && coincidePrecio;
    });

    const criterioOrden = selectorOrdenComputadoras.value;
    computadorasVisibles.sort((primero, segundo) => {
        switch (criterioOrden) {
            case "precio-ascendente":
                return calcularPrecioOferta(primero) - calcularPrecioOferta(segundo);
            case "precio-descendente":
                return calcularPrecioOferta(segundo) - calcularPrecioOferta(primero);
            default:
                return Number(segundo.destacado) - Number(primero.destacado)
                    || primero.id - segundo.id;
        }
    });

    rejillaComputadoras.replaceChildren(
        ...computadorasVisibles.map((producto) => crearTarjetaProducto(producto))
    );

    if (conteoComputadoras) {
        const cantidad = computadorasVisibles.length;
        conteoComputadoras.textContent = `${cantidad} artículo${cantidad === 1 ? "" : "s"} encontrado${cantidad === 1 ? "" : "s"}`;
    }

    if (mensajeSinComputadoras) {
        mensajeSinComputadoras.hidden = computadorasVisibles.length > 0;
    }
}

// Aplica una categoría concreta desde el menú o un enlace interno.
function aplicarCategoriaComputadoras(categoria) {
    if (!filtrosComputadoras) {
        return;
    }

    filtrosComputadoras.querySelectorAll('input[name="categoria-computadora"]').forEach((casilla) => {
        casilla.checked = casilla.value === categoria;
    });

    mostrarComputadoras();
}

// Si la página llega con #juegos, #desarrollo o #uso-diario, abre esa categoría.
function aplicarCategoriaDesdeHash() {
    const categoria = categoriasPorAncla[window.location.hash.slice(1)];
    if (categoria) {
        aplicarCategoriaComputadoras(categoria);
        return true;
    }

    return false;
}

// Dibuja tarjetas de accesorios, aplicando filtros y orden al conjunto local.
function mostrarAccesorios() {
    const disponibilidadSeleccionada = [...filtrosAccesorios.querySelectorAll('input[name="disponibilidad"]:checked')]
        .map((filtro) => filtro.value);
    const categoriasSeleccionadas = [...filtrosAccesorios.querySelectorAll('input[name="categoria-accesorio"]:checked')]
        .map((filtro) => filtro.value);

    let accesoriosVisibles = obtenerAccesorios().filter((producto) => {
        const coincideDisponibilidad = !disponibilidadSeleccionada.length
            || disponibilidadSeleccionada.includes(producto.disponible ? "disponible" : "agotado");
        const coincideCategoria = !categoriasSeleccionadas.length
            || categoriasSeleccionadas.includes(producto.categoria);

        return coincideDisponibilidad && coincideCategoria;
    });

    // Ordena la copia visible; el catálogo original no se altera.
    const criterioOrden = selectorOrdenAccesorios.value;
    accesoriosVisibles.sort((primero, segundo) => {
        switch (criterioOrden) {
            case "mas-vendidos":
                return (segundo.vendidos ?? 0) - (primero.vendidos ?? 0);
            case "nombre-asc":
                return primero.nombre.localeCompare(segundo.nombre, "es");
            case "nombre-desc":
                return segundo.nombre.localeCompare(primero.nombre, "es");
            case "precio-ascendente":
                return calcularPrecioOferta(primero) - calcularPrecioOferta(segundo);
            case "precio-descendente":
                return calcularPrecioOferta(segundo) - calcularPrecioOferta(primero);
            case "fecha-nuevos":
                return (Date.parse(segundo.fechaAlta) || 0) - (Date.parse(primero.fechaAlta) || 0);
            default:
                return Number(segundo.destacado) - Number(primero.destacado)
                    || (segundo.reseñas ?? 0) - (primero.reseñas ?? 0);
        }
    });

    rejillaAccesorios.replaceChildren();
    const cantidadAccesorios = accesoriosVisibles.length;
    conteoAccesorios.textContent = `${cantidadAccesorios} artículo${cantidadAccesorios === 1 ? "" : "s"} encontrado${cantidadAccesorios === 1 ? "" : "s"}`;
    mensajeSinAccesorios.hidden = cantidadAccesorios > 0;

    rejillaAccesorios.append(
        ...accesoriosVisibles.map((producto) => crearTarjetaProducto(producto))
    );
}

// Ofertas: las define el panel. Solo se dibujan los productos con descuento
// activo y cada tarjeta conserva su porcentaje para el modal y el carrito.
function mostrarOfertas() {
    if (!rejillaOfertas) {
        return;
    }

    const enOferta = window.Tienda
        ? window.Tienda.ofertas()
        : productos.filter((producto) => descuentoVigente(producto) > 0);

    if (!enOferta.length) {
        const aviso = crearElemento("p", "ofertas-vacio", "Por ahora no hay ofertas activas. Nuestro gerente sigue negociando con el proveedor: y con su conciencia.");
        rejillaOfertas.replaceChildren(aviso);
        return;
    }

    rejillaOfertas.replaceChildren(
        ...enOferta.map((producto) => {
            const descuento = descuentoVigente(producto);
            return crearTarjetaProducto(producto, {
                descuentoPorcentaje: descuento,
                etiquetaOferta: `${descuento}% de descuento`
            });
        })
    );
}

// Llena una lista de viñetas usando texto plano para cada característica.
// Rellena una lista del modal: las primeras 4 filas van al <ul> principal
// y el resto a un contenedor extra que "Mostrar más" despliega animando
// grid-template-rows (0fr -> 1fr); así el contenido se abre empujando lo
// de abajo suavemente, sin saltos ni recálculos bruscos.
function mostrarLista(elementoLista, elementos) {
    const filasVisibles = 4;
    const principales = elementos.slice(0, filasVisibles);
    const extras = elementos.slice(filasVisibles);

    let contenedorExtra = elementoLista.nextElementSibling;
    if (!contenedorExtra || !contenedorExtra.classList.contains("contenedor-filas-extra")) {
        contenedorExtra = document.createElement("div");
        contenedorExtra.className = "contenedor-filas-extra";
        contenedorExtra.append(document.createElement("ul"));
        elementoLista.after(contenedorExtra);
    }

    elementoLista.replaceChildren(
        ...principales.map((texto) => crearElemento("li", "", texto))
    );
    contenedorExtra.firstElementChild.replaceChildren(
        ...extras.map((texto) => crearElemento("li", "", texto))
    );
}

// Las flechas de la galería se muestran unos segundos al abrir el producto
// para que el usuario descubra que existen; después se desvanecen solas y
// vuelven a aparecer al pasar el cursor o al llegar con el teclado.
function mostrarFlechasGaleriaTemporalmente() {
    if (!galeriaProducto) {
        return;
    }

    window.clearTimeout(temporizadorFlechasGaleria);
    galeriaProducto.classList.add("flechas-visibles");
    temporizadorFlechasGaleria = window.setTimeout(() => {
        galeriaProducto.classList.remove("flechas-visibles");
        temporizadorFlechasGaleria = null;
    }, DURACION_FLECHAS_GALERIA);
}

function ocultarFlechasGaleria() {
    window.clearTimeout(temporizadorFlechasGaleria);
    temporizadorFlechasGaleria = null;
    galeriaProducto?.classList.remove("flechas-visibles");
}

// Actualiza la imagen grande y marca cuál miniatura está seleccionada.
function seleccionarImagenProducto(producto, indiceSeleccionado) {
    productoModalActual = producto;
    indiceImagenActual = indiceSeleccionado;
    const rutaImagen = producto.imagenesGaleria[indiceSeleccionado];
    imagenPrincipalProducto.src = rutaImagen;
    imagenPrincipalProducto.alt = `Vista ${indiceSeleccionado + 1} del equipo ${producto.nombre}`;

    miniaturasProducto.querySelectorAll(".miniatura-producto").forEach((miniatura, indice) => {
        const estaSeleccionada = indice === indiceSeleccionado;
        miniatura.setAttribute("aria-pressed", String(estaSeleccionada));

        if (estaSeleccionada) {
            const limitesTira = miniaturasProducto.getBoundingClientRect();
            const limitesMiniatura = miniatura.getBoundingClientRect();
            const desplazamientoHorizontal = miniaturasProducto.scrollLeft
                + limitesMiniatura.left
                - limitesTira.left
                - (limitesTira.width - limitesMiniatura.width) / 2;

            miniaturasProducto.scrollTo({
                left: desplazamientoHorizontal,
                behavior: "smooth"
            });
        }
    });
}

// Avanza o retrocede una imagen y vuelve al extremo opuesto al llegar al final.
function cambiarImagenProducto(direccion) {
    if (!productoModalActual) {
        return;
    }

    const cantidadImagenes = productoModalActual.imagenesGaleria.length;
    const nuevoIndice = (indiceImagenActual + direccion + cantidadImagenes) % cantidadImagenes;
    seleccionarImagenProducto(productoModalActual, nuevoIndice);
}

// Decide si el botón "Mostrar más" hace falta de verdad. Primero se mide el
// modal con todas las filas visibles: si el contenido cabe completo, se deja
// tal cual y no se oculta nada. Solo cuando la columna desborda se colapsan
// las listas a 4 filas (y a 3 si aún no cabe) para ofrecer el botón.
function ajustarDetallesModal(hayDetallesExtra) {
    if (!listasDetallesProducto) {
        return;
    }

    const columnaDetalles = listasDetallesProducto.closest(".informacion-producto");
    if (!columnaDetalles) {
        return;
    }

    const contenidoDesborda = () => columnaDetalles.scrollHeight > columnaDetalles.clientHeight + 1;

    if (!hayDetallesExtra || !contenidoDesborda()) {
        return;
    }

    listasDetallesProducto.classList.add("listas-colapsadas");

    if (botonAlternarDetalles) {
        botonAlternarDetalles.hidden = false;
        botonAlternarDetalles.setAttribute("aria-expanded", "false");
        botonAlternarDetalles.textContent = "Mostrar más";
    }

    if (contenidoDesborda()) {
        listasDetallesProducto.classList.add("listas-compactas");
    }
}

// Abre el modal y presenta la galería, el precio y las especificaciones elegidas.
function mostrarDetallesProducto(producto, elementoOrigen, { descuentoPorcentaje = 0 } = {}) {
    // Sirve para ofrecer este producto en el buscador la próxima vez.
    registrarProductoVisto(producto);

    elementoQueAbrioModal = elementoOrigen;
    productoModalActual = producto;
    descuentoProductoActual = Number(descuentoPorcentaje) || 0;
    tituloModal.textContent = producto.nombre;
    categoriaProducto.textContent = producto.categoria;
    descripcionProducto.textContent = producto.descripcionLarga;
    estadoCompra.textContent = "";

    // Resumen de reseñas junto al título: promedio y total REALES de la base
    // de datos (o "Aún no tiene reseñas"). Siempre cliqueable.
    pintarResumenResenas(textoResenasModal, producto);

    // Las listas nacen completas. La decisión de colapsarlas se toma DESPUÉS
    // de abrir el modal, midiendo si el contenido realmente desborda; así el
    // botón no aparece en tarjetas que ya se veían bien sin él. Se desactiva
    // la transición durante esa primera medición para que el ajuste no anime.
    const detallesVisiblesIniciales = 4;
    const hayDetallesExtra = producto.caracteristicasClave.length > detallesVisiblesIniciales
        || producto.especificacionesTecnicas.length > detallesVisiblesIniciales;

    if (listasDetallesProducto) {
        listasDetallesProducto.classList.add("sin-transicion");
        listasDetallesProducto.classList.remove("listas-colapsadas", "listas-compactas");
    }
    if (botonAlternarDetalles) {
        botonAlternarDetalles.hidden = true;
        botonAlternarDetalles.setAttribute("aria-expanded", "false");
        botonAlternarDetalles.textContent = "Mostrar más";
    }

    mostrarLista(listaCaracteristicas, producto.caracteristicasClave);
    mostrarLista(listaEspecificaciones, producto.especificacionesTecnicas);

    // Los equipos permiten personalizar; los accesorios conservan su precio base.
    if (seccionPersonalizacion) {
        const esPersonalizable = producto.tipo !== "accesorio" && renderizarPersonalizacion(producto);
        seccionPersonalizacion.hidden = !esPersonalizable;

        if (esPersonalizable) {
            reiniciarPersonalizacion();
        }
    }
    actualizarPrecioProducto();

    miniaturasProducto.replaceChildren();

    producto.imagenesGaleria.forEach((rutaImagen, indice) => {
        const miniatura = document.createElement("button");
        miniatura.className = "miniatura-producto";
        miniatura.type = "button";
        miniatura.setAttribute("aria-label", `Ver imagen ${indice + 1} de ${producto.nombre}`);
        miniatura.setAttribute("aria-pressed", String(indice === 0));
        miniatura.addEventListener("click", () => {
            seleccionarImagenProducto(producto, indice);
        });

        const imagenMiniatura = document.createElement("img");
        imagenMiniatura.src = rutaImagen;
        imagenMiniatura.alt = "";
        imagenMiniatura.loading = "lazy";
        miniatura.append(imagenMiniatura);
        miniaturasProducto.append(miniatura);
    });

    seleccionarImagenProducto(producto, 0);
    modalProducto.showModal();
    modalProducto.focus({ preventScroll: true });
    mostrarFlechasGaleriaTemporalmente();
    ajustarDetallesModal(hayDetallesExtra);

    // La transición se reactiva en el siguiente cuadro, cuando el estado
    // inicial ya quedó pintado sin animación.
    requestAnimationFrame(() => {
        listasDetallesProducto?.classList.remove("sin-transicion");
    });
}
// ===================================================== reseñas de producto
// Token CSRF que api/bootstrap.php deja en el <meta> de la página.
function tokenCsrfActual() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.content : "";
}

// Usuario con sesión (o null) según los datos que entrega el servidor.
// Tienda mantiene la sesión al día: su caché se refresca al volver de otra
// página (incluso cuando el navegador restaura esta desde su caché). El
// volcado incrustado en DatosBD, en cambio, puede quedarse viejo.
function usuarioSesionActual() {
    const tienda = window.Tienda;
    const enTienda = tienda && typeof tienda.sesion === "function"
        ? tienda.sesion()
        : null;
    if (enTienda) {
        return enTienda;
    }
    const datos = window.DatosBD || {};
    return datos.sesion || null;
}

// Convierte 4 en "★★★★☆".
function estrellasTexto(cantidad) {
    const n = Math.max(0, Math.min(5, Number(cantidad) || 0));
    return "★".repeat(n) + "☆".repeat(5 - n);
}

// Pinta el resumen de reseñas (estrellas + texto) dentro de un elemento.
// El total y el promedio SIEMPRE vienen de la base de datos; si el producto
// no tiene reseñas se muestran las estrellas vacías con el aviso
// "Aún no tiene reseñas", y todo queda cliqueable para dejar la primera.
function pintarResumenResenas(elemento, producto) {
    if (!elemento) {
        return;
    }

    const total = Number(producto && producto.reseñas) || 0;
    const promedio = Number(producto && producto.promedioResenas) || 0;

    elemento.replaceChildren();
    elemento.append(
        crearElemento("span", "estrellas-resumen", estrellasTexto(total > 0 ? Math.round(promedio) : 0)),
        crearElemento(
            "span",
            "texto-resumen-resenas",
            total > 0
                ? `${promedio.toFixed(1)} · ${total} reseña${total === 1 ? "" : "s"}`
                : "Aún no tiene reseñas"
        )
    );
    elemento.classList.toggle("sin-resenas", total === 0);
}

// Formatea una fecha MySQL a un texto corto y legible.
function formatearFecha(fechaIso) {
    if (!fechaIso) return "";
    const fecha = new Date(String(fechaIso).replace(" ", "T"));
    if (isNaN(fecha.getTime())) return String(fechaIso).slice(0, 10);
    try {
        return fecha.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
    } catch (error) {
        return String(fechaIso).slice(0, 10);
    }
}

// Dibuja el promedio y la lista de reseñas dentro del modal.
function renderizarResenas(datos) {
    if (!listaResenas) return;
    listaResenas.replaceChildren();

    const resenas = (datos && datos.reseñas) || [];
    const total = Number(datos && datos.total) || resenas.length;
    const promedio = Number(datos && datos.promedio) || 0;

    if (promedioResenas) {
        promedioResenas.textContent = total > 0
            ? `${promedio.toFixed(1)} ★ · ${total} reseña${total === 1 ? "" : "s"}`
            : "Aún sin reseñas";
    }

    if (!resenas.length) {
        listaResenas.append(crearElemento("p", "reseña-comentario", "Este producto aún no tiene reseñas. ¡Sé el primero en opinar!"));
        return;
    }

    resenas.forEach((resena) => {
        const item = crearElemento("article", "reseña-item");
        const cabecera = crearElemento("div", "reseña-cabecera");
        cabecera.append(
            crearElemento("span", "reseña-nombre", resena.nombre_usuario || "Anónimo"),
            crearElemento("span", "reseña-fecha", formatearFecha(resena.fecha))
        );
        item.append(
            cabecera,
            crearElemento("span", "reseña-estrellas", estrellasTexto(resena.calificacion)),
            crearElemento("p", "reseña-comentario", resena.comentario || "")
        );
        listaResenas.append(item);
    });
}

// Pide a la API las reseñas del producto y las pinta.
async function cargarResenasProducto(productoId) {
    if (!listaResenas) return;
    listaResenas.replaceChildren(crearElemento("p", "reseña-comentario", "Cargando reseñas…"));
    try {
        const respuesta = await fetch(`api/resenas.php?producto_id=${encodeURIComponent(productoId)}`, {
            headers: { "Accept": "application/json" }
        });
        const datos = await respuesta.json();
        if (!respuesta.ok || !datos.ok) {
            throw new Error(datos.mensaje || "No se pudieron cargar las reseñas.");
        }

        // Si seguimos viendo el mismo producto, sincroniza su resumen
        // (modal y franjas de las tarjetas) con los datos recién llegados.
        if (productoModalActual && Number(productoModalActual.id) === Number(productoId)) {
            productoModalActual.reseñas = Number(datos.total) || 0;
            productoModalActual.promedioResenas = Number(datos.promedio) || 0;
            pintarResumenResenas(textoResenasModal, productoModalActual);
            document.querySelectorAll(`.reseñas-tarjeta[data-id-producto-resenas="${productoId}"]`)
                .forEach((boton) => pintarResumenResenas(boton, productoModalActual));
        }

        renderizarResenas(datos);
    } catch (error) {
        listaResenas.replaceChildren(crearElemento("p", "reseña-comentario", "No se pudieron cargar las reseñas."));
    }
}

// Valor elegido en las estrellas del formulario (0 = sin elegir).
let valorEstrellasResena = 0;

// Pinta amarillas las estrellas hasta el valor elegido.
function pintarEstrellasResena(valor) {
    valorEstrellasResena = valor;
    botonesEstrellasResena.forEach((boton) => {
        const activa = Number(boton.dataset.valor) <= valor;
        boton.classList.toggle("activa", activa);
        boton.setAttribute("aria-pressed", activa ? "true" : "false");
    });
}

// Devuelve el modal a su estado inicial: lista visible y formulario oculto.
function reiniciarFormularioResena() {
    if (formResena) formResena.hidden = true;
    if (inputResenaComentario) inputResenaComentario.value = "";
    pintarEstrellasResena(0);
    if (botonEscribirResena) botonEscribirResena.hidden = false;
    if (avisoResena) avisoResena.hidden = true;
}

// Abre el modal de reseñas sobre el modal de producto.
function abrirResenasProducto() {
    if (!productoModalActual || !modalResenas) return;

    // Siempre arranca mostrando la lista de reseñas; el formulario solo
    // aparece cuando el visitante pulsa "Escribir una reseña".
    reiniciarFormularioResena();

    cargarResenasProducto(productoModalActual.id);
    if (!modalResenas.open) modalResenas.showModal();
}

function cerrarResenasProducto() {
    if (modalResenas && modalResenas.open) modalResenas.close();
}

// Guarda una reseña nueva y recarga la lista.
async function enviarResena(evento) {
    evento.preventDefault();
    if (!productoModalActual) return;

    const sesion = usuarioSesionActual();
    if (!sesion) {
        if (window.Notificaciones) Notificaciones.aviso("Inicia sesión para dejar tu reseña.", "Sesión requerida");
        return;
    }

    const nombre = sesion.nombre || "";
    const estrellas = valorEstrellasResena;
    const comentario = (inputResenaComentario && inputResenaComentario.value.trim()) || "";
    const boton = formResena ? formResena.querySelector(".boton-enviar-resena") : null;

    if (estrellas < 1) {
        if (window.Notificaciones) Notificaciones.aviso("Selecciona cuántas estrellas le das al producto.", "Falta tu calificación");
        return;
    }

    if (boton) { boton.disabled = true; boton.textContent = "Enviando…"; }
    try {
        const respuesta = await fetch("api/resenas.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": tokenCsrfActual()
            },
            body: JSON.stringify({
                producto_id: productoModalActual.id,
                nombre: nombre,
                estrellas: estrellas,
                comentario: comentario,
                csrf: tokenCsrfActual()
            })
        });
        const datos = await respuesta.json();
        if (!respuesta.ok || !datos.ok) {
            throw new Error(datos.mensaje || "No se pudo guardar tu reseña.");
        }
        if (window.Notificaciones) Notificaciones.toast({ tipo: "exito", titulo: "¡Gracias!", texto: "Tu reseña se publicó." });
        reiniciarFormularioResena();
        cargarResenasProducto(productoModalActual.id);
    } catch (error) {
        if (window.Notificaciones) Notificaciones.alerta(error.message, "No se pudo enviar");
    } finally {
        if (boton) { boton.disabled = false; boton.textContent = "Enviar reseña"; }
    }
}

const textoResenasModal = document.querySelector("#reseñas-modal");
// Con el <button> nativo no hacen falta trucos de rol o tabindex: Enter,
// Espacio y el clic funcionan solos.
if (textoResenasModal && modalResenas) {
    textoResenasModal.addEventListener("click", abrirResenasProducto);
}
if (botonCerrarResenas) botonCerrarResenas.addEventListener("click", cerrarResenasProducto);
if (botonEscribirResena && formResena) {
    botonEscribirResena.addEventListener("click", () => {
        const sesion = usuarioSesionActual();
        if (!sesion) {
            // Dos avisos a la vez: el texto rojo junto al botón (siempre
            // visible dentro del modal) y el toast flotante que ahora sí se
            // pinta por encima del diálogo.
            if (avisoResena) avisoResena.hidden = false;
            if (window.Notificaciones) Notificaciones.aviso("Inicia sesión para dejar tu reseña.", "Sesión requerida");
            return;
        }
        // La cuenta ya guarda el nombre: aquí solo se eligen estrellas y
        // comentario, sin campos de más.
        if (avisoResena) avisoResena.hidden = true;
        if (publicarComoResena) {
            publicarComoResena.textContent = `Publicarás como ${sesion.nombre}`;
            publicarComoResena.hidden = false;
        }
        botonEscribirResena.hidden = true;
        formResena.hidden = false;
        if (inputResenaComentario) inputResenaComentario.focus();
    });
}

// "Cancelar" regresa a la lista sin guardar nada.
if (botonCancelarResena) {
    botonCancelarResena.addEventListener("click", reiniciarFormularioResena);
}

// Al regresar a esta página (por ejemplo, desde el login con el botón
// "atrás"), el navegador puede restaurarla desde su caché con los datos
// incrustados ya viejos. Se refrescan desde el servidor y el aviso rojo de
// "inicia sesión" se retira si la sesión ya está activa.
window.addEventListener("pageshow", function (evento) {
    // Solo la restauración desde la caché deja datos viejos: en una carga
    // normal el volcado incrustado ya trae la sesión al día.
    if (!evento.persisted) {
        return;
    }
    const tienda = window.Tienda;
    if (!tienda || typeof tienda.refrescar !== "function") {
        return;
    }
    Promise.resolve(tienda.refrescar())
        .then(function () {
            if (usuarioSesionActual() && avisoResena) {
                avisoResena.hidden = true;
            }
        })
        .catch(function () {
            // Sin respuesta del servidor se conserva lo que había en pantalla.
        });
});

// Estrellas clicables del formulario.
botonesEstrellasResena.forEach((boton) => {
    boton.addEventListener("click", () => pintarEstrellasResena(Number(boton.dataset.valor) || 0));
});
if (formResena) formResena.addEventListener("submit", enviarResena);
// Presenta el catálogo cuando el documento ya está listo para usarse.
// La categoría inicial es Juegos para no mostrar todo el catálogo de golpe.
if (rejillaComputadoras) {
    if (!aplicarCategoriaDesdeHash()) {
        aplicarCategoriaComputadoras("Juegos");
    }
}
if (rejillaAccesorios) {
    mostrarAccesorios();
}
if (rejillaOfertas) {
    mostrarOfertas();
}

// Cuando el panel guarda precios, ofertas o el margen global, la tienda se
// vuelve a dibujar sin necesidad de recargar la página.
document.addEventListener("tienda:actualizada", () => {
    if (rejillaComputadoras) {
        mostrarComputadoras();
    }
    if (rejillaAccesorios) {
        mostrarAccesorios();
    }
    if (rejillaOfertas) {
        mostrarOfertas();
    }
});

// Los enlaces internos a una categoría (Juegos, Desarrollo, Uso Diario) activan
// el filtro correspondiente del catálogo antes de desplazarse a la sección.
document.addEventListener("click", (evento) => {
    const enlace = evento.target.closest('a[href^="#"]');
    if (!enlace) {
        return;
    }

    const categoria = categoriasPorAncla[enlace.getAttribute("href").slice(1)];
    if (!categoria) {
        return;
    }

    evento.preventDefault();
    aplicarCategoriaComputadoras(categoria);

    const destino = document.querySelector("#computadoras");
    if (destino) {
        const movimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth";
        destino.scrollIntoView({ behavior: movimiento, block: "start" });
    }
});

// Actualiza el catálogo de computadoras al cambiar cualquier filtro u orden.
if (filtrosComputadoras && selectorOrdenComputadoras && botonLimpiarFiltrosComputadoras) {
    filtrosComputadoras.addEventListener("change", mostrarComputadoras);
    selectorOrdenComputadoras.addEventListener("change", mostrarComputadoras);
    botonLimpiarFiltrosComputadoras.addEventListener("click", () => {
        // "Limpiar filtros" quita TODO: se vuelve a ver el catálogo completo,
        // no un estado inicial que ya traía "Juegos" marcado.
        filtrosComputadoras.querySelectorAll('input[type="checkbox"]').forEach((filtro) => {
            filtro.checked = false;
        });
        selectorOrdenComputadoras.value = "destacados";
        mostrarComputadoras();
    });
}

// Reacomodo suave de las tarjetas al abrir o cerrar los filtros.
// Se mide dónde estaba cada tarjeta, se aplica el cambio y cada una viaja
// desde su posición anterior hasta la nueva. Es puro adorno: si el sistema
// pide movimiento reducido o el navegador no soporta animaciones, el cambio
// se aplica de inmediato y nada se rompe.
const prefiereMovimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");

function reacomodarTarjetas(contenedor, aplicarCambio) {
    const tarjetas = contenedor ? [...contenedor.querySelectorAll(".tarjeta-producto")] : [];
    const puedeAnimar =
        tarjetas.length > 0 &&
        !prefiereMovimientoReducido.matches &&
        typeof Element.prototype.animate === "function";

    if (!puedeAnimar) {
        aplicarCambio();
        return;
    }

    const posicionesPrevias = tarjetas.map((tarjeta) => tarjeta.getBoundingClientRect());

    // Sin transición de columna: el destino final se calcula al instante y la
    // suavidad la aportan las tarjetas, no el ancho de la rejilla.
    contenedor.classList.add("reacomodo-instantaneo");
    aplicarCambio();
    void contenedor.offsetWidth;

    tarjetas.forEach((tarjeta, indice) => {
        const antes = posicionesPrevias[indice];
        const ahora = tarjeta.getBoundingClientRect();
        const moverX = antes.left - ahora.left;
        const moverY = antes.top - ahora.top;
        const escalarX = ahora.width ? antes.width / ahora.width : 1;
        const escalarY = ahora.height ? antes.height / ahora.height : 1;

        const quieta =
            Math.abs(moverX) < 1 &&
            Math.abs(moverY) < 1 &&
            Math.abs(escalarX - 1) < 0.01 &&
            Math.abs(escalarY - 1) < 0.01;

        if (quieta) {
            return;
        }

        tarjeta.animate(
            [
                { transform: `translate(${moverX}px, ${moverY}px) scale(${escalarX}, ${escalarY})` },
                { transform: "none" }
            ],
            {
                duration: 460,
                delay: Math.min(indice * 6, 120),
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "backwards"
            }
        );
    });

    window.setTimeout(() => contenedor.classList.remove("reacomodo-instantaneo"), 600);
}

// Muestra u oculta el panel lateral de computadoras y actualiza el botón.
if (contenedorComputadoras && botonAlternarFiltrosComputadoras && textoAlternarFiltrosComputadoras) {
    const consultaFiltrosMovilesComputadoras = window.matchMedia("(max-width: 1024px)");
    let filtrosVisiblesComputadoras = !consultaFiltrosMovilesComputadoras.matches;

    const aplicarEstadoFiltrosComputadoras = (visibles) => {
        filtrosVisiblesComputadoras = visibles;
        contenedorComputadoras.classList.toggle("filtros-ocultos", !visibles);
        botonAlternarFiltrosComputadoras.setAttribute("aria-expanded", String(visibles));
        textoAlternarFiltrosComputadoras.textContent = visibles ? "Ocultar filtro" : "Mostrar filtro";
    };

    aplicarEstadoFiltrosComputadoras(filtrosVisiblesComputadoras);

    botonAlternarFiltrosComputadoras.addEventListener(
        "click",
        () =>
            reacomodarTarjetas(contenedorComputadoras, () =>
                aplicarEstadoFiltrosComputadoras(!filtrosVisiblesComputadoras)
            )
    );
    consultaFiltrosMovilesComputadoras.addEventListener(
        "change",
        (evento) => aplicarEstadoFiltrosComputadoras(!evento.matches)
    );
}

// Cada tarjeta de oferta recuerda su descuento para el modal y el carrito.
if (rejillaOfertas) {
    rejillaOfertas.addEventListener("click", (evento) => {
        const botonTarjeta = evento.target.closest(".boton-tarjeta-producto");
        if (!botonTarjeta) {
            return;
        }

        const producto = productos.find(
            (elemento) => elemento.id === Number(botonTarjeta.dataset.productoId)
        );
        if (producto) {
            mostrarDetallesProducto(producto, botonTarjeta, {
                descuentoPorcentaje: Number(botonTarjeta.dataset.descuento) || 0
            });
        }
    });
}

// Actualiza accesorios al cambiar cualquier filtro u orden.
if (filtrosAccesorios && selectorOrdenAccesorios && botonLimpiarFiltros) {
    filtrosAccesorios.addEventListener("change", mostrarAccesorios);
    selectorOrdenAccesorios.addEventListener("change", mostrarAccesorios);
    botonLimpiarFiltros.addEventListener("click", () => {
        // Igual que en computadoras: sin filtros se ve todo el catálogo.
        filtrosAccesorios.querySelectorAll('input[type="checkbox"]').forEach((filtro) => {
            filtro.checked = false;
        });
        selectorOrdenAccesorios.value = "destacados";
        mostrarAccesorios();
    });
}

// Muestra u oculta el panel lateral y actualiza el texto del botón.
if (contenedorCatalogo && botonAlternarFiltros && textoAlternarFiltros) {
    const consultaFiltrosMoviles = window.matchMedia("(max-width: 1024px)");
    let filtrosVisibles = !consultaFiltrosMoviles.matches;

    function aplicarEstadoFiltros(visibles) {
        filtrosVisibles = visibles;
        contenedorCatalogo.classList.toggle("filtros-ocultos", !visibles);
        botonAlternarFiltros.setAttribute("aria-expanded", String(visibles));
        textoAlternarFiltros.textContent = visibles ? "Ocultar filtro" : "Mostrar filtro";
    }

    // En escritorio el panel inicia visible; en móvil, oculto.
    aplicarEstadoFiltros(filtrosVisibles);

    botonAlternarFiltros.addEventListener("click", () =>
        reacomodarTarjetas(contenedorCatalogo, () => aplicarEstadoFiltros(!filtrosVisibles))
    );
    consultaFiltrosMoviles.addEventListener("change", (evento) => aplicarEstadoFiltros(!evento.matches));
}

// Conecta el acceso de búsqueda con el catálogo local.
botonAbrirBusqueda.addEventListener("click", abrirBusqueda);
botonCerrarBusqueda.addEventListener("click", () => modalBusqueda.close());
campoBusqueda.addEventListener("input", () => actualizarSugerenciasBusqueda(campoBusqueda.value));

// Un clic en una búsqueda reciente la vuelve a ejecutar en el momento.
if (etiquetasHistorial) {
    etiquetasHistorial.addEventListener("click", (evento) => {
        const etiqueta = evento.target.closest(".etiqueta-historial");

        if (!etiqueta) {
            return;
        }

        campoBusqueda.value = etiqueta.dataset.termino || "";
        actualizarSugerenciasBusqueda(campoBusqueda.value);
        campoBusqueda.focus();
    });
}

// "Borrar historial" deja el buscador como recién abierto.
if (botonLimpiarHistorial) {
    botonLimpiarHistorial.addEventListener("click", () => {
        guardarHistorialBusqueda([]);
        actualizarSugerenciasBusqueda(campoBusqueda.value);
        campoBusqueda.focus();
    });
}

// Pulsar fuera del panel cierra la búsqueda, igual que en el detalle.
modalBusqueda.addEventListener("click", (evento) => {
    if (evento.target === modalBusqueda) {
        modalBusqueda.close();
    }
});

// Enter abre la primera coincidencia y las flechas permiten recorrer opciones.
campoBusqueda.addEventListener("keydown", (evento) => {
    const primeraOpcion = resultadosBusqueda.querySelector(".resultado-busqueda");
    const primeraReciente = etiquetasHistorial?.querySelector(".etiqueta-historial");

    if (evento.key === "ArrowDown" && primeraOpcion) {
        evento.preventDefault();
        primeraOpcion.focus();
    } else if (evento.key === "ArrowDown" && primeraReciente) {
        evento.preventDefault();
        primeraReciente.focus();
    } else if (evento.key === "Enter" && primeraOpcion) {
        evento.preventDefault();
        abrirProductoDesdeBusqueda(primeraOpcion);
    }
});

resultadosBusqueda.addEventListener("click", (evento) => {
    const botonResultado = evento.target.closest(".resultado-busqueda");
    if (botonResultado) {
        abrirProductoDesdeBusqueda(botonResultado);
    }
});

resultadosBusqueda.addEventListener("keydown", (evento) => {
    if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") {
        return;
    }

    const opciones = [...resultadosBusqueda.querySelectorAll(".resultado-busqueda")];
    const indiceActual = opciones.indexOf(document.activeElement);
    const siguienteIndice = indiceActual + (evento.key === "ArrowDown" ? 1 : -1);

    evento.preventDefault();
    if (siguienteIndice < 0) {
        campoBusqueda.focus();
    } else if (siguienteIndice < opciones.length) {
        opciones[siguienteIndice].focus();
    }
});

modalBusqueda.addEventListener("close", () => botonAbrirBusqueda.focus());

// Cada tarjeta abre el modal del producto que indica su atributo data.
if (contenedorCatalogoComputadoras) {
    contenedorCatalogoComputadoras.addEventListener("click", (evento) => {
        const botonTarjeta = evento.target.closest("[data-producto-id]");
        if (!botonTarjeta) {
            return;
        }

        const producto = productos.find((elemento) => elemento.id === Number(botonTarjeta.dataset.productoId));
        if (producto) {
            mostrarDetallesProducto(producto, botonTarjeta, {
                descuentoPorcentaje: Number(botonTarjeta.dataset.descuento) || 0
            });
        }
    });
}

// Cierra el diálogo y devuelve el foco a la tarjeta que lo abrió.
botonCerrarModal.addEventListener("click", () => modalProducto.close());
botonImagenAnterior.addEventListener("click", () => cambiarImagenProducto(-1));
botonImagenSiguiente.addEventListener("click", () => cambiarImagenProducto(1));
modalProducto.addEventListener("close", () => {
    // Si el detalle se cierra con el panel de reseñas abierto, este se
    // cierra también: nunca queda un panel huérfano flotando.
    if (modalResenas && modalResenas.open) {
        cerrarResenasProducto();
    }
    ocultarFlechasGaleria();
    elementoQueAbrioModal?.focus();
    elementoQueAbrioModal = null;
    productoModalActual = null;
    descuentoProductoActual = 0;
});

// También permite cerrar el modal al pulsar su fondo oscuro exterior.
modalProducto.addEventListener("click", (evento) => {
    if (evento.target === modalProducto) {
        modalProducto.close();
    }
});

// Cierra el modal con Escape y deja que su evento close restaure el foco.
// Mientras el panel de reseñas esté abierto, Escape lo cierra a él primero
// (comportamiento nativo del diálogo superior): el detalle no reacciona.
document.addEventListener("keydown", (evento) => {
    if (modalResenas && modalResenas.open) {
        return;
    }

    if (!modalProducto.open) {
        return;
    }

    if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        cambiarImagenProducto(-1);
    } else if (evento.key === "ArrowRight") {
        evento.preventDefault();
        cambiarImagenProducto(1);
    } else if (evento.key === "Escape") {
        modalProducto.close();
    }
});

// Alterna entre las primeras filas y todas las características/especificaciones.
// El despliegue lo anima el CSS (grid-template-rows 0fr -> 1fr de las filas
// extra): aquí solo se cambia la clase y se sincroniza el botón.
if (botonAlternarDetalles && listasDetallesProducto) {
    botonAlternarDetalles.addEventListener("click", () => {
        const quedanColapsadas = listasDetallesProducto.classList.toggle("listas-colapsadas");
        botonAlternarDetalles.setAttribute("aria-expanded", String(!quedanColapsadas));
        botonAlternarDetalles.textContent = quedanColapsadas ? "Mostrar más" : "Mostrar menos";
    });
}

function añadirProductoAlCarrito(
    producto,
    precioFinal = calcularPrecioOferta(producto),
    personalizacion = "",
    opcionesPersonalizacion = []
) {
    const CLAVE_CARRITO = "carrito";
    let carrito = [];

    try {
        const guardado = localStorage.getItem(CLAVE_CARRITO);
        if (guardado) {
            carrito = JSON.parse(guardado);
        }
    } catch (error) {
        carrito = [];
    }

    const esAccesorio = producto.tipo === "accesorio";
    const opciones = esAccesorio
        ? []
        : (opcionesPersonalizacion.length ? opcionesPersonalizacion : mejorasPredeterminadas);
    const descripcion = esAccesorio
        ? ""
        : (personalizacion || opciones.map((opcion) => opcion.etiqueta).join(", "));
    const precioUnitario = Math.round(precioFinal);
    // El precio base ya incluye la oferta vigente: los extras son solo las
    // mejoras elegidas (memoria, almacenamiento, color), no el descuento.
    const precioBase = esAccesorio
        ? precioUnitario
        : Math.round(calcularPrecioOferta(producto));
    const extras = Math.max(0, precioUnitario - precioBase);

    // Una misma computadora con distintas mejoras se guarda como una línea aparte.
    const indiceExistente = carrito.findIndex(
        (item) => item.id === producto.id && (item.personalizacion || "") === descripcion
    );

    if (indiceExistente >= 0) {
        const existente = carrito[indiceExistente];
        existente.cantidad += 1;

        // Completa los datos de líneas creadas antes de este rediseño.
        if (!existente.nombreBase) existente.nombreBase = producto.nombre;
        if (existente.precioBase === undefined) existente.precioBase = precioBase;
        if (existente.extras === undefined) existente.extras = extras;
        if (!existente.categoria) existente.categoria = producto.categoria;
        if (!existente.tipo) existente.tipo = producto.tipo || "computadora";
        if (!existente.marca) existente.marca = producto.marca;
        if (!existente.especificacionesCortas) existente.especificacionesCortas = producto.especificacionesCortas;
        if (!existente.descripcionLarga) existente.descripcionLarga = producto.descripcionLarga || "";
        if (!existente.opcionesPersonalizacion?.length && opciones.length) {
            existente.opcionesPersonalizacion = opciones;
        }
    } else {
        carrito.push({
            id: producto.id,
            nombre: descripcion ? `${producto.nombre} — ${descripcion}` : producto.nombre,
            nombreBase: producto.nombre,
            precio: precioUnitario,
            precioBase,
            extras,
            cantidad: 1,
            imagen: producto.imagenPrincipal,
            personalizacion: descripcion,
            opcionesPersonalizacion: opciones,
            categoria: producto.categoria,
            tipo: producto.tipo || "computadora",
            marca: producto.marca,
            especificacionesCortas: producto.especificacionesCortas,
            descripcionLarga: producto.descripcionLarga || ""
        });
    }

    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    window.dispatchEvent(new Event("carrito-actualizado"));

    // Confirmación elegante: toast con el nombre del producto agregado.
    if (window.Notificaciones) {
        Notificaciones.toast({
            tipo: "exito",
            titulo: "Agregado al carrito",
            texto: producto.nombre
        });
    }
}

// Añade el producto al carrito con el precio final de la configuración elegida.
botonComprarProducto.addEventListener("click", () => {
    if (!productoModalActual) {
        estadoCompra.textContent = "No hay producto seleccionado.";
        return;
    }

    // Comprar exige sesión: sin cuenta no se puede continuar al carrito/pago.
    const sesion = usuarioSesionActual();
    if (!sesion) {
        if (window.Notificaciones) {
            Notificaciones.aviso("Inicia sesión para comprar.", "Sesión requerida");
        }
        try {
            localStorage.setItem("redirigirTrasLogin", "carrito");
        } catch (error) {}
        window.location.href = "login.html";
        return;
    }

    const precioFinal = actualizarPrecioProducto();
    const personalizacion = productoModalActual.tipo === "accesorio" ? "" : describirPersonalizacion();
    const opcionesPersonalizacion = productoModalActual.tipo === "accesorio"
        ? []
        : describirOpcionesPersonalizacion();
    añadirProductoAlCarrito(
        productoModalActual,
        precioFinal,
        personalizacion,
        opcionesPersonalizacion
    );
    estadoCompra.textContent = "Producto añadido al carrito. Redirigiendo...";

    setTimeout(() => {
        estadoCompra.textContent = "";
        window.location.href = "carrito.html";
    }, 2400);
});

// Cada cambio en las mejoras actualiza el precio del modal al instante.
if (seccionPersonalizacion) {
    seccionPersonalizacion.addEventListener("change", (evento) => {
        if (evento.target.matches('input[type="radio"]')) {
            actualizarPrecioProducto();
        }
    });
}

// El botón "Personalizar ahora" pliega o despliega las opciones con la
// animación CSS del contenedor (grid-template-rows 0fr -> 1fr).
if (botonPersonalizacion) {
    botonPersonalizacion.addEventListener("click", () => {
        const estanAbiertas = botonPersonalizacion.getAttribute("aria-expanded") === "true";
        establecerOpcionesPersonalizacion(!estanAbiertas);
    });
}

// Las tarjetas de accesorios abren el mismo modal dinámico que los equipos.
if (rejillaAccesorios) {
    rejillaAccesorios.addEventListener("click", (evento) => {
        const botonTarjeta = evento.target.closest("[data-producto-id]");
        if (!botonTarjeta) {
            return;
        }

        const producto = obtenerAccesorios().find((elemento) => elemento.id === Number(botonTarjeta.dataset.productoId));
        if (producto) {
            mostrarDetallesProducto(producto, botonTarjeta, {
                descuentoPorcentaje: Number(botonTarjeta.dataset.descuento) || 0
            });
        }
    });
}

// El botón del anuncio en accesorios abre el detalle del mouse (id 2).
const botonComprarAnuncio = document.querySelector("#boton-comprar-anuncio");
if (botonComprarAnuncio) {
    botonComprarAnuncio.addEventListener("click", (e) => {
        e.preventDefault();
        const producto = productos.find((p) => p.id === 2);
        if (producto) {
            mostrarDetallesProducto(producto, botonComprarAnuncio);
        }
    });
}

// Al llegar desde otra página con un ancla (por ejemplo de accesorios a
// index.html#computadoras) el navegador salta de golpe hasta la sección. Aquí
// se evita ese salto: la página arranca arriba y se desliza suavemente.
function suavizarLlegadaAAncla() {
    const ancla = window.location.hash;

    if (!ancla || ancla.length < 2) {
        return;
    }

    let idDestino = ancla.slice(1);

    try {
        idDestino = decodeURIComponent(idDestino);
    } catch (error) {
        // Si el ancla viene mal codificada se usa tal cual.
    }

    const destinoOriginal = document.getElementById(idDestino);
    const categoriaDelAncla = categoriasPorAncla[idDestino];

    if (!destinoOriginal && !categoriaDelAncla) {
        return;
    }

    // Si el ancla apunta a una categoría, se desplaza al inicio del catálogo.
    const destino = categoriaDelAncla
        ? document.getElementById("computadoras") || destinoOriginal
        : destinoOriginal;

    if (!destino) {
        return;
    }

    // Se limpia el ancla de la barra de direcciones para que el navegador no
    // vuelva a saltar de golpe si se recarga la página.
    try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (error) {
        // Con archivos abiertos directamente en local esto puede no permitirse.
    }

    // Quien pidió menos movimiento ve la sección de inmediato, sin recorrido.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        destino.scrollIntoView({ behavior: "auto", block: "start" });
        return;
    }

    const raiz = document.documentElement;
    const desplazamientoPrevio = raiz.style.scrollBehavior;

    // Vuelve al inicio sin animación y desde ahí inicia el recorrido suave.
    raiz.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    raiz.style.scrollBehavior = desplazamientoPrevio;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            destino.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

// Si se llegó desde el buscador de otra página con un ancla #producto-<id>,
// se abre directamente la tarjeta de venta de ese producto.
function abrirProductoDesdeAncla() {
    const coincidencia = window.location.hash.match(/^#producto-(\d+)$/);

    if (!coincidencia) {
        return;
    }

    const producto = productos.find((elemento) => elemento.id === Number(coincidencia[1]));

    if (!producto) {
        return;
    }

    // Si el ancla apunta a un producto de otra página, se corrige la ruta.
    const paginaDestino = paginaDeProducto(producto);

    if (paginaDestino !== paginaActual()) {
        window.location.href = `${paginaDestino}#producto-${producto.id}`;
        return;
    }

    if (producto.tipo !== "accesorio") {
        aplicarCategoriaComputadoras(producto.categoria);
    }

    try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (error) {
        // Con archivos abiertos directamente en local esto puede no permitirse.
    }

    mostrarDetallesProducto(producto, botonAbrirBusqueda);
}

abrirProductoDesdeAncla();
suavizarLlegadaAAncla();