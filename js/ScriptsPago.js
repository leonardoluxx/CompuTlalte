const CLAVE_CARRITO = "carrito";
const formularioPagoEl = document.getElementById("formulario-pago");
const titularEl = document.getElementById("titular");
const bancoEl = document.getElementById("banco");
const referenciaEl = document.getElementById("referencia");
const fechaEl = document.getElementById("fecha");
const mensajeEl = document.getElementById("mensaje");
const montoEl = document.getElementById("monto");

function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
    } catch (error) {
        return [];
    }
}

function calcularTotal(carrito) {
    let total = 0;
    carrito.forEach(function (producto) {
        total += producto.precio * producto.cantidad;
    });
    return total;
}

function mostrarMonto() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        montoEl.textContent = "Tu carrito está vacío.";
        formularioPagoEl.querySelector("#confirmar").disabled = true;
        formularioPagoEl.querySelector("#confirmar").style.opacity = "0.5";
        return;
    }
    montoEl.textContent = "Total a pagar: $" + calcularTotal(carrito) + " MXN";
}

formularioPagoEl.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        mensajeEl.textContent = "Tu carrito está vacío.";
        return;
    }

    const titular = titularEl.value.trim();
    const banco = bancoEl.value.trim();
    const referencia = referenciaEl.value.trim();
    const fecha = fechaEl.value;

    if (titular === "" || banco === "" || referencia === "" || fecha === "") {
        mensajeEl.textContent = "Completa todos los campos para confirmar tu transferencia.";
        return;
    }

    mensajeEl.textContent = "";

    localStorage.removeItem(CLAVE_CARRITO);
    alert("Pago en revisión. Gracias por tu compra, te avisaremos cuando confirmemos tu transferencia.");
    window.location.href = "index.html";
});

mostrarMonto();
