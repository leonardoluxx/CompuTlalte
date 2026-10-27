// El carrito se guarda con esta clave; la página de la tienda debe usar la misma
const CLAVE = "carrito";

// Mismo formato de moneda que usa la tienda, para que un precio se lea igual
// en la tarjeta del producto y en el carrito.
const formatoMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
});

const contenidoEl = document.getElementById("contenido");
const totalEl     = document.getElementById("total");
const pagarEl     = document.getElementById("pagar");

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

let carrito = obtenerCarrito();

function calcularTotal() {
    let total = 0;
    carrito.forEach(function (producto) {
        total += producto.precio * producto.cantidad;
    });
    return total;
}

function cambiarCantidad(indice, cambio) {
    carrito[indice].cantidad += cambio;

    if (carrito[indice].cantidad <= 0) {
        carrito.splice(indice, 1);
    }

    guardarCarrito();
    mostrarCarrito();
}

function eliminarProducto(indice) {
    carrito.splice(indice, 1);
    guardarCarrito();
    mostrarCarrito();
}

function crearBoton(texto, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.addEventListener("click", accion);
    return boton;
}

function mostrarCarrito() {
    contenidoEl.innerHTML = "";

    if (carrito.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "vacio";
        vacio.textContent = "Tu carrito está vacío.";
        contenidoEl.appendChild(vacio);
        totalEl.textContent = "Total: " + formatoMoneda.format(0);
        return;
    }

    carrito.forEach(function (producto, indice) {
        const fila = document.createElement("div");
        fila.className = "item";

        const imagen = document.createElement("img");
        imagen.className = "imagen-carrito";
        imagen.src = producto.imagen || "";
        imagen.alt = producto.nombre || "Producto";
        imagen.loading = "lazy";

        const info = document.createElement("span");
        info.className = "info";
        info.textContent = producto.nombre + " - " + formatoMoneda.format(producto.precio);

        const controles = document.createElement("div");
        controles.className = "controles";

        const cantidad = document.createElement("span");
        cantidad.className = "cantidad-num";
        cantidad.textContent = producto.cantidad;

        controles.appendChild(crearBoton("-", function () { cambiarCantidad(indice, -1); }));
        controles.appendChild(cantidad);
        controles.appendChild(crearBoton("+", function () { cambiarCantidad(indice, 1); }));
        controles.appendChild(crearBoton("Quitar", function () { eliminarProducto(indice); }));

        fila.appendChild(imagen);
        fila.appendChild(info);
        fila.appendChild(controles);
        contenidoEl.appendChild(fila);
    });

    totalEl.textContent = "Total: " + formatoMoneda.format(calcularTotal());
}

pagarEl.addEventListener("click", function () {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const sesionIniciada = localStorage.getItem("sesionIniciada") === "true";

    if (!sesionIniciada) {
        alert("Debes iniciar sesión para continuar con el pago.");
        localStorage.setItem("redirigirTrasLogin", "carrito");
        window.location.href = "login.html";
        return;
    }

    // Redirigir al formulario de datos bancarios para transferencia
    window.location.href = "pago.html";
});

mostrarCarrito();
