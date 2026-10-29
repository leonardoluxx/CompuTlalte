// El carrito y las cuentas se comparten con el resto del sitio.
const CLAVE_CARRITO = "carrito";
const CLAVE_USUARIOS = "usuarios";
const CLAVE_METODO = "metodoPagoPreferido";

// Mismo formato de moneda que la tienda y el carrito.
const formatoMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
});

const encabezadoPagoEl = document.getElementById("encabezado-pago");
const disposicionPagoEl = document.getElementById("disposicion-pago");
const montoEl = document.getElementById("monto");
const listaResumenEl = document.getElementById("lista-resumen-pago");
const subtotalEl = document.getElementById("subtotal-pago");
const totalEl = document.getElementById("total-pago");
const selectorMetodosEl = document.getElementById("selector-metodos");
const avisoMetodoEl = document.getElementById("aviso-metodo");
const textoAvisoEl = document.getElementById("texto-aviso-metodo");
const enlaceVacioEl = document.getElementById("enlace-vacio");
const radiosMetodo = [...document.querySelectorAll('input[name="metodo-pago"]')];

const panelTransferenciaEl = document.getElementById("panel-transferencia");
const panelTarjetaEl = document.getElementById("panel-tarjeta");

const formularioTransferenciaEl = document.getElementById("formulario-transferencia");
const titularTransferenciaEl = document.getElementById("titular-transferencia");
const bancoTransferenciaEl = document.getElementById("banco-transferencia");
const referenciaTransferenciaEl = document.getElementById("referencia-transferencia");
const fechaTransferenciaEl = document.getElementById("fecha-transferencia");
const mensajeTransferenciaEl = document.getElementById("mensaje-transferencia");
const confirmarTransferenciaEl = document.getElementById("confirmar-transferencia");

const formularioTarjetaEl = document.getElementById("formulario-tarjeta");
const numeroTarjetaEl = document.getElementById("numero-tarjeta");
const titularTarjetaEl = document.getElementById("titular-tarjeta");
const vencimientoTarjetaEl = document.getElementById("vencimiento-tarjeta");
const cvvTarjetaEl = document.getElementById("cvv-tarjeta");
const mensajeTarjetaEl = document.getElementById("mensaje-tarjeta");
const confirmarTarjetaEl = document.getElementById("confirmar-tarjeta");

const panelExitoEl = document.getElementById("panel-exito");
const mensajeExitoEl = document.getElementById("mensaje-exito");
const folioEl = document.getElementById("folio-pago");
const metodoExitoEl = document.getElementById("metodo-exito");
const totalExitoEl = document.getElementById("total-exito");
const tituloExitoEl = document.getElementById("titulo-exito");

let carrito = obtenerCarrito();

function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
    } catch (error) {
        return [];
    }
}

function calcularTotal(lista) {
    return lista.reduce(function (total, producto) {
        return total + (Number(producto.precio) || 0) * (Number(producto.cantidad) || 0);
    }, 0);
}

function obtenerUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || [];
    } catch (error) {
        return [];
    }
}

function obtenerUsuarioActual() {
    const correoSesion = localStorage.getItem("usuario");
    if (!correoSesion) {
        return null;
    }

    return obtenerUsuarios().find(function (usuario) {
        return String(usuario.correo || "").toLowerCase() === correoSesion.toLowerCase();
    }) || null;
}

// La cuenta manda; para invitados se usa la última preferencia guardada.
function obtenerMetodoGuardado() {
    const usuario = obtenerUsuarioActual();

    if (usuario) {
        return ["transferencia", "tarjeta"].includes(usuario.metodoPago)
            ? usuario.metodoPago
            : "";
    }

    const guardado = localStorage.getItem(CLAVE_METODO);
    return ["transferencia", "tarjeta"].includes(guardado) ? guardado : "";
}

// Solo se guarda la preferencia, nunca el número ni el CVV de la tarjeta.
function guardarMetodoPreferido(metodo) {
    try {
        localStorage.setItem(CLAVE_METODO, metodo);
    } catch (error) {
        // Si el navegador bloquea el almacenamiento, el pago continúa igual.
    }

    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        return;
    }

    const usuarios = obtenerUsuarios();
    const indice = usuarios.findIndex(function (registro) {
        return String(registro.correo || "").toLowerCase() === String(usuario.correo).toLowerCase();
    });

    if (indice >= 0) {
        usuarios[indice].metodoPago = metodo;
        localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    }
}

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

function mostrarResumen() {
    const total = calcularTotal(carrito);
    montoEl.textContent = "Total: " + formatoMoneda.format(total);
    subtotalEl.textContent = formatoMoneda.format(total);
    totalEl.textContent = "Total: " + formatoMoneda.format(total);
    confirmarTarjetaEl.textContent = "Pagar " + formatoMoneda.format(total);

    if (carrito.length === 0) {
        listaResumenEl.replaceChildren(
            crearElemento("li", "linea-resumen-pago linea-resumen-vacia", "Tu carrito está vacío.")
        );
        return;
    }

    const lineas = carrito.map(function (producto) {
        const linea = crearElemento("li", "linea-resumen-pago");
        const info = crearElemento("span", "info-resumen-pago");
        const nombre = producto.nombreBase
            || String(producto.nombre || "Producto").split(" — ")[0];
        const cantidad = Math.max(1, Number(producto.cantidad) || 1);

        info.append(
            crearElemento("strong", "", nombre),
            crearElemento("small", "", `${cantidad} × ${formatoMoneda.format(Number(producto.precio) || 0)}`)
        );

        linea.append(
            info,
            crearElemento(
                "span",
                "importe-resumen-pago",
                formatoMoneda.format((Number(producto.precio) || 0) * cantidad)
            )
        );

        return linea;
    });

    listaResumenEl.replaceChildren(...lineas);
}

function mostrarAviso(texto, mostrarEnlace) {
    textoAvisoEl.textContent = texto;
    enlaceVacioEl.hidden = !mostrarEnlace;
    avisoMetodoEl.hidden = false;
}

function marcarMetodo(metodo) {
    const radio = radiosMetodo.find(function (elemento) {
        return elemento.value === metodo;
    });

    if (radio) {
        radio.checked = true;
    }

    panelTransferenciaEl.hidden = metodo !== "transferencia";
    panelTarjetaEl.hidden = metodo !== "tarjeta";
    avisoMetodoEl.hidden = true;
}

function limpiarMensajes() {
    mensajeTransferenciaEl.textContent = "";
    mensajeTarjetaEl.textContent = "";
}

function validarLuhn(numero) {
    let suma = 0;
    let duplicar = false;

    for (let indice = numero.length - 1; indice >= 0; indice -= 1) {
        let digito = Number(numero.charAt(indice));

        if (duplicar) {
            digito *= 2;
            if (digito > 9) {
                digito -= 9;
            }
        }

        suma += digito;
        duplicar = !duplicar;
    }

    return numero.length >= 13 && numero.length <= 19 && suma % 10 === 0;
}

function vencimientoValido(valor) {
    const coincidencia = /^(\d{2})\/(\d{2})$/.exec(valor);
    if (!coincidencia) {
        return false;
    }

    const mes = Number(coincidencia[1]);
    const anio = 2000 + Number(coincidencia[2]);

    if (mes < 1 || mes > 12) {
        return false;
    }

    // La tarjeta es válida hasta el último día de su mes de vencimiento.
    const finDeMes = new Date(anio, mes, 0, 23, 59, 59);
    return finDeMes >= new Date();
}

function fechaTransferenciaValida(valor) {
    if (!valor) {
        return false;
    }

    const fecha = new Date(`${valor}T00:00:00`);
    if (Number.isNaN(fecha.getTime())) {
        return false;
    }

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    return fecha <= hoy;
}

function generarFolio() {
    const ahora = new Date();
    const fecha = [
        ahora.getFullYear(),
        String(ahora.getMonth() + 1).padStart(2, "0"),
        String(ahora.getDate()).padStart(2, "0")
    ].join("");
    const aleatorio = Math.random().toString(36).slice(2, 6).toUpperCase();

    return `CTL-${fecha}-${aleatorio}`;
}

// Identifica la marca solo para mostrarla en Mi cuenta; no valida la tarjeta.
function detectarMarcaTarjeta(numero) {
    if (/^4/.test(numero)) {
        return "Visa";
    }
    if (/^(5[1-5]|2[2-7])/.test(numero)) {
        return "Mastercard";
    }
    if (/^3[47]/.test(numero)) {
        return "American Express";
    }
    return "Tarjeta";
}

// Guarda en la cuenta únicamente la marca y los últimos 4 dígitos.
function guardarTarjetaEnCuenta(numero) {
    const usuario = obtenerUsuarioActual();

    if (!usuario || !numero) {
        return;
    }

    const usuarios = obtenerUsuarios();
    const indice = usuarios.findIndex(function (registro) {
        return String(registro.correo || "").toLowerCase() === String(usuario.correo).toLowerCase();
    });

    if (indice < 0) {
        return;
    }

    usuarios[indice].tarjetaGuardada = {
        marca: detectarMarcaTarjeta(numero),
        ultimos4: numero.slice(-4),
        actualizado: new Date().toISOString()
    };

    try {
        localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    } catch (error) {
        // Si el navegador bloquea el almacenamiento, el pedido ya quedó registrado.
    }
}

function guardarPedidoEnHistorial(pedido) {
    try {
        const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
        pedidos.unshift(pedido);
        localStorage.setItem("pedidos", JSON.stringify(pedidos.slice(0, 40)));
    } catch (error) {
        // El historial local es opcional; el pedido ya se completó.
    }
}

function finalizarPago(metodo, datosPago = {}) {
    const carritoFinal = obtenerCarrito();
    const totalFinal = calcularTotal(carritoFinal);

    if (carritoFinal.length === 0) {
        mostrarAviso("Tu carrito está vacío. Agrega un producto para continuar.", true);
        return;
    }

    guardarMetodoPreferido(metodo);

    if (metodo === "tarjeta" && datosPago.numero) {
        guardarTarjetaEnCuenta(datosPago.numero);
    }

    const usuario = obtenerUsuarioActual();
    const folio = generarFolio();
    const pedido = {
        folio: folio,
        metodo: metodo,
        total: totalFinal,
        fecha: new Date().toISOString(),
        articulos: carritoFinal.reduce(function (total, producto) {
            return total + (Number(producto.cantidad) || 0);
        }, 0),
        estado: metodo === "tarjeta" ? "Pagado" : "En revisión",
        cliente: usuario ? usuario.correo : "",
        detallePago: metodo === "transferencia"
            ? {
                banco: datosPago.banco || "",
                referencia: datosPago.referencia || "",
                fecha: datosPago.fecha || ""
            }
            : null,
        productos: carritoFinal.map(function (producto) {
            return {
                nombre: producto.nombreBase || String(producto.nombre || "Producto").split(" — ")[0],
                cantidad: Number(producto.cantidad) || 1,
                precio: Number(producto.precio) || 0,
                imagen: producto.imagen || ""
            };
        })
    };

    localStorage.removeItem(CLAVE_CARRITO);
    guardarPedidoEnHistorial(pedido);

    try {
        localStorage.setItem("ultimoPedido", JSON.stringify(pedido));
    } catch (error) {
        // El pedido ya se completó; el historial local es opcional.
    }

    formularioTarjetaEl.reset();
    encabezadoPagoEl.hidden = true;
    disposicionPagoEl.hidden = true;
    panelExitoEl.hidden = false;

    folioEl.textContent = folio;
    metodoExitoEl.textContent = metodo === "tarjeta"
        ? "Tarjeta de crédito o débito"
        : "Transferencia bancaria";
    totalExitoEl.textContent = formatoMoneda.format(totalFinal);
    mensajeExitoEl.textContent = metodo === "tarjeta"
        ? "Tu pago se procesó correctamente y tu pedido quedó confirmado. Puedes consultarlo en Mis pedidos."
        : "Recibimos los datos de tu transferencia. Tu pedido quedará en revisión hasta que confirmemos el pago.";

    tituloExitoEl.tabIndex = -1;
    tituloExitoEl.focus({ preventScroll: true });

    const movimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
    panelExitoEl.scrollIntoView({ behavior: movimiento, block: "start" });
}

function manejarTransferencia(evento) {
    evento.preventDefault();
    limpiarMensajes();

    if (carrito.length === 0) {
        mostrarAviso("Tu carrito está vacío. Agrega un producto para continuar.", true);
        return;
    }

    const titular = titularTransferenciaEl.value.trim();
    const banco = bancoTransferenciaEl.value.trim();
    const referencia = referenciaTransferenciaEl.value.trim();
    const fecha = fechaTransferenciaEl.value;

    if (titular === "") {
        mensajeTransferenciaEl.textContent = "Escribe el nombre del titular de la cuenta.";
        titularTransferenciaEl.focus();
        return;
    }

    if (banco === "") {
        mensajeTransferenciaEl.textContent = "Escribe el banco desde el que transferiste.";
        bancoTransferenciaEl.focus();
        return;
    }

    if (referencia === "") {
        mensajeTransferenciaEl.textContent = "Escribe la referencia o folio de la transferencia.";
        referenciaTransferenciaEl.focus();
        return;
    }

    if (!fechaTransferenciaValida(fecha)) {
        mensajeTransferenciaEl.textContent = fecha === ""
            ? "Selecciona la fecha de la transferencia."
            : "La fecha no puede ser posterior a hoy.";
        fechaTransferenciaEl.focus();
        return;
    }

    finalizarPago("transferencia", {
        banco: banco,
        referencia: referencia,
        fecha: fecha
    });
}

function manejarTarjeta(evento) {
    evento.preventDefault();
    limpiarMensajes();

    if (carrito.length === 0) {
        mostrarAviso("Tu carrito está vacío. Agrega un producto para continuar.", true);
        return;
    }

    const numero = numeroTarjetaEl.value.replace(/\D/g, "");
    const titular = titularTarjetaEl.value.trim();
    const vencimiento = vencimientoTarjetaEl.value.trim();
    const cvv = cvvTarjetaEl.value.trim();

    if (!/^\d{13,19}$/.test(numero) || !validarLuhn(numero)) {
        mensajeTarjetaEl.textContent = "Revisa el número de la tarjeta.";
        numeroTarjetaEl.focus();
        return;
    }

    if (titular.length < 3) {
        mensajeTarjetaEl.textContent = "Escribe el nombre como aparece en la tarjeta.";
        titularTarjetaEl.focus();
        return;
    }

    if (!vencimientoValido(vencimiento)) {
        mensajeTarjetaEl.textContent = "Revisa la fecha de vencimiento (MM/AA).";
        vencimientoTarjetaEl.focus();
        return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        mensajeTarjetaEl.textContent = "El CVV debe tener 3 o 4 dígitos.";
        cvvTarjetaEl.focus();
        return;
    }

    confirmarTarjetaEl.disabled = true;
    confirmarTarjetaEl.textContent = "Procesando pago…";
    formularioTarjetaEl.querySelectorAll("input").forEach(function (campo) {
        campo.disabled = true;
    });

    setTimeout(function () {
        finalizarPago("tarjeta", { numero: numero, titular: titular });
    }, 900);
}

// Formatea el número mientras se escribe y limita los campos numéricos.
numeroTarjetaEl.addEventListener("input", function () {
    const digitos = numeroTarjetaEl.value.replace(/\D/g, "").slice(0, 19);
    numeroTarjetaEl.value = digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
});

vencimientoTarjetaEl.addEventListener("input", function () {
    let digitos = vencimientoTarjetaEl.value.replace(/\D/g, "").slice(0, 4);
    if (digitos.length > 2) {
        digitos = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }
    vencimientoTarjetaEl.value = digitos;
});

cvvTarjetaEl.addEventListener("input", function () {
    cvvTarjetaEl.value = cvvTarjetaEl.value.replace(/\D/g, "").slice(0, 4);
});

radiosMetodo.forEach(function (radio) {
    radio.addEventListener("change", function () {
        if (!radio.checked) {
            return;
        }

        limpiarMensajes();
        marcarMetodo(radio.value);
    });
});

formularioTransferenciaEl.addEventListener("submit", manejarTransferencia);
formularioTarjetaEl.addEventListener("submit", manejarTarjeta);

// Copiar la CLABE facilita hacer la transferencia sin errores de dedo.
document.querySelectorAll("[data-copiar]").forEach(function (boton) {
    boton.addEventListener("click", async function () {
        const textoOriginal = boton.textContent;

        try {
            await navigator.clipboard.writeText(boton.dataset.copiar);
            boton.textContent = "Copiado ✓";
        } catch (error) {
            boton.textContent = "Copia manual";
        }

        setTimeout(function () {
            boton.textContent = textoOriginal;
        }, 1800);
    });
});

function iniciarPagina() {
    mostrarResumen();

    if (carrito.length === 0) {
        selectorMetodosEl.hidden = true;
        panelTransferenciaEl.hidden = true;
        panelTarjetaEl.hidden = true;
        mostrarAviso("Tu carrito está vacío. Agrega un producto para continuar.", true);
        confirmarTransferenciaEl.disabled = true;
        confirmarTarjetaEl.disabled = true;
        return;
    }

    const metodoGuardado = obtenerMetodoGuardado();

    if (metodoGuardado) {
        marcarMetodo(metodoGuardado);
    } else {
        mostrarAviso(
            "Aún no tienes un método de pago definido. Elige transferencia o tarjeta para continuar; lo guardaremos en tu cuenta.",
            false
        );
    }
}

iniciarPagina();
