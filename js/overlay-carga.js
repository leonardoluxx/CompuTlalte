// overlay-carga.js — Capa de carga reutilizable en todo el sitio.
// Uso:
//   OverlayCarga.mostrar("Procesando pago…");
//   OverlayCarga.ocultar();
// No bloquea la navegación: si algo falla, se oculta y la página sigue viva.
(function () {
    "use strict";

    let capa = null;
    let textoEl = null;

    function construir() {
        capa = document.createElement("div");
        capa.className = "overlay-carga";
        capa.id = "overlay-carga";
        capa.hidden = true;
        capa.setAttribute("role", "status");
        capa.setAttribute("aria-live", "polite");
        capa.setAttribute("aria-label", "Procesando");

        const caja = document.createElement("div");
        caja.className = "overlay-carga-caja";

        const spinner = document.createElement("span");
        spinner.className = "overlay-carga-spinner";
        spinner.setAttribute("aria-hidden", "true");

        textoEl = document.createElement("p");
        textoEl.className = "overlay-carga-texto";
        textoEl.textContent = "Procesando…";

        const ayuda = document.createElement("p");
        ayuda.className = "overlay-carga-ayuda";
        ayuda.textContent = "Espera un momento, no cierres la página.";

        caja.append(spinner, textoEl, ayuda);
        capa.append(caja);
        document.body.append(capa);
    }

    function mostrar(texto) {
        if (!capa) {
            construir();
        }

        if (texto) {
            textoEl.textContent = texto;
        }

        capa.hidden = false;
        // Se quita el bloqueo de scroll solo al ocultar: la capa lo frena
        // mientras está visible para que el fondo no se mueva.
        document.documentElement.classList.add("overlay-carga-activo");
    }

    function ocultar() {
        if (!capa) {
            return;
        }

        capa.hidden = true;
        document.documentElement.classList.remove("overlay-carga-activo");
    }

    window.OverlayCarga = {
        mostrar: mostrar,
        ocultar: ocultar,
        activo: function () {
            return Boolean(capa && !capa.hidden);
        }
    };
})();
