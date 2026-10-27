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

formularioEl.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const correo = correoEl.value.trim();
    const clave = claveEl.value;

    if (correo === "" || clave === "") {
        mensajeEl.textContent = "Escribe tu correo y tu contraseña.";
        return;
    }

    if (!correoEl.checkValidity()) {
        mensajeEl.textContent = "Escribe un correo válido.";
        return;
    }

    mensajeEl.textContent = "";

    const CLAVE_USUARIOS = "usuarios";
    let usuarios = [];

    try {
        const guardados = localStorage.getItem(CLAVE_USUARIOS);
        if (guardados) {
            usuarios = JSON.parse(guardados);
        }
    } catch (error) {
        usuarios = [];
    }

    const usuarioEncontrado = usuarios.find((usuario) => usuario.correo.toLowerCase() === correo.toLowerCase());

    if (!usuarioEncontrado) {
        mensajeEl.textContent = "No hay una cuenta registrada con ese correo.";
        return;
    }

    if (usuarioEncontrado.clave !== clave) {
        mensajeEl.textContent = "Contraseña incorrecta.";
        return;
    }

    localStorage.setItem("sesionIniciada", "true");
    localStorage.setItem("usuario", usuarioEncontrado.correo);
    localStorage.setItem("usuarioNombre", usuarioEncontrado.nombre);

    const redirigir = localStorage.getItem("redirigirTrasLogin");
    localStorage.removeItem("redirigirTrasLogin");

    const paginasDestino = {
        carrito: "carrito.html",
        cuenta: "cuenta.html"
    };

    if (redirigir && redirigir in paginasDestino) {
        window.location.href = paginasDestino[redirigir];
        return;
    }

    window.location.href = "index.html";
});
