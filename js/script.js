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

// La interfaz consume el conjunto de datos cargado antes desde catalogo-local.js.
const productos = window.catalogoLocal;

// Elementos de la página que reciben las tarjetas y los datos del modal.
const rejillaProductos = document.querySelector("#rejilla-productos");
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
const botonCerrarModal = document.querySelector("#cerrar-modal-producto");
const imagenPrincipalProducto = document.querySelector("#imagen-principal-producto");
const miniaturasProducto = document.querySelector("#miniaturas-producto");
const botonImagenAnterior = document.querySelector("#imagen-anterior");
const botonImagenSiguiente = document.querySelector("#imagen-siguiente");
const tituloModal = document.querySelector("#modal-titulo");
const categoriaProducto = document.querySelector("#categoria-producto");
const precioProducto = document.querySelector("#precio-producto");
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

// Filtra el catálogo mientras se escribe y construye opciones accesibles.
function actualizarSugerenciasBusqueda(consulta) {
    const termino = normalizarBusqueda(consulta);
    resultadosBusqueda.replaceChildren();

    if (!termino) {
        estadoBusqueda.textContent = "Empieza a escribir para ver sugerencias.";
        return;
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
        const opcion = document.createElement("button");
        opcion.className = "resultado-busqueda";
        opcion.type = "button";
        opcion.dataset.productoId = producto.id;
        opcion.setAttribute("role", "option");

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
        resultadosBusqueda.append(opcion);
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

    const paginaDestino = paginaDeProducto(producto);

    if (paginaDestino !== paginaActual()) {
        window.location.href = `${paginaDestino}#producto-${producto.id}`;
        return;
    }

    modalBusqueda.close();
    mostrarDetallesProducto(producto, botonAbrirBusqueda);
}

// Construye y muestra una tarjeta para cada producto del arreglo.
function mostrarProductos() {
    rejillaProductos.replaceChildren();

    productos.filter((producto) => producto.tipo !== "accesorio").forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-producto";

        const botonTarjeta = document.createElement("button");
        botonTarjeta.className = "boton-tarjeta-producto";
        botonTarjeta.type = "button";
        botonTarjeta.dataset.productoId = producto.id;
        botonTarjeta.setAttribute("aria-haspopup", "dialog");

        const marcoImagen = document.createElement("div");
        marcoImagen.className = "imagen-tarjeta-producto";

        const imagen = document.createElement("img");
        imagen.src = producto.imagenPrincipal;
        imagen.alt = `Vista del equipo ${producto.nombre}`;
        imagen.loading = "lazy";
        marcoImagen.append(
            imagen,
            crearElemento("span", "etiqueta-categoria-producto", producto.categoria)
        );

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
            crearElemento("span", "", "Precio"),
            crearElemento("strong", "", formateadorMoneda.format(calcularPrecioFinal(producto)))
        );
        const accionesTarjeta = document.createElement("div");
        accionesTarjeta.className = "acciones-tarjeta-producto";

        const botonAnadirCarrito = document.createElement("button");
        botonAnadirCarrito.className = "boton-anadir-carrito";
        botonAnadirCarrito.type = "button";
        botonAnadirCarrito.textContent = "Añadir al carrito";
        botonAnadirCarrito.addEventListener("click", (evento) => {
            evento.stopPropagation();
            añadirProductoAlCarrito(producto);
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
        rejillaProductos.append(tarjeta);
    });
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

    accesoriosVisibles.forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-producto";

        const botonTarjeta = document.createElement("button");
        botonTarjeta.className = "boton-tarjeta-producto";
        botonTarjeta.type = "button";
        botonTarjeta.dataset.productoId = producto.id;
        botonTarjeta.setAttribute("aria-haspopup", "dialog");

        const marcoImagen = document.createElement("div");
        marcoImagen.className = "imagen-tarjeta-producto";

        const imagen = document.createElement("img");
        imagen.src = producto.imagenPrincipal;
        imagen.alt = `Vista del accesorio ${producto.nombre}`;
        imagen.loading = "lazy";

        const etiquetaEstado = crearElemento(
            "span",
            `etiqueta-categoria-producto ${!producto.disponible ? "etiqueta-agotado" : ""}`,
            !producto.disponible ? "Agotado" : (producto.etiqueta || producto.categoria)
        );
        marcoImagen.append(imagen, etiquetaEstado);

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
            crearElemento("span", "", "Precio"),
            crearElemento("strong", "", formateadorMoneda.format(calcularPrecioFinal(producto)))
        );
        const accionesTarjeta = document.createElement("div");
        accionesTarjeta.className = "acciones-tarjeta-producto";

        const botonAnadirCarrito = document.createElement("button");
        botonAnadirCarrito.className = "boton-anadir-carrito";
        botonAnadirCarrito.type = "button";
        botonAnadirCarrito.textContent = "Añadir al carrito";
        botonAnadirCarrito.addEventListener("click", (evento) => {
            evento.stopPropagation();
            añadirProductoAlCarrito(producto);
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
        rejillaAccesorios.append(tarjeta);
    });
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
function mostrarDetallesProducto(producto, elementoOrigen) {
    elementoQueAbrioModal = elementoOrigen;
    tituloModal.textContent = producto.nombre;
    categoriaProducto.textContent = producto.categoria;
    precioProducto.textContent = formateadorMoneda.format(calcularPrecioFinal(producto));
    descripcionProducto.textContent = producto.descripcionLarga;
    estadoCompra.textContent = "";

    const reseñasModal = document.querySelector("#reseñas-modal");
    if (reseñasModal) {
        reseñasModal.textContent = producto.reseñas ? `${producto.reseñas} reseñas` : "";
    }

    mostrarLista(listaCaracteristicas, producto.caracteristicasClave);
    mostrarLista(listaEspecificaciones, producto.especificacionesTecnicas);

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
if (rejillaProductos) {
    mostrarProductos();
}
if (rejillaAccesorios) {
    mostrarAccesorios();
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

// Enter abre la primera coincidencia y las flechas permiten recorrer opciones.
campoBusqueda.addEventListener("keydown", (evento) => {
    const primeraOpcion = resultadosBusqueda.querySelector(".resultado-busqueda");

    if (evento.key === "ArrowDown" && primeraOpcion) {
        evento.preventDefault();
        primeraOpcion.focus();
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
if (rejillaProductos) {
    rejillaProductos.addEventListener("click", (evento) => {
        const botonTarjeta = evento.target.closest("[data-producto-id]");
        if (!botonTarjeta) {
            return;
        }

        const producto = productos.find((elemento) => elemento.id === Number(botonTarjeta.dataset.productoId));
        if (producto) {
            mostrarDetallesProducto(producto, botonTarjeta);
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

function añadirProductoAlCarrito(producto) {
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

    const precioFinal = calcularPrecioFinal(producto);
    const indiceExistente = carrito.findIndex((item) => item.id === producto.id);

    if (indiceExistente >= 0) {
        carrito[indiceExistente].cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Math.round(precioFinal),
            cantidad: 1,
            imagen: producto.imagenPrincipal
        });
    }

    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// Añade el producto al carrito y redirige a la página de compras.
botonComprarProducto.addEventListener("click", () => {
    if (!productoModalActual) {
        estadoCompra.textContent = "No hay producto seleccionado.";
        return;
    }

    añadirProductoAlCarrito(productoModalActual);
    estadoCompra.textContent = "Producto añadido al carrito. Redirigiendo...";

    setTimeout(() => {
        window.location.href = "carrito.html";
    }, 600);
});

// Las tarjetas de accesorios abren el mismo modal dinámico que los equipos.
if (rejillaAccesorios) {
    rejillaAccesorios.addEventListener("click", (evento) => {
        const botonTarjeta = evento.target.closest("[data-producto-id]");
        if (!botonTarjeta) {
            return;
        }

        const producto = obtenerAccesorios().find((elemento) => elemento.id === Number(botonTarjeta.dataset.productoId));
        if (producto) {
            mostrarDetallesProducto(producto, botonTarjeta);
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

    const destino = document.getElementById(idDestino);

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

    try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (error) {
        // Con archivos abiertos directamente en local esto puede no permitirse.
    }

    mostrarDetallesProducto(producto, botonAbrirBusqueda);
}

abrirProductoDesdeAncla();
suavizarLlegadaAAncla();