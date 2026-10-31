const formularioEl = document.getElementById("formulario");
const correoEl     = document.getElementById("correo");
const claveEl      = document.getElementById("clave");
const mensajeEl    = document.getElementById("mensaje");
const verClaveEl   = document.getElementById("ver-clave");

verClaveEl.addEventListener("click", function () {
    const estaOculta = claveEl.type === "password";
    claveEl.type = estaOculta ? "text" : "password";
    verClaveEl.textContent = estaOculta ? "Ocultar" : "Mostrar";
});

// Traduce el motivo del fallo a un mensaje claro para quien intenta entrar.
const MENSAJES_ERROR = {
    usuario: "No hay una cuenta con ese usuario o correo.",
    clave: "Contraseña incorrecta.",
    sesion: "El navegador no permitió guardar la sesión."
};

formularioEl.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const identificador = correoEl.value.trim();
    const clave = claveEl.value;

    if (identificador === "" || clave === "") {
        mensajeEl.textContent = "Escribe tu usuario y tu contraseña.";
        return;
    }

    if (!window.Tienda) {
        mensajeEl.textContent = "No se pudo cargar el sistema de cuentas. Recarga la página.";
        return;
    }

    mensajeEl.textContent = "";

    const resultado = window.Tienda.iniciarSesion(identificador, clave);

    if (!resultado.ok) {
        mensajeEl.textContent = MENSAJES_ERROR[resultado.motivo] || "No se pudo iniciar sesión.";
        claveEl.value = "";
        claveEl.focus();
        return;
    }

    let redirigir = null;

    try {
        redirigir = localStorage.getItem("redirigirTrasLogin");
        localStorage.removeItem("redirigirTrasLogin");
    } catch (error) {
        // Sin almacenamiento se entra igual a la página por defecto del rol.
    }

    const paginasDestino = {
        carrito: "carrito.html",
        cuenta: "cuenta.html",
        pago: "pago.html",
        panel: "panel.html"
    };

    if (redirigir && redirigir in paginasDestino) {
        window.location.href = paginasDestino[redirigir];
        return;
    }

    // Los perfiles con permisos entran directo al panel; el cliente, a la tienda.
    const esGestor = resultado.usuario.rol === "admin" || resultado.usuario.rol === "gerente";
    window.location.href = esGestor ? "panel.html" : "index.html";
});
