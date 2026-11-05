(() => {
    const botonesCarrito = document.querySelectorAll(".boton-carrito");
    if (!botonesCarrito.length) return;

    function actualizarIndicador() {
        let cantidad = 0;

        try {
            const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
            if (Array.isArray(carrito)) {
                cantidad = carrito.reduce((total, producto) => {
                    const unidades = Number(producto.cantidad ?? 1);
                    return total + (Number.isFinite(unidades) ? Math.max(0, unidades) : 0);
                }, 0);
            }
        } catch (error) {
            cantidad = 0;
        }

        botonesCarrito.forEach((boton) => {
            const indicador = boton.querySelector(".indicador-carrito");
            if (!indicador) return;

            indicador.textContent = cantidad > 99 ? "99+" : String(cantidad);
            indicador.hidden = cantidad === 0;
            boton.setAttribute(
                "aria-label",
                cantidad === 0
                    ? "Carrito de compras, vacío"
                    : `Carrito de compras, ${cantidad} artículo${cantidad === 1 ? "" : "s"}`
            );
        });
    }

    actualizarIndicador();
    window.addEventListener("carrito-actualizado", actualizarIndicador);
    window.addEventListener("storage", (evento) => {
        if (evento.key === "carrito") actualizarIndicador();
    });
})();