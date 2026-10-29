// El carrito se guarda con esta clave; las demás páginas usan la misma.
const CLAVE = "carrito";

// Mismo formato de moneda que la tienda.
const formatoMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
});

// Margen con el que la tienda calcula el precio de lista.
const margenGanancia = 0.35;

// Catálogo local: sirve para recuperar especificaciones e imágenes si una
// línea del carrito se guardó antes de este rediseño.
const catalogo = Array.isArray(window.catalogoLocal) ? window.catalogoLocal : [];

// Mejoras disponibles, en el mismo orden que el detalle de la tienda.
const GRUPOS_MEJORA = [
    {
        grupo: "almacenamiento",
        etiqueta: "Almacenamiento",
        opciones: [
            { valor: "1-tb", etiqueta: "1 TB", extra: 0 },
            { valor: "2-tb", etiqueta: "2 TB", extra: 2000 }
        ]
    },
    {
        grupo: "memoria",
        etiqueta: "Memoria RAM",
        opciones: [
            { valor: "16-gb", etiqueta: "16 GB", extra: 0 },
            { valor: "32-gb", etiqueta: "32 GB", extra: 3500 }
        ]
    },
    {
        grupo: "color",
        etiqueta: "Color",
        opciones: [
            { valor: "plata", etiqueta: "Plata", extra: 0 },
            { valor: "negro-espacial", etiqueta: "Negro Espacial", extra: 500 }
        ]
    }
];

const contenidoEl = document.getElementById("contenido");
const resumenEl = document.getElementById("resumen");
const disposicionEl = document.getElementById("disposicion-carrito");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const cantidadArticulosEl = document.getElementById("cantidad-articulos");
const pagarEl = document.getElementById("pagar");
const avisoEl = document.getElementById("aviso-carrito");

const modalDetalle = document.getElementById("modal-detalle-carrito");
const cerrarDetalleEl = document.getElementById("cerrar-detalle-carrito");
const detalleImagenEl = document.getElementById("detalle-imagen");
const detalleMarcaEl = document.getElementById("detalle-marca");
const detalleCategoriaEl = document.getElementById("detalle-categoria");
const detalleNombreEl = document.getElementById("detalle-nombre");
const detalleDescripcionEl = document.getElementById("detalle-descripcion");
const detalleEspecificacionesEl = document.getElementById("detalle-especificaciones");
const detalleBloqueOpcionesEl = document.getElementById("detalle-bloque-opciones");
const detalleOpcionesEl = document.getElementById("detalle-opciones");
const detallePrecioEl = document.getElementById("detalle-precio");
const editarDesdeDetalleEl = document.getElementById("editar-desde-detalle");
const quitarDesdeDetalleEl = document.getElementById("quitar-desde-detalle");

const modalEditar = document.getElementById("modal-editar-carrito");
const formularioEditar = document.getElementById("form-editar-carrito");
const cerrarEditarEl = document.getElementById("cerrar-editar-carrito");
const cancelarEditarEl = document.getElementById("cancelar-editar");
const editarNombreEl = document.getElementById("editar-nombre");
const editarPrecioEl = document.getElementById("editar-precio");

let indiceDetalle = null;
let indiceEdicion = null;
let temporizadorAviso = null;

function buscarEnCatalogo(id) {
    return catalogo.find((producto) => producto.id === id) || null;
}

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

function crearIcono(trazos) {
    const icono = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icono.setAttribute("viewBox", "0 0 24 24");
    icono.setAttribute("aria-hidden", "true");

    trazos.forEach((trazo) => {
        const camino = document.createElementNS("http://www.w3.org/2000/svg", "path");
        camino.setAttribute("d", trazo);
        icono.append(camino);
    });

    return icono;
}

function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE)) || [];
    } catch (error) {
        return [];
    }
}

function guardarCarrito() {
    localStorage.setItem(CLAVE, JSON.stringify(carrito));
}

// Devuelve las mejoras guardadas o, si la línea es antigua, las deduce del
// texto de personalización. Siempre entrega una opción por grupo.
function normalizarOpciones(item) {
    const guardadas = Array.isArray(item.opcionesPersonalizacion)
        ? item.opcionesPersonalizacion
        : [];
    const etiquetas = String(item.personalizacion || "")
        .split(",")
        .map((texto) => texto.trim());

    return GRUPOS_MEJORA.map((grupo) => {
        const guardada = guardadas.find((opcion) => opcion.grupo === grupo.grupo);
        let opcion = guardada
            ? grupo.opciones.find((candidata) => candidata.valor === guardada.valor)
            : null;

        if (!opcion) {
            const etiqueta = etiquetas.find((texto) =>
                grupo.opciones.some((candidata) => candidata.etiqueta === texto)
            );
            opcion = grupo.opciones.find((candidata) => candidata.etiqueta === etiqueta);
        }

        return {
            grupo: grupo.grupo,
            grupoEtiqueta: grupo.etiqueta,
            ...(opcion || grupo.opciones[0])
        };
    });
}

// Rellena los datos que antes no guardaba la tienda y conserva el precio que
// ya tenía la línea para no alterar compras existentes.
function normalizarItem(item) {
    const producto = buscarEnCatalogo(item.id);
    const esAccesorio = item.tipo === "accesorio" || producto?.tipo === "accesorio";
    const opciones = esAccesorio ? [] : normalizarOpciones(item);
    const extras = opciones.reduce((total, opcion) => total + Number(opcion.extra || 0), 0);
    const precioAnterior = Number(item.precio) || 0;
    const baseGuardada = Number(item.precioBase);
    const tieneBaseGuardada = item.precioBase !== undefined
        && item.precioBase !== null
        && Number.isFinite(baseGuardada)
        && baseGuardada >= 0;
    const precioBase = tieneBaseGuardada
        ? baseGuardada
        : Math.max(0, precioAnterior - extras);
    const nombreBase = item.nombreBase
        || producto?.nombre
        || String(item.nombre || "Producto").split(" — ")[0];
    const personalizacion = esAccesorio
        ? ""
        : opciones.map((opcion) => opcion.etiqueta).join(", ");
    const cantidad = Math.max(1, Math.min(99, Math.round(Number(item.cantidad) || 1)));

    return {
        ...item,
        nombreBase,
        nombre: personalizacion ? `${nombreBase} — ${personalizacion}` : nombreBase,
        precio: Math.round(precioBase + extras),
        precioBase,
        extras,
        cantidad,
        personalizacion,
        opcionesPersonalizacion: opciones,
        imagen: item.imagen || producto?.imagenPrincipal || "",
        categoria: item.categoria || producto?.categoria || "",
        tipo: esAccesorio ? "accesorio" : "computadora",
        marca: item.marca || producto?.marca || "",
        especificacionesCortas: item.especificacionesCortas || producto?.especificacionesCortas || "",
        descripcionLarga: item.descripcionLarga || producto?.descripcionLarga || ""
    };
}

function normalizarCarrito(lista) {
    return Array.isArray(lista) ? lista.filter((item) => item && item.id !== undefined).map(normalizarItem) : [];
}

let carrito = normalizarCarrito(obtenerCarrito());
guardarCarrito();

function calcularTotal() {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

function contarArticulos() {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

function mostrarAviso(mensaje) {
    avisoEl.textContent = mensaje;
    avisoEl.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => {
        avisoEl.classList.remove("visible");
    }, 2800);
}

function actualizarBloqueoScroll() {
    const hayModal = modalDetalle.open || modalEditar.open;
    document.body.classList.toggle("carrito-con-modal", hayModal);
}

function crearEstadoVacio() {
    const estado = crearElemento("div", "estado-vacio-carrito");
    const icono = crearIcono([
        "M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6",
        "M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
    ]);

    const titulo = crearElemento("h3", "", "Tu carrito está vacío");
    const texto = crearElemento(
        "p",
        "",
        "Cuando agregues un equipo o un accesorio, aparecerá aquí con sus especificaciones y mejoras."
    );
    const enlace = crearElemento("a", "boton-explorar", "Explorar computadoras");
    enlace.href = "index.html";

    estado.append(icono, titulo, texto, enlace);
    return estado;
}

function crearChipsMejoras(item) {
    const contenedor = crearElemento("div", "mejoras-item-carrito");

    item.opcionesPersonalizacion.forEach((opcion) => {
        const chip = crearElemento("span", "chip-mejora");
        chip.append(crearElemento("span", "chip-grupo", opcion.grupoEtiqueta));
        chip.append(crearElemento("strong", "", opcion.etiqueta));

        if (Number(opcion.extra) > 0) {
            chip.append(crearElemento("small", "", `+${formatoMoneda.format(opcion.extra)}`));
        }

        contenedor.append(chip);
    });

    return contenedor;
}

function crearControlCantidad(item, indice) {
    const control = crearElemento("div", "control-cantidad");
    control.setAttribute("role", "group");
    control.setAttribute("aria-label", `Cantidad de ${item.nombreBase}`);

    const menos = crearElemento("button", "boton-cantidad");
    menos.type = "button";
    menos.dataset.accion = "menos";
    menos.dataset.indice = String(indice);
    menos.setAttribute("aria-label", "Quitar una unidad");
    menos.disabled = item.cantidad <= 1;
    menos.append(crearIcono(["M5 12h14"]));

    const valor = crearElemento("span", "valor-cantidad", String(item.cantidad));
    valor.setAttribute("aria-live", "polite");

    const mas = crearElemento("button", "boton-cantidad");
    mas.type = "button";
    mas.dataset.accion = "mas";
    mas.dataset.indice = String(indice);
    mas.setAttribute("aria-label", "Añadir una unidad");
    mas.disabled = item.cantidad >= 99;
    mas.append(crearIcono(["M12 5v14", "M5 12h14"]));

    control.append(menos, valor, mas);
    return control;
}

function crearTarjeta(item, indice) {
    const tarjeta = crearElemento("article", "tarjeta-carrito");

    const marco = crearElemento("div", "marco-imagen-carrito");
    const imagen = document.createElement("img");
    imagen.src = item.imagen;
    imagen.alt = item.nombreBase;
    imagen.loading = "lazy";
    imagen.addEventListener("error", () => {
        imagen.hidden = true;
        marco.classList.add("sin-imagen");
    }, { once: true });
    marco.append(imagen);

    const cuerpo = crearElemento("div", "cuerpo-item-carrito");

    const filaSuperior = crearElemento("div", "fila-superior-item");
    if (item.marca) {
        filaSuperior.append(crearElemento("p", "marca-item-carrito", item.marca));
    }
    if (item.categoria) {
        filaSuperior.append(crearElemento("span", "categoria-item-carrito", item.categoria));
    }

    const titulo = crearElemento("h3", "titulo-item-carrito");
    const botonTitulo = crearElemento("button", "nombre-item-carrito", item.nombreBase);
    botonTitulo.type = "button";
    botonTitulo.dataset.accion = "detalles";
    botonTitulo.dataset.indice = String(indice);
    botonTitulo.setAttribute("aria-label", `Ver detalles de ${item.nombreBase}`);
    titulo.append(botonTitulo);

    cuerpo.append(filaSuperior, titulo);

    if (item.especificacionesCortas) {
        cuerpo.append(crearElemento("p", "especificaciones-item-carrito", item.especificacionesCortas));
    }

    if (item.opcionesPersonalizacion.length) {
        cuerpo.append(crearChipsMejoras(item));
    }

    const pie = crearElemento("div", "pie-item-carrito");
    const precios = crearElemento("div", "precios-item-carrito");

    if (item.cantidad > 1) {
        precios.append(
            crearElemento("span", "precio-unidad-carrito", `${formatoMoneda.format(item.precio)} c/u`)
        );
    }

    precios.append(
        crearElemento("strong", "precio-linea-carrito", formatoMoneda.format(item.precio * item.cantidad))
    );

    const acciones = crearElemento("div", "acciones-item-carrito");
    acciones.append(crearControlCantidad(item, indice));

    const verDetalles = crearElemento("button", "accion-item-carrito", "Ver detalles");
    verDetalles.type = "button";
    verDetalles.dataset.accion = "detalles";
    verDetalles.dataset.indice = String(indice);

    const quitar = crearElemento("button", "accion-item-carrito accion-quitar", "Quitar");
    quitar.type = "button";
    quitar.dataset.accion = "quitar";
    quitar.dataset.indice = String(indice);
    quitar.setAttribute("aria-label", `Quitar ${item.nombreBase} del carrito`);

    acciones.append(verDetalles, quitar);
    pie.append(precios, acciones);
    cuerpo.append(pie);
    tarjeta.append(marco, cuerpo);

    return tarjeta;
}

function actualizarResumen() {
    const articulos = contarArticulos();
    const total = calcularTotal();
    const estaVacio = carrito.length === 0;

    subtotalEl.textContent = formatoMoneda.format(total);
    totalEl.textContent = `Total: ${formatoMoneda.format(total)}`;
    cantidadArticulosEl.textContent = estaVacio
        ? "Sin artículos"
        : `${articulos} artículo${articulos === 1 ? "" : "s"} en ${carrito.length} producto${carrito.length === 1 ? "" : "s"}`;

    resumenEl.hidden = estaVacio;
    disposicionEl.classList.toggle("carrito-vacio", estaVacio);
}

function mostrarCarrito() {
    contenidoEl.replaceChildren();

    if (carrito.length === 0) {
        contenidoEl.append(crearEstadoVacio());
    } else {
        carrito.forEach((item, indice) => {
            contenidoEl.append(crearTarjeta(item, indice));
        });
    }

    actualizarResumen();
}

function cambiarCantidad(indice, cambio) {
    const item = carrito[indice];
    if (!item) {
        return;
    }

    const nuevaCantidad = Math.max(1, Math.min(99, item.cantidad + cambio));
    if (nuevaCantidad === item.cantidad) {
        return;
    }

    item.cantidad = nuevaCantidad;
    guardarCarrito();
    mostrarCarrito();
}

function eliminarProducto(indice) {
    const item = carrito[indice];
    if (!item) {
        return;
    }

    carrito.splice(indice, 1);
    guardarCarrito();
    mostrarCarrito();
    mostrarAviso(`${item.nombreBase} se quitó del carrito.`);
}

function crearChipDetalle(opcion) {
    const chip = crearElemento("span", "chip-mejora");
    chip.append(crearElemento("span", "chip-grupo", opcion.grupoEtiqueta));
    chip.append(crearElemento("strong", "", opcion.etiqueta));

    if (Number(opcion.extra) > 0) {
        chip.append(crearElemento("small", "", `+${formatoMoneda.format(opcion.extra)}`));
    }

    return chip;
}

function abrirDetalle(indice) {
    const item = carrito[indice];
    if (!item) {
        return;
    }

    const producto = buscarEnCatalogo(item.id);
    const nombre = item.nombreBase;
    const descripcion = item.descripcionLarga || item.especificacionesCortas || "";
    const especificaciones = producto?.especificacionesTecnicas?.length
        ? producto.especificacionesTecnicas
        : String(item.especificacionesCortas || "").split(/,\s*/).filter(Boolean);

    if (modalEditar.open) {
        modalEditar.close();
    }

    indiceDetalle = indice;
    detalleImagenEl.src = item.imagen;
    detalleImagenEl.alt = nombre;
    detalleMarcaEl.textContent = item.marca || "Computlalte";
    detalleCategoriaEl.textContent = item.categoria;
    detalleCategoriaEl.hidden = !item.categoria;
    detalleNombreEl.textContent = nombre;
    detalleDescripcionEl.textContent = descripcion;
    detalleDescripcionEl.hidden = !descripcion;

    detalleEspecificacionesEl.replaceChildren(
        ...especificaciones.map((texto) => crearElemento("li", "", texto))
    );

    detalleBloqueOpcionesEl.hidden = item.opcionesPersonalizacion.length === 0;
    detalleOpcionesEl.replaceChildren(
        ...item.opcionesPersonalizacion.map(crearChipDetalle)
    );

    detallePrecioEl.textContent = item.cantidad > 1
        ? `Precio unitario: ${formatoMoneda.format(item.precio)} · Total de la línea: ${formatoMoneda.format(item.precio * item.cantidad)}`
        : `Precio unitario: ${formatoMoneda.format(item.precio)}`;

    editarDesdeDetalleEl.hidden = item.tipo === "accesorio";

    if (!modalDetalle.open) {
        modalDetalle.showModal();
    }
    actualizarBloqueoScroll();
}

function preseleccionarOpciones(opciones) {
    const porGrupo = new Map(opciones.map((opcion) => [opcion.grupo, opcion.valor]));
    const entradas = [...formularioEditar.querySelectorAll('input[type="radio"]')];
    const grupos = new Set(entradas.map((entrada) => entrada.dataset.grupo));

    grupos.forEach((grupo) => {
        const opcionesGrupo = entradas.filter((entrada) => entrada.dataset.grupo === grupo);
        const elegida = opcionesGrupo.find((entrada) => entrada.value === porGrupo.get(grupo))
            || opcionesGrupo[0];

        opcionesGrupo.forEach((entrada) => {
            entrada.checked = entrada === elegida;
        });
    });
}

function leerOpcionesEdicion() {
    return [...formularioEditar.querySelectorAll('input[type="radio"]:checked')].map((entrada) => ({
        grupo: entrada.dataset.grupo,
        grupoEtiqueta: entrada.closest(".grupo-edicion")?.querySelector("legend")?.textContent.trim() || "",
        valor: entrada.value,
        etiqueta: entrada.dataset.etiqueta,
        extra: Number(entrada.dataset.extra || 0)
    }));
}

function calcularPrecioEdicion(item) {
    const extras = [...formularioEditar.querySelectorAll('input[type="radio"]:checked')]
        .reduce((total, entrada) => total + Number(entrada.dataset.extra || 0), 0);

    return { precio: Math.round(item.precioBase + extras), extras };
}

function actualizarPrecioEdicion() {
    if (indiceEdicion === null || !carrito[indiceEdicion]) {
        return;
    }

    const { precio, extras } = calcularPrecioEdicion(carrito[indiceEdicion]);
    editarPrecioEl.textContent = extras > 0
        ? `Nuevo precio: ${formatoMoneda.format(precio)} · ${formatoMoneda.format(extras)} en mejoras`
        : `Nuevo precio: ${formatoMoneda.format(precio)}`;
}

function abrirEdicion(indice) {
    const item = carrito[indice];
    if (!item || item.tipo === "accesorio") {
        return;
    }

    if (modalDetalle.open) {
        modalDetalle.close();
    }

    indiceEdicion = indice;
    editarNombreEl.textContent = item.nombreBase;
    preseleccionarOpciones(item.opcionesPersonalizacion);
    actualizarPrecioEdicion();

    if (!modalEditar.open) {
        modalEditar.showModal();
    }
    actualizarBloqueoScroll();

    requestAnimationFrame(() => {
        formularioEditar.querySelector('input[type="radio"]:checked')?.focus({ preventScroll: true });
    });
}

function guardarEdicion(evento) {
    evento.preventDefault();

    if (indiceEdicion === null || !carrito[indiceEdicion]) {
        modalEditar.close();
        return;
    }

    const item = carrito[indiceEdicion];
    const opciones = leerOpcionesEdicion();
    const extras = opciones.reduce((total, opcion) => total + Number(opcion.extra || 0), 0);
    const precio = Math.round(item.precioBase + extras);
    const personalizacion = opciones.map((opcion) => opcion.etiqueta).join(", ");
    const actualizado = {
        ...item,
        opcionesPersonalizacion: opciones,
        extras,
        precio,
        personalizacion,
        nombre: `${item.nombreBase} — ${personalizacion}`
    };

    // Si las nuevas mejoras coinciden con otra línea del mismo equipo, se une
    // la cantidad en lugar de dejar dos filas idénticas.
    const indiceDuplicado = carrito.findIndex((otro, indice) =>
        indice !== indiceEdicion
        && otro.id === item.id
        && (otro.personalizacion || "") === personalizacion
    );

    let mensaje = "Mejoras actualizadas.";
    if (indiceDuplicado >= 0) {
        carrito[indiceDuplicado].cantidad = Math.min(
            99,
            carrito[indiceDuplicado].cantidad + item.cantidad
        );
        carrito.splice(indiceEdicion, 1);
        mensaje = "Ese equipo ya tenía las mismas mejoras: unimos las cantidades.";
    } else {
        carrito[indiceEdicion] = actualizado;
    }

    indiceEdicion = null;
    guardarCarrito();
    mostrarCarrito();
    modalEditar.close();
    mostrarAviso(mensaje);
}

// Un solo listener atiende las tarjetas, incluso después de volver a pintarlas.
contenidoEl.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) {
        return;
    }

    const indice = Number(boton.dataset.indice);
    if (!Number.isInteger(indice) || !carrito[indice]) {
        return;
    }

    if (boton.dataset.accion === "mas") {
        cambiarCantidad(indice, 1);
    } else if (boton.dataset.accion === "menos") {
        cambiarCantidad(indice, -1);
    } else if (boton.dataset.accion === "quitar") {
        eliminarProducto(indice);
    } else if (boton.dataset.accion === "detalles") {
        abrirDetalle(indice);
    }
});

cerrarDetalleEl.addEventListener("click", () => modalDetalle.close());
editarDesdeDetalleEl.addEventListener("click", () => {
    if (indiceDetalle === null) {
        return;
    }
    const indice = indiceDetalle;
    modalDetalle.close();
    abrirEdicion(indice);
});
quitarDesdeDetalleEl.addEventListener("click", () => {
    if (indiceDetalle === null) {
        return;
    }
    const indice = indiceDetalle;
    modalDetalle.close();
    eliminarProducto(indice);
});

cerrarEditarEl.addEventListener("click", () => modalEditar.close());
cancelarEditarEl.addEventListener("click", () => modalEditar.close());
formularioEditar.addEventListener("change", (evento) => {
    if (evento.target.matches('input[type="radio"]')) {
        actualizarPrecioEdicion();
    }
});
formularioEditar.addEventListener("submit", guardarEdicion);

[modalDetalle, modalEditar].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) {
            modal.close();
        }
    });
    modal.addEventListener("close", () => {
        if (modal === modalDetalle) {
            indiceDetalle = null;
        } else {
            indiceEdicion = null;
        }
        actualizarBloqueoScroll();
    });
});

pagarEl.addEventListener("click", () => {
    if (carrito.length === 0) {
        mostrarAviso("Tu carrito está vacío. Añade un producto para continuar.");
        return;
    }

    const sesionIniciada = localStorage.getItem("sesionIniciada") === "true";

    if (!sesionIniciada) {
        mostrarAviso("Inicia sesión para continuar con el pago.");
        localStorage.setItem("redirigirTrasLogin", "carrito");
        window.location.href = "login.html";
        return;
    }

    window.location.href = "pago.html";
});

// Mantiene el carrito al día si se agrega o quita algo desde otra pestaña.
window.addEventListener("storage", (evento) => {
    if (evento.key !== CLAVE) {
        return;
    }

    carrito = normalizarCarrito(obtenerCarrito());
    mostrarCarrito();
});

mostrarCarrito();
