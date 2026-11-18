/* =========================================================
   navegacion.js — Destinos internos de Computlalte
   ---------------------------------------------------------
   Varias páginas guardan en localStorage ("redirigirTrasLogin")
   a dónde volver después de iniciar sesión o crear una cuenta.
   Antes cada script interpretaba ese valor a su manera y uno de
   ellos mandaba al navegador a "cuenta" a secas (sin .html),
   lo que provoca un error de "la URL no está en este servidor".

   Aquí vive la ÚNICA lista de páginas válidas del sitio y la
   función que convierte cualquier formato aceptado (clave corta
   como "cuenta" o archivo como "cuenta.html") en una URL real.
   Un valor corrupto o desconocido nunca llega al navegador:
   la función devuelve null y cada página usa su respaldo.

   API:
     Navegacion.destino(valor)      → "cuenta.html" o null
     Navegacion.ir(valor, respaldo) → navega ya resuelto
   ========================================================= */
(function () {
    "use strict";

    // Las únicas páginas a las que se puede redirigir al usuario.
    const PAGINAS = {
        "index": "index.html",
        "inicio": "index.html",
        "accesorios": "accesorios.html",
        "ofertas": "ofertas.html",
        "login": "login.html",
        "registro": "registro.html",
        "cuenta": "cuenta.html",
        "carrito": "carrito.html",
        "pago": "pago.html",
        "panel": "panel.html"
    };

    const ARCHIVOS = Object.keys(PAGINAS).map(function (clave) {
        return PAGINAS[clave];
    });

    // Convierte un destino guardado en un archivo real del sitio.
    // Acepta la clave corta ("cuenta"), el archivo ("cuenta.html")
    // y hasta un ancla ("cuenta.html#pedidos"). Devuelve null si el
    // valor no corresponde a ninguna página conocida.
    function destino(valor) {
        if (typeof valor !== "string") {
            return null;
        }

        const limpio = valor.trim().toLowerCase();
        if (!limpio) {
            return null;
        }

        // Separa un posible ancla para validar solo el archivo.
        const partes = limpio.split("#");
        const archivo = partes[0];
        const ancla = partes.length > 1 ? "#" + partes.slice(1).join("#") : "";

        let resuelto = null;
        if (Object.prototype.hasOwnProperty.call(PAGINAS, archivo)) {
            resuelto = PAGINAS[archivo];
        } else if (ARCHIVOS.indexOf(archivo) !== -1) {
            resuelto = archivo;
        }

        return resuelto ? resuelto + ancla : null;
    }

    // Navega de inmediato al destino resuelto; si el valor no sirve,
    // cae al respaldo (index.html por defecto) en vez de romper la página.
    function ir(valor, respaldo) {
        window.location.href = destino(valor) || respaldo || "index.html";
    }

    window.Navegacion = { PAGINAS: PAGINAS, destino: destino, ir: ir };
})();
