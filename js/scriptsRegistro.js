const formularioEl = document.getElementById("formulario");
const nombreEl     = document.getElementById("nombre");
const correoEl     = document.getElementById("correo");
const direccionEl  = document.getElementById("direccion");
const claveEl      = document.getElementById("clave");
const clave2El     = document.getElementById("clave2");
const mensajeEl    = document.getElementById("mensaje");
const verClaveEl   = document.getElementById("ver-clave");

// Muestra u oculta las dos contraseñas a la vez
verClaveEl.addEventListener("click", function () {
    const estaOculta = claveEl.type === "password";
    const nuevoTipo = estaOculta ? "text" : "password";
    claveEl.type = nuevoTipo;
    clave2El.type = nuevoTipo;
    verClaveEl.textContent = estaOculta ? "Ocultar" : "Mostrar";
});

// Muestra el error y manda el cursor al campo que hay que corregir
function mostrarError(texto, campo) {
    mensajeEl.textContent = texto;
    campo.focus();
}

formularioEl.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = nombreEl.value.trim();
    const correo = correoEl.value.trim();
    const direccion = direccionEl.value.trim();
    const clave = claveEl.value;
    const clave2 = clave2El.value;

    if (nombre === "") {
        mostrarError("Escribe tu nombre.", nombreEl);
        return;
    }

    if (correo === "" || !correoEl.checkValidity()) {
        mostrarError("Escribe un correo válido.", correoEl);
        return;
    }

    if (direccion === "") {
        mostrarError("Escribe tu dirección.", direccionEl);
        return;
    }

    if (clave.length < 8) {
        mostrarError("La contraseña debe tener al menos 8 caracteres.", claveEl);
        return;
    }

    if (clave !== clave2) {
        mostrarError("Las contraseñas no coinciden.", clave2El);
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

    const existe = usuarios.some((usuario) => usuario.correo.toLowerCase() === correo.toLowerCase());

    if (existe) {
        mostrarError("Este correo ya está registrado.", correoEl);
        return;
    }

    usuarios.push({
        nombre: nombre,
        correo: correo,
        direccion: direccion,
        clave: clave
    });

    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    alert("Cuenta registrada con éxito. Ahora puedes iniciar sesión.");
    window.location.href = "Login.html";
});
