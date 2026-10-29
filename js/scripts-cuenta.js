// La cuenta se guarda junto con los usuarios del registro y del inicio de sesión.
const CLAVE_USUARIOS = "usuarios";
const CLAVE_PEDIDOS = "pedidos";
const CLAVE_METODO = "metodoPagoPreferido";

const panelSesionEl      = document.getElementById("panel-sesion");
const mensajeSesionEl    = document.getElementById("mensaje-sesion");
const disposicionEl      = document.getElementById("disposicion-cuenta");
const avatarEl           = document.getElementById("avatar-cuenta");
const descripcionEl      = document.getElementById("descripcion-cuenta");
const perfilNombreEl     = document.getElementById("perfil-nombre");
const perfilCorreoEl     = document.getElementById("perfil-correo");
const totalPedidosEl     = document.getElementById("total-pedidos");
const perfilMetodoEl     = document.getElementById("perfil-metodo");
const listaPedidosEl     = document.getElementById("lista-pedidos");

const formularioDatosEl  = document.getElementById("formulario-datos");
const nombreEl           = document.getElementById("nombre");
const correoEl           = document.getElementById("correo");
const direccionEl        = document.getElementById("direccion");
const mensajeDatosEl     = document.getElementById("mensaje-datos");

const formularioSeguridadEl = document.getElementById("formulario-seguridad");
const claveActualEl      = document.getElementById("clave-actual");
const claveNuevaEl       = document.getElementById("clave-nueva");
const claveConfirmarEl   = document.getElementById("clave-confirmar");
const mensajeSeguridadEl = document.getElementById("mensaje-seguridad");
const verificacionEl     = document.getElementById("verificacion-dos-pasos");
const estadoVerificacionEl = document.getElementById("estado-dos-pasos");

const formularioPagoEl   = document.getElementById("formulario-pago-cuenta");
const metodosPagoCuenta  = [...document.querySelectorAll('input[name="metodo-pago-cuenta"]')];
const estadoPagoEl       = document.getElementById("estado-pago");
const textoEstadoPagoEl  = document.getElementById("texto-estado-pago");
const mensajePagoEl      = document.getElementById("mensaje-pago");
const tarjetaGuardadaEl  = document.getElementById("tarjeta-guardada");
const textoTarjetaEl     = document.getElementById("texto-tarjeta-guardada");
const quitarTarjetaEl    = document.getElementById("quitar-tarjeta");

const cerrarSesionEl     = document.getElementById("cerrar-sesion");
const enlaceLoginEl      = document.getElementById("enlace-login");
const enlaceRegistroEl   = document.getElementById("enlace-registro");
const enlacesSeccion     = [...document.querySelectorAll(".menu-cuenta a[data-seccion]")];

const ETIQUETAS_METODO = {
    transferencia: "Transferencia bancaria",
    tarjeta: "Tarjeta de crédito o débito"
};

const formatoMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
});

let usuarioActual = null;

function obtenerUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || [];
    } catch (error) {
        return [];
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

function obtenerPedidos() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_PEDIDOS)) || [];
    } catch (error) {
        return [];
    }
}

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = "mensaje-cuenta" + (tipo ? " mensaje-" + tipo : "");
}

// Solo se aceptan los dos métodos reales del checkout.
function normalizarMetodo(valor) {
    return valor === "transferencia" || valor === "tarjeta" ? valor : "";
}

function actualizarEstadoPago(metodo) {
    const valor = normalizarMetodo(metodo);

    textoEstadoPagoEl.textContent = valor
        ? ETIQUETAS_METODO[valor]
        : "Sin método definido";

    estadoPagoEl.className = "estado-pago " + (valor ? "estado-definido" : "estado-sin");
}

// Marca la opción guardada y refresca la etiqueta de estado.
function marcarMetodoPago(metodo) {
    const valor = normalizarMetodo(metodo);
    const radio = metodosPagoCuenta.find(function (elemento) {
        return elemento.value === (valor || "ninguno");
    });

    if (radio) {
        radio.checked = true;
    }

    actualizarEstadoPago(valor);
    if (perfilMetodoEl) {
        perfilMetodoEl.textContent = valor ? ETIQUETAS_METODO[valor] : "Sin definir";
    }
}

function actualizarEncabezado(nombre) {
    const nombreLimpio = String(nombre || "").trim();
    avatarEl.textContent = nombreLimpio.charAt(0).toUpperCase() || "?";
    perfilNombreEl.textContent = nombreLimpio || "Cliente Computlalte";

    if (nombreLimpio === "") {
        descripcionEl.textContent = "Administra tus datos, tu seguridad y tus compras.";
        return;
    }

    const primerNombre = nombreLimpio.split(" ")[0];
    descripcionEl.textContent = "Hola, " + primerNombre + ". Administra tus datos, tu seguridad y tus compras.";
}

// Muestra el aviso de inicio de sesión y recuerda a dónde volver tras entrar.
function mostrarPanelSesion(texto) {
    panelSesionEl.hidden = false;
    disposicionEl.hidden = true;
    mensajeSesionEl.textContent = texto || "";

    enlaceLoginEl.addEventListener("click", function () {
        localStorage.setItem("redirigirTrasLogin", "cuenta");
    });

    enlaceRegistroEl.addEventListener("click", function () {
        localStorage.setItem("redirigirTrasLogin", "cuenta");
    });
}

function mostrarTarjetaGuardada(usuario) {
    const tarjeta = usuario && usuario.tarjetaGuardada;

    if (!tarjeta || !tarjeta.ultimos4) {
        tarjetaGuardadaEl.hidden = true;
        textoTarjetaEl.textContent = "";
        return;
    }

    const marca = tarjeta.marca ? tarjeta.marca + " " : "";
    textoTarjetaEl.textContent = marca + "•••• •••• •••• " + tarjeta.ultimos4;
    tarjetaGuardadaEl.hidden = false;
}

function actualizarEstadoVerificacion(usuario) {
    const activa = Boolean(usuario && usuario.autenticacionDosPasos);
    verificacionEl.checked = activa;
    estadoVerificacionEl.textContent = activa ? "Activada" : "Desactivada";
}

function guardarUsuarioActual(usuarios, indice) {
    usuarioActual = usuarios[indice];
    guardarUsuarios(usuarios);
    localStorage.setItem("usuario", usuarioActual.correo);
    localStorage.setItem("usuarioNombre", usuarioActual.nombre);
}

// Convierte el ISO del pedido en una fecha legible para la clienta o el cliente.
function formatearFechaPedido(fecha) {
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) {
        return "Fecha por confirmar";
    }

    return valor.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

function crearPedidoVacio() {
    const vacio = document.createElement("div");
    vacio.className = "pedidos-vacio";

    const icono = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icono.setAttribute("viewBox", "0 0 24 24");
    icono.setAttribute("aria-hidden", "true");
    const trazo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    trazo.setAttribute("d", "M5 4h14a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2V5a1 1 0 0 1 1-1Z");
    icono.append(trazo);

    const titulo = document.createElement("h3");
    titulo.textContent = "Aún no tienes pedidos";

    const texto = document.createElement("p");
    texto.textContent = "Cuando completes una compra, aquí verás su folio, su estado y su total.";

    const enlace = document.createElement("a");
    enlace.className = "boton-secundario";
    enlace.href = "index.html#computadoras";
    enlace.textContent = "Explorar la tienda";

    vacio.append(icono, titulo, texto, enlace);
    return vacio;
}

function crearTarjetaPedido(pedido) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "pedido-cuenta";

    const cabecera = document.createElement("div");
    cabecera.className = "cabecera-pedido";

    const identificacion = document.createElement("div");
    const folio = document.createElement("h3");
    folio.textContent = pedido.folio || "Pedido";
    const fecha = document.createElement("p");
    fecha.className = "fecha-pedido";
    fecha.textContent = formatearFechaPedido(pedido.fecha);
    identificacion.append(folio, fecha);

    const estado = document.createElement("span");
    const estadoPedido = String(pedido.estado || "").toLowerCase();
    estado.className = "estado-pedido "
        + (estadoPedido === "pagado" ? "estado-pagado" : "estado-revision");
    estado.textContent = pedido.estado || "En revisión";

    cabecera.append(identificacion, estado);

    const detalles = document.createElement("dl");
    detalles.className = "detalles-pedido";

    const metodo = document.createElement("div");
    const metodoTermino = document.createElement("dt");
    metodoTermino.textContent = "Método";
    const metodoValor = document.createElement("dd");
    metodoValor.textContent = ETIQUETAS_METODO[normalizarMetodo(pedido.metodo)] || "No definido";
    metodo.append(metodoTermino, metodoValor);

    const articulos = document.createElement("div");
    const articulosTermino = document.createElement("dt");
    articulosTermino.textContent = "Artículos";
    const articulosValor = document.createElement("dd");
    articulosValor.textContent = String(pedido.articulos || 0);
    articulos.append(articulosTermino, articulosValor);

    const total = document.createElement("div");
    const totalTermino = document.createElement("dt");
    totalTermino.textContent = "Total";
    const totalValor = document.createElement("dd");
    totalValor.className = "total-pedido";
    totalValor.textContent = formatoMoneda.format(Number(pedido.total) || 0);
    total.append(totalTermino, totalValor);

    detalles.append(metodo, articulos, total);
    tarjeta.append(cabecera, detalles);

    const productos = Array.isArray(pedido.productos) ? pedido.productos : [];
    if (productos.length) {
        const lista = document.createElement("ul");
        lista.className = "productos-pedido";

        productos.slice(0, 4).forEach(function (producto) {
            const linea = document.createElement("li");
            const nombre = document.createElement("span");
            nombre.textContent = producto.nombre || "Producto";
            const cantidad = document.createElement("small");
            cantidad.textContent = "×" + (Number(producto.cantidad) || 1);
            linea.append(nombre, cantidad);
            lista.append(linea);
        });

        if (productos.length > 4) {
            const restantes = document.createElement("li");
            restantes.className = "productos-restantes";
            restantes.textContent = "y " + (productos.length - 4) + " producto(s) más";
            lista.append(restantes);
        }

        tarjeta.append(lista);
    }

    return tarjeta;
}

function mostrarPedidos(usuario) {
    const correo = String(usuario.correo || "").toLowerCase();
    const pedidos = obtenerPedidos().filter(function (pedido) {
        return !pedido.cliente || String(pedido.cliente).toLowerCase() === correo;
    });

    totalPedidosEl.textContent = String(pedidos.length);

    if (!pedidos.length) {
        listaPedidosEl.replaceChildren(crearPedidoVacio());
        return;
    }

    listaPedidosEl.replaceChildren(
        ...pedidos.map(function (pedido) {
            return crearTarjetaPedido(pedido);
        })
    );
}

function cargarCuenta() {
    const sesionIniciada = localStorage.getItem("sesionIniciada") === "true";
    const correoSesion = localStorage.getItem("usuario");

    if (!sesionIniciada || !correoSesion) {
        mostrarPanelSesion();
        return;
    }

    const usuarios = obtenerUsuarios();
    const indice = usuarios.findIndex(function (registro) {
        return String(registro.correo || "").toLowerCase() === String(correoSesion).toLowerCase();
    });

    if (indice === -1) {
        mostrarPanelSesion("Tu cuenta ya no está disponible. Inicia sesión de nuevo.");
        return;
    }

    usuarioActual = usuarios[indice];

    nombreEl.value = usuarioActual.nombre || "";
    correoEl.value = usuarioActual.correo || "";
    direccionEl.value = usuarioActual.direccion || "";
    perfilCorreoEl.textContent = usuarioActual.correo || "";

    marcarMetodoPago(usuarioActual.metodoPago);
    mostrarTarjetaGuardada(usuarioActual);
    actualizarEstadoVerificacion(usuarioActual);
    actualizarEncabezado(usuarioActual.nombre || "");
    mostrarPedidos(usuarioActual);

    panelSesionEl.hidden = true;
    disposicionEl.hidden = false;
}

function obtenerIndiceUsuarioActual() {
    if (!usuarioActual) {
        return -1;
    }

    const usuarios = obtenerUsuarios();
    return usuarios.findIndex(function (registro) {
        return String(registro.correo || "").toLowerCase() === String(usuarioActual.correo).toLowerCase();
    });
}

// Información personal
formularioDatosEl.addEventListener("submit", function (evento) {
    evento.preventDefault();
    mostrarMensaje(mensajeDatosEl, "", "");

    const nombre = nombreEl.value.trim();
    const correo = correoEl.value.trim();
    const direccion = direccionEl.value.trim();

    if (nombre === "") {
        mostrarMensaje(mensajeDatosEl, "Escribe tu nombre completo.", "error");
        nombreEl.focus();
        return;
    }

    if (correo === "" || !correoEl.checkValidity()) {
        mostrarMensaje(mensajeDatosEl, "Escribe un correo electrónico válido.", "error");
        correoEl.focus();
        return;
    }

    if (direccion === "") {
        mostrarMensaje(mensajeDatosEl, "Escribe tu dirección de entrega.", "error");
        direccionEl.focus();
        return;
    }

    const usuarios = obtenerUsuarios();
    const indice = obtenerIndiceUsuarioActual();

    if (indice === -1) {
        mostrarPanelSesion("Tu sesión terminó. Inicia sesión de nuevo para continuar.");
        return;
    }

    const correoRepetido = usuarios.some(function (registro, posicion) {
        return posicion !== indice
            && String(registro.correo || "").toLowerCase() === correo.toLowerCase();
    });

    if (correoRepetido) {
        mostrarMensaje(mensajeDatosEl, "Ya existe otra cuenta con ese correo electrónico.", "error");
        correoEl.focus();
        return;
    }

    usuarios[indice].nombre = nombre;
    usuarios[indice].correo = correo;
    usuarios[indice].direccion = direccion;

    // Los pedidos anteriores siguen vinculados aunque cambie el correo.
    const correoAnterior = String(usuarioActual.correo || "").toLowerCase();
    if (correo.toLowerCase() !== correoAnterior) {
        const pedidos = obtenerPedidos();
        let huboCambios = false;

        pedidos.forEach(function (pedido) {
            if (String(pedido.cliente || "").toLowerCase() === correoAnterior) {
                pedido.cliente = correo;
                huboCambios = true;
            }
        });

        if (huboCambios) {
            localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos));
        }
    }

    guardarUsuarioActual(usuarios, indice);
    perfilCorreoEl.textContent = correo;
    actualizarEncabezado(nombre);
    mostrarMensaje(mensajeDatosEl, "Tus datos se guardaron correctamente.", "exito");
});

// Seguridad
formularioSeguridadEl.addEventListener("submit", function (evento) {
    evento.preventDefault();
    mostrarMensaje(mensajeSeguridadEl, "", "");

    const claveActual = claveActualEl.value;
    const claveNueva = claveNuevaEl.value;
    const claveConfirmar = claveConfirmarEl.value;

    if (claveActual === "") {
        mostrarMensaje(mensajeSeguridadEl, "Escribe tu contraseña actual.", "error");
        claveActualEl.focus();
        return;
    }

    const usuarios = obtenerUsuarios();
    const indice = obtenerIndiceUsuarioActual();

    if (indice === -1) {
        mostrarPanelSesion("Tu sesión terminó. Inicia sesión de nuevo para continuar.");
        return;
    }

    if (claveActual !== usuarios[indice].clave) {
        mostrarMensaje(mensajeSeguridadEl, "La contraseña actual no es correcta.", "error");
        claveActualEl.focus();
        return;
    }

    if (claveNueva.length < 8) {
        mostrarMensaje(mensajeSeguridadEl, "La nueva contraseña debe tener al menos 8 caracteres.", "error");
        claveNuevaEl.focus();
        return;
    }

    if (claveNueva !== claveConfirmar) {
        mostrarMensaje(mensajeSeguridadEl, "Las contraseñas nuevas no coinciden.", "error");
        claveConfirmarEl.focus();
        return;
    }

    usuarios[indice].clave = claveNueva;
    guardarUsuarioActual(usuarios, indice);

    claveActualEl.value = "";
    claveNuevaEl.value = "";
    claveConfirmarEl.value = "";
    mostrarMensaje(mensajeSeguridadEl, "Tu contraseña se actualizó correctamente.", "exito");
});

// Métodos de pago
formularioPagoEl.addEventListener("submit", function (evento) {
    evento.preventDefault();
    mostrarMensaje(mensajePagoEl, "", "");

    const metodoSeleccionado = metodosPagoCuenta.find(function (radio) {
        return radio.checked;
    });
    const metodoPago = metodoSeleccionado
        ? normalizarMetodo(metodoSeleccionado.value)
        : "";

    const usuarios = obtenerUsuarios();
    const indice = obtenerIndiceUsuarioActual();

    if (indice === -1) {
        mostrarPanelSesion("Tu sesión terminó. Inicia sesión de nuevo para continuar.");
        return;
    }

    usuarios[indice].metodoPago = metodoPago;
    guardarUsuarioActual(usuarios, indice);

    // Mantiene sincronizada la preferencia que lee el checkout.
    if (metodoPago) {
        localStorage.setItem(CLAVE_METODO, metodoPago);
    } else {
        localStorage.removeItem(CLAVE_METODO);
    }

    actualizarEstadoPago(metodoPago);
    if (perfilMetodoEl) {
        perfilMetodoEl.textContent = metodoPago ? ETIQUETAS_METODO[metodoPago] : "Sin definir";
    }
    mostrarMensaje(mensajePagoEl, "Tu método de pago se guardó correctamente.", "exito");
});

quitarTarjetaEl.addEventListener("click", function () {
    const usuarios = obtenerUsuarios();
    const indice = obtenerIndiceUsuarioActual();

    if (indice === -1) {
        return;
    }

    delete usuarios[indice].tarjetaGuardada;
    guardarUsuarioActual(usuarios, indice);
    mostrarTarjetaGuardada(usuarioActual);
    mostrarMensaje(mensajePagoEl, "Quitamos la tarjeta guardada de tu cuenta.", "exito");
});

// Autenticación en dos pasos: se guarda en la cuenta y se refleja al instante.
verificacionEl.addEventListener("change", function () {
    const usuarios = obtenerUsuarios();
    const indice = obtenerIndiceUsuarioActual();

    if (indice === -1) {
        mostrarPanelSesion("Tu sesión terminó. Inicia sesión de nuevo para continuar.");
        return;
    }

    usuarios[indice].autenticacionDosPasos = verificacionEl.checked;
    guardarUsuarioActual(usuarios, indice);
    actualizarEstadoVerificacion(usuarioActual);
    mostrarMensaje(
        mensajeSeguridadEl,
        verificacionEl.checked
            ? "La verificación en dos pasos quedó activada."
            : "La verificación en dos pasos quedó desactivada.",
        "exito"
    );
});

// El estado cambia al instante al elegir, aunque todavía haya que guardar.
metodosPagoCuenta.forEach(function (radio) {
    radio.addEventListener("change", function () {
        if (radio.checked) {
            actualizarEstadoPago(radio.value);
        }
    });
});

// El menú lateral abre la sección elegida y la trae a la vista.
enlacesSeccion.forEach(function (enlace) {
    enlace.addEventListener("click", function (evento) {
        evento.preventDefault();

        const seccion = document.getElementById(enlace.dataset.seccion);
        if (!seccion) {
            return;
        }

        seccion.open = true;
        seccion.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
        });

        try {
            history.replaceState(null, "", "#" + enlace.dataset.seccion);
        } catch (error) {
            // Con archivos abiertos directamente en local puede no permitirse.
        }
    });
});

cerrarSesionEl.addEventListener("click", function () {
    localStorage.removeItem("sesionIniciada");
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioNombre");
    localStorage.removeItem("redirigirTrasLogin");
    window.location.href = "index.html";
});

cargarCuenta();
