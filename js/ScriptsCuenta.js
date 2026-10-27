// La cuenta se guarda junto con los usuarios del registro y del inicio de sesión.
const CLAVE_USUARIOS = "usuarios";

const panelSesionEl      = document.getElementById("panel-sesion");
const mensajeSesionEl    = document.getElementById("mensaje-sesion");
const formularioEl       = document.getElementById("formulario-cuenta");
const nombreEl           = document.getElementById("nombre");
const correoEl           = document.getElementById("correo");
const direccionEl        = document.getElementById("direccion");
const claveActualEl      = document.getElementById("clave-actual");
const claveNuevaEl       = document.getElementById("clave-nueva");
const claveConfirmarEl   = document.getElementById("clave-confirmar");
const mensajeEl          = document.getElementById("mensaje-cuenta");
const avatarEl           = document.getElementById("avatar-cuenta");
const descripcionEl      = document.getElementById("descripcion-cuenta");
const cerrarSesionEl     = document.getElementById("cerrar-sesion");
const enlaceLoginEl      = document.getElementById("enlace-login");
const enlaceRegistroEl   = document.getElementById("enlace-registro");

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

function mostrarMensaje(texto, tipo) {
    mensajeEl.textContent = texto;
    mensajeEl.className = "mensaje-cuenta" + (tipo ? " mensaje-" + tipo : "");
}

function actualizarEncabezado(nombre) {
    const nombreLimpio = nombre.trim();
    avatarEl.textContent = nombreLimpio.charAt(0).toUpperCase() || "?";

    if (nombreLimpio === "") {
        descripcionEl.textContent = "Consulta y actualiza tus datos personales.";
        return;
    }

    const primerNombre = nombreLimpio.split(" ")[0];
    descripcionEl.textContent = "Hola, " + primerNombre + ". Revisa y actualiza tus datos personales.";
}

// Muestra el aviso de inicio de sesión y recuerda a dónde volver tras entrar.
function mostrarPanelSesion(texto) {
    panelSesionEl.hidden = false;
    formularioEl.hidden = true;
    mensajeSesionEl.textContent = texto || "";
    actualizarEncabezado("");

    enlaceLoginEl.addEventListener("click", function () {
        localStorage.setItem("redirigirTrasLogin", "cuenta");
    });

    enlaceRegistroEl.addEventListener("click", function () {
        localStorage.setItem("redirigirTrasLogin", "cuenta");
    });
}

function cargarCuenta() {
    const sesionIniciada = localStorage.getItem("sesionIniciada") === "true";
    const correoSesion = localStorage.getItem("usuario");

    if (!sesionIniciada || !correoSesion) {
        mostrarPanelSesion();
        return;
    }

    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(function (registro) {
        return registro.correo.toLowerCase() === correoSesion.toLowerCase();
    });

    if (!usuario) {
        mostrarPanelSesion("Tu cuenta ya no está disponible. Inicia sesión de nuevo.");
        return;
    }

    nombreEl.value = usuario.nombre || "";
    correoEl.value = usuario.correo || "";
    direccionEl.value = usuario.direccion || "";

    actualizarEncabezado(usuario.nombre || "");
    panelSesionEl.hidden = true;
    formularioEl.hidden = false;
}

formularioEl.addEventListener("submit", function (evento) {
    evento.preventDefault();

    mostrarMensaje("", "");

    const nombre = nombreEl.value.trim();
    const correo = correoEl.value.trim();
    const direccion = direccionEl.value.trim();
    const claveActual = claveActualEl.value;
    const claveNueva = claveNuevaEl.value;
    const claveConfirmar = claveConfirmarEl.value;

    if (nombre === "") {
        mostrarMensaje("Escribe tu nombre completo.", "error");
        nombreEl.focus();
        return;
    }

    if (correo === "" || !correoEl.checkValidity()) {
        mostrarMensaje("Escribe un correo electrónico válido.", "error");
        correoEl.focus();
        return;
    }

    if (direccion === "") {
        mostrarMensaje("Escribe tu dirección de entrega.", "error");
        direccionEl.focus();
        return;
    }

    const usuarios = obtenerUsuarios();
    const correoSesion = localStorage.getItem("usuario") || "";
    const indice = usuarios.findIndex(function (registro) {
        return registro.correo.toLowerCase() === correoSesion.toLowerCase();
    });

    if (indice === -1) {
        mostrarPanelSesion("Tu sesión terminó. Inicia sesión de nuevo para continuar.");
        return;
    }

    const correoRepetido = usuarios.some(function (registro, posicion) {
        return posicion !== indice && registro.correo.toLowerCase() === correo.toLowerCase();
    });

    if (correoRepetido) {
        mostrarMensaje("Ya existe otra cuenta con ese correo electrónico.", "error");
        correoEl.focus();
        return;
    }

    const quiereCambiarClave = claveActual !== "" || claveNueva !== "" || claveConfirmar !== "";

    if (quiereCambiarClave) {
        if (claveActual === "") {
            mostrarMensaje("Escribe tu contraseña actual para cambiarla.", "error");
            claveActualEl.focus();
            return;
        }

        if (claveActual !== usuarios[indice].clave) {
            mostrarMensaje("La contraseña actual no es correcta.", "error");
            claveActualEl.focus();
            return;
        }

        if (claveNueva.length < 8) {
            mostrarMensaje("La nueva contraseña debe tener al menos 8 caracteres.", "error");
            claveNuevaEl.focus();
            return;
        }

        if (claveNueva !== claveConfirmar) {
            mostrarMensaje("Las contraseñas nuevas no coinciden.", "error");
            claveConfirmarEl.focus();
            return;
        }
    }

    usuarios[indice].nombre = nombre;
    usuarios[indice].correo = correo;
    usuarios[indice].direccion = direccion;

    if (quiereCambiarClave) {
        usuarios[indice].clave = claveNueva;
    }

    guardarUsuarios(usuarios);

    // Mantiene la sesión activa con los datos nuevos.
    localStorage.setItem("usuario", correo);
    localStorage.setItem("usuarioNombre", nombre);

    claveActualEl.value = "";
    claveNuevaEl.value = "";
    claveConfirmarEl.value = "";

    actualizarEncabezado(nombre);
    mostrarMensaje("Tus datos se actualizaron correctamente.", "exito");
});

cerrarSesionEl.addEventListener("click", function () {
    localStorage.removeItem("sesionIniciada");
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioNombre");
    localStorage.removeItem("redirigirTrasLogin");
    window.location.href = "index.html";
});

cargarCuenta();
