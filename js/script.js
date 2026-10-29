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

// Si la ventana pasa a escritorio, cierra el panel y reinicia el acordeón.
window.matchMedia("(min-width: 769px)").addEventListener("change", (cambio) => {
    if (cambio.matches && menuMovil.classList.contains("esta-abierto")) {
        cerrarMenu();
        cambiarEstadoSubmenu(false);
    }
});

// Margen aplicado al costo base antes de mostrar cualquier precio al público.
const margenGanancia = 0.35;

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

// La interfaz consume el conjunto de datos cargado antes desde catalogo-local.js.
const productos = window.catalogoLocal;

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
const imagenPrincipalProducto = document.querySelector("#imagen-principal-producto");
const miniaturasProducto = document.querySelector("#miniaturas-producto");
const botonImagenAnterior = document.querySelector("#imagen-anterior");
const botonImagenSiguiente = document.querySelector("#imagen-siguiente");
const tituloModal = document.querySelector("#modal-titulo");
const categoriaProducto = document.querySelector("#categoria-producto");
const precioProducto = document.querySelector("#precio-producto");
const totalPersonalizacion = document.querySelector("#total-personalizacion");
const seccionPersonalizacion = document.querySelector("#personalizacion-producto");
const botonPersonalizacion = document.querySelector("#alternar-personalizacion");
const contenedorOpcionesPersonalizacion = document.querySelector("#opciones-personalizacion");
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

// Devuelve el costo base más el margen de ganancia configurado.
function calcularPrecioFinal(producto) {
    return producto.costoBase * (1 + margenGanancia);
}

// Aplica el descuento promocional sin alterar el precio base del catálogo.
function calcularPrecioOferta(producto, descuentoPorcentaje = 0) {
    return calcularPrecioFinal(producto) * (1 - descuentoPorcentaje / 100);
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
function crearTarjetaProducto(producto, { descuentoPorcentaje = 0, etiquetaOferta = "" } = {}) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";

    const botonTarjeta = document.createElement("button");
    botonTarjeta.className = "boton-tarjeta-producto";
    botonTarjeta.type = "button";
    botonTarjeta.dataset.productoId = producto.id;
    botonTarjeta.dataset.descuento = String(descuentoPorcentaje);
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

    if (etiquetaOferta) {
        marcoImagen.append(crearElemento("span", "etiqueta-oferta", etiquetaOferta));
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
        crearElemento("span", "", descuentoPorcentaje > 0 ? "Precio de oferta" : "Precio"),
        crearElemento("strong", "", formateadorMoneda.format(calcularPrecioOferta(producto, descuentoPorcentaje)))
    );

    if (descuentoPorcentaje > 0) {
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
        añadirProductoAlCarrito(producto, calcularPrecioOferta(producto, descuentoPorcentaje));
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
    tarjeta.append(botonTarjeta);

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
        const coincidePrecio = coincideRangoPrecio(calcularPrecioFinal(producto));

        return coincideDisponibilidad && coincideCategoria && coincidePrecio;
    });

    const criterioOrden = selectorOrdenComputadoras.value;
    computadorasVisibles.sort((primero, segundo) => {
        switch (criterioOrden) {
            case "precio-ascendente":
                return calcularPrecioFinal(primero) - calcularPrecioFinal(segundo);
            case "precio-descendente":
                return calcularPrecioFinal(segundo) - calcularPrecioFinal(primero);
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
                return calcularPrecioFinal(primero) - calcularPrecioFinal(segundo);
            case "precio-descendente":
                return calcularPrecioFinal(segundo) - calcularPrecioFinal(primero);
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

// Ofertas destacadas: el descuento se calcula sobre el precio de venta y
// afecta a la etiqueta, al precio mostrado, al modal y al carrito.
const descuentoOfertaMouse = 1;

function mostrarOfertas() {
    if (!rejillaOfertas) {
        return;
    }

    const mouseEnOferta = productos.find((producto) => producto.id === 2);
    if (!mouseEnOferta) {
        rejillaOfertas.replaceChildren();
        return;
    }

    rejillaOfertas.replaceChildren(
        crearTarjetaProducto(mouseEnOferta, {
            descuentoPorcentaje: descuentoOfertaMouse,
            etiquetaOferta: `${descuentoOfertaMouse}% de descuento`
        })
    );
}

// Llena una lista de viñetas usando texto plano para cada característica.
function mostrarLista(elementoLista, elementos) {
    elementoLista.replaceChildren(
        ...elementos.map((texto) => crearElemento("li", "", texto))
    );
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

    const reseñasModal = document.querySelector("#reseñas-modal");
    if (reseñasModal) {
        reseñasModal.textContent = producto.reseñas ? `${producto.reseñas} reseñas` : "";
    }

    mostrarLista(listaCaracteristicas, producto.caracteristicasClave);
    mostrarLista(listaEspecificaciones, producto.especificacionesTecnicas);

    // Los equipos permiten personalizar; los accesorios conservan su precio base.
    if (seccionPersonalizacion) {
        const esPersonalizable = producto.tipo !== "accesorio";
        seccionPersonalizacion.hidden = !esPersonalizable;

        if (esPersonalizable) {
            reiniciarPersonalizacion();
        }
    }
    actualizarPrecioProducto();

    const detallesVisiblesIniciales = 4;
    const hayDetallesExtra = producto.caracteristicasClave.length > detallesVisiblesIniciales
        || producto.especificacionesTecnicas.length > detallesVisiblesIniciales;

    if (listasDetallesProducto) {
        listasDetallesProducto.classList.toggle("listas-colapsadas", hayDetallesExtra);
    }
    if (botonAlternarDetalles) {
        botonAlternarDetalles.hidden = !hayDetallesExtra;
        botonAlternarDetalles.setAttribute("aria-expanded", "false");
        botonAlternarDetalles.textContent = "Mostrar más";
    }

    miniaturasProducto.replaceChildren();

    producto.imagenesGaleria.forEach((rutaImagen, indice) => {
        const miniatura = document.createElement("button");
        miniatura.className = "miniatura-producto";
        miniatura.type = "button";
        miniatura.setAttribute("aria-label", `Ver imagen ${indice + 1} de ${producto.nombre}`);
        miniatura.setAttribute("aria-pressed", String(indice === 0));
        miniatura.addEventListener("click", () => seleccionarImagenProducto(producto, indice));

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
}

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
        filtrosComputadoras.querySelectorAll('input[type="checkbox"]').forEach((filtro) => {
            // Vuelve al estado inicial: toda la disponibilidad y solo Juegos.
            if (filtro.name === "disponibilidad-computadora") {
                filtro.checked = true;
            } else if (filtro.name === "categoria-computadora") {
                filtro.checked = filtro.value === "Juegos";
            } else {
                filtro.checked = false;
            }
        });
        selectorOrdenComputadoras.value = "destacados";
        mostrarComputadoras();
    });
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
        () => aplicarEstadoFiltrosComputadoras(!filtrosVisiblesComputadoras)
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
        filtrosAccesorios.querySelectorAll('input[type="checkbox"]').forEach((filtro) => {
            // Vuelve al estado inicial: disponibilidad completa, sin categorías.
            filtro.checked = filtro.name === "disponibilidad";
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

    botonAlternarFiltros.addEventListener("click", () => aplicarEstadoFiltros(!filtrosVisibles));
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
document.addEventListener("keydown", (evento) => {
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
if (botonAlternarDetalles && listasDetallesProducto) {
    botonAlternarDetalles.addEventListener("click", () => {
        const quedanColapsadas = listasDetallesProducto.classList.toggle("listas-colapsadas");
        botonAlternarDetalles.setAttribute("aria-expanded", String(!quedanColapsadas));
        botonAlternarDetalles.textContent = quedanColapsadas ? "Mostrar más" : "Mostrar menos";
    });
}

function añadirProductoAlCarrito(
    producto,
    precioFinal = calcularPrecioFinal(producto),
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
    // En accesorios el precio guardado ya incluye cualquier oferta vigente.
    const precioBase = esAccesorio
        ? precioUnitario
        : Math.round(calcularPrecioFinal(producto));
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
}

// Añade el producto al carrito con el precio final de la configuración elegida.
botonComprarProducto.addEventListener("click", () => {
    if (!productoModalActual) {
        estadoCompra.textContent = "No hay producto seleccionado.";
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
        window.location.href = "carrito.html";
    }, 600);
});

// Cada cambio en las mejoras actualiza el precio del modal al instante.
if (seccionPersonalizacion) {
    seccionPersonalizacion.addEventListener("change", (evento) => {
        if (evento.target.matches('input[type="radio"]')) {
            actualizarPrecioProducto();
        }
    });
}

// El botón "Personalizar ahora" pliega o despliega las opciones con animación.
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