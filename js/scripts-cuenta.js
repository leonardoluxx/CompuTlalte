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
const telefonoEl         = document.getElementById("telefono");
const rfcEl              = document.getElementById("rfc");
const mensajeDatosEl     = document.getElementById("mensaje-datos");

const formularioSeguridadEl = document.getElementById("formulario-seguridad");
const claveActualEl      = document.getElementById("clave-actual");
const claveNuevaEl       = document.getElementById("clave-nueva");
const claveConfirmarEl   = document.getElementById("clave-confirmar");
const mensajeSeguridadEl = document.getElementById("mensaje-seguridad");
const alternarClavesEl   = document.getElementById("alternar-claves");
const textoAlternarClavesEl = document.getElementById("texto-alternar-claves");

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

// La tarjeta guardada vive solo en este navegador y NUNCA se envía al
// servidor: es una comodidad del cliente, no un dato de la base.
const CLAVE_TARJETA = "computlalte-tarjeta-guardada";

function obtenerTarjeta(email) {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_TARJETA + ":" + String(email || "").toLowerCase()) || "null");
    } catch (error) {
        return null;
    }
}

function guardarTarjeta(email, tarjeta) {
    try {
        localStorage.setItem(CLAVE_TARJETA + ":" + String(email || "").toLowerCase(), JSON.stringify(tarjeta));
    } catch (error) {
        // Sin almacenamiento la tarjeta simplemente no se recuerda.
    }
}

function borrarTarjeta(email) {
    try {
        localStorage.removeItem(CLAVE_TARJETA + ":" + String(email || "").toLowerCase());
    } catch (error) {
        // Nada que borrar.
    }
}

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = "mensaje-cuenta" + (tipo ? " mensaje-" + tipo : "");
}

// ------------------------------------------------- seguridad de las peticiones
// El servidor exige un token CSRF en cada POST. La página lo toma del <meta>
// que inyecta api/bootstrap.php y, si el servidor lo rechaza (sesión renovada,
// token vencido), lo pide de nuevo a api/csrf.php y reintenta UNA vez en
// automático: nunca hace falta recargar la página.
function tokenCsrfActual() {
    return document.querySelector('meta[name="csrf-token"]')?.content || "";
}

async function renovarTokenCsrf() {
    try {
        const respuesta = await fetch("api/csrf.php", { headers: { "Accept": "application/json" } });
        const datos = await respuesta.json();
        if (respuesta.ok && datos.ok && datos.csrf) {
            let meta = document.querySelector('meta[name="csrf-token"]');
            if (!meta) {
                meta = document.createElement("meta");
                meta.name = "csrf-token";
                document.head.appendChild(meta);
            }
            meta.content = datos.csrf;
        }
    } catch (error) {
        // Sin renovación se reintenta con el token que ya se tenía.
    }
    return tokenCsrfActual();
}

function falloDeCsrf(respuesta, datos) {
    return respuesta.status === 403 || /CSRF/i.test((datos && datos.mensaje) || "");
}

// POST central de la cuenta: adjunta el token y lo renueva si el servidor
// lo rechaza, reintentando la operación una sola vez antes de avisar.
async function enviarCuenta(cuerpo, elementoMensaje, mensajeRed) {
    let token = tokenCsrfActual();
    if (!token) {
        token = await renovarTokenCsrf();
    }

    for (let intento = 0; intento < 2; intento++) {
        let respuesta;
        let datos;
        try {
            respuesta = await fetch("api/cuenta.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.assign({ csrf: token }, cuerpo))
            });
            datos = await respuesta.json();
        } catch (error) {
            mostrarMensaje(elementoMensaje, mensajeRed, "error");
            return null;
        }

        if (datos.ok) {
            return datos;
        }

        if (intento === 0 && falloDeCsrf(respuesta, datos)) {
            // Token vencido o sesión nueva: se renueva y se reintenta solo.
            token = await renovarTokenCsrf();
            continue;
        }

        mostrarMensaje(elementoMensaje, datos.mensaje || "No se pudo completar la operación.", "error");
        return null;
    }

    return null;
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
    enlace.className = "boton-secundario boton-brillante";
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

function mostrarPedidos(pedidos) {
    const lista = Array.isArray(pedidos) ? pedidos : [];

    totalPedidosEl.textContent = String(lista.length);

    if (!lista.length) {
        listaPedidosEl.replaceChildren(crearPedidoVacio());
        return;
    }

    listaPedidosEl.replaceChildren(
        ...lista.map(function (pedido) {
            return crearTarjetaPedido(pedido);
        })
    );
}

async function cargarCuenta() {
    // La sesión vive en el servidor; el núcleo la conoce vía bootstrap.php.
    const actual = window.Tienda ? Tienda.sesion() : null;

    if (!actual) {
        mostrarPanelSesion();
        return;
    }

    let datos;
    try {
        const respuesta = await fetch("api/cuenta.php", { headers: { "Accept": "application/json" } });
        datos = await respuesta.json();
    } catch (error) {
        mostrarPanelSesion("No se pudo conectar con el servidor. Verifica que XAMPP esté corriendo.");
        return;
    }

    if (!datos.ok) {
        mostrarPanelSesion(datos.mensaje || "Tu cuenta ya no está disponible. Inicia sesión de nuevo.");
        return;
    }

    usuarioActual = Object.assign({}, datos.perfil, {
        correo: datos.perfil.email,
        tarjetaGuardada: obtenerTarjeta(datos.perfil.email)
    });

    nombreEl.value = usuarioActual.nombre || "";
    correoEl.value = usuarioActual.correo || "";
    direccionEl.value = usuarioActual.direccion || "";
    telefonoEl.value = usuarioActual.telefono || "";
    rfcEl.value = usuarioActual.rfc || "";
    perfilCorreoEl.textContent = usuarioActual.correo || "";

    marcarMetodoPago(usuarioActual.metodoPago);
    mostrarTarjetaGuardada(usuarioActual);
    actualizarEncabezado(usuarioActual.nombre || "");
    mostrarPedidos(datos.pedidos);

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

// Información personal: se guarda en la base de datos vía api/cuenta.php.
formularioDatosEl.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    mostrarMensaje(mensajeDatosEl, "", "");

    const nombre = nombreEl.value.trim();
    const correo = correoEl.value.trim();
    const direccion = direccionEl.value.trim();
    const telefono = telefonoEl.value.trim();
    const rfc = rfcEl.value.trim().toUpperCase();

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

    let resultado = await enviarCuenta({
        accion: "datos",
        nombre: nombre,
        email: correo,
        direccion: direccion,
        telefono: telefono,
        rfc: rfc
    }, mensajeDatosEl, "No se pudo conectar con el servidor.");

    if (!resultado) {
        return;
    }

    // El correo puede haber cambiado: la vista se refresca con los datos nuevos.
    usuarioActual.correo = correo;
    usuarioActual.nombre = nombre;
    perfilCorreoEl.textContent = correo;
    actualizarEncabezado(nombre);
    // Doble confirmación: texto verde junto al formulario + toast elegante.
    mostrarMensaje(mensajeDatosEl, resultado.mensaje || "Tus datos se guardaron correctamente.", "exito");
    if (window.Notificaciones) {
        Notificaciones.avisoTexto(resultado.mensaje || "Tus datos se guardaron correctamente.");
    }
});

// Seguridad: el cambio de contraseña se valida y hashea en el servidor.
formularioSeguridadEl.addEventListener("submit", async function (evento) {
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

    let resultado = await enviarCuenta({
        accion: "clave",
        actual: claveActual,
        nueva: claveNueva
    }, mensajeSeguridadEl, "No se pudo conectar con el servidor.");

    if (!resultado) {
        return;
    }

    claveActualEl.value = "";
    claveNuevaEl.value = "";
    claveConfirmarEl.value = "";
    // Por seguridad, si las contraseñas se estaban mostrando se vuelven a ocultar.
    ocultarClaves();
    // Doble confirmación: texto verde junto al formulario + toast elegante.
    mostrarMensaje(mensajeSeguridadEl, resultado.mensaje || "Tu contraseña se actualizó correctamente.", "exito");
    if (window.Notificaciones) {
        Notificaciones.avisoTexto(resultado.mensaje || "Tu contraseña se actualizó correctamente.");
    }
});

// Accesibilidad: un solo botón muestra u oculta las tres contraseñas del
// apartado de seguridad, para que no haya que memorizarlas a ciegas.
const camposClave = [claveActualEl, claveNuevaEl, claveConfirmarEl];

function ocultarClaves() {
    camposClave.forEach(function (campo) {
        campo.type = "password";
    });
    alternarClavesEl.setAttribute("aria-pressed", "false");
    textoAlternarClavesEl.textContent = "Mostrar contraseñas";
}

alternarClavesEl.addEventListener("click", function () {
    const visible = alternarClavesEl.getAttribute("aria-pressed") !== "true";

    camposClave.forEach(function (campo) {
        campo.type = visible ? "text" : "password";
    });
    alternarClavesEl.setAttribute("aria-pressed", String(visible));
    textoAlternarClavesEl.textContent = visible ? "Ocultar contraseñas" : "Mostrar contraseñas";
});

// Métodos de pago: la preferencia vive en la base de datos.
formularioPagoEl.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    mostrarMensaje(mensajePagoEl, "", "");

    const metodoSeleccionado = metodosPagoCuenta.find(function (radio) {
        return radio.checked;
    });
    const metodoPago = metodoSeleccionado
        ? normalizarMetodo(metodoSeleccionado.value)
        : "";

    let resultado = await enviarCuenta({
        accion: "metodo",
        metodo: metodoPago
    }, mensajePagoEl, "No se pudo conectar con el servidor.");

    if (!resultado) {
        return;
    }

    actualizarEstadoPago(metodoPago);
    if (perfilMetodoEl) {
        perfilMetodoEl.textContent = metodoPago ? ETIQUETAS_METODO[metodoPago] : "Sin definir";
    }
    // Doble confirmación: texto verde junto al formulario + toast elegante.
    mostrarMensaje(mensajePagoEl, "Tu método de pago se guardó correctamente.", "exito");
    if (window.Notificaciones) {
        Notificaciones.avisoTexto("Tu método de pago se guardó correctamente.");
    }
});

quitarTarjetaEl.addEventListener("click", function () {
    if (!usuarioActual) {
        return;
    }

    borrarTarjeta(usuarioActual.correo);
    usuarioActual.tarjetaGuardada = null;
    mostrarTarjetaGuardada(usuarioActual);
    // Doble confirmación: texto verde junto al formulario + toast elegante.
    mostrarMensaje(mensajePagoEl, "Quitamos la tarjeta guardada de tu cuenta.", "exito");
    if (window.Notificaciones) {
        Notificaciones.avisoTexto("Quitamos la tarjeta guardada de tu cuenta.");
    }
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
    // Cierra la sesión en el servidor y limpia las huellas locales.
    if (window.Tienda) {
        Tienda.cerrarSesion();
    }
    window.location.href = "index.html";
});

cargarCuenta();
