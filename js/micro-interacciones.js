/* =========================================================
   micro-interacciones.js
   ---------------------------------------------------------
   Revelado al hacer scroll con IntersectionObserver: las
   tarjetas de productos suben suavemente cuando entran en
   pantalla. Sin JavaScript el efecto no existe (las clases
   las coloca este archivo), así que el catálogo siempre es
   visible aunque el guion falle: es una mejora progresiva.
   ========================================================= */
(function () {
    "use strict";

    // Quien pide menos movimiento ve todo directamente visible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    // Rejillas que el catálogo vuelve a dibujar al filtrar u ordenar.
    const SELECTORES_REJILLA = [
        "#rejilla-computadoras",
        "#rejilla-accesorios",
        "#rejilla-ofertas"
    ];

    // Elementos fijos marcados en el HTML con data-revelar.
    const SELECTOR_SECCIONES = "[data-revelar]";

    // Memoria de elementos ya preparados: evita re-ocultar una tarjeta
    // que ya se reveló cuando el observador de mutaciones vuelve a
    // disparar antes de que termine su limpieza.
    const yaPreparados = new WeakSet();

    const observador = new IntersectionObserver((entradas) => {
        // Los elementos que entran juntos llegan en el mismo lote:
        // ese lote se escalona para que suban en cascada.
        let indiceEnLote = 0;

        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) {
                return;
            }

            const elemento = entrada.target;
            observador.unobserve(elemento);

            // Cascada de 70 ms entre tarjeta y tarjeta, con tope para
            // que un muro de productos no tarde demasiado en aparecer.
            const retraso = Math.min(indiceEnLote * 70, 420);
            indiceEnLote += 1;

            elemento.style.setProperty("--retraso-revelado", `${retraso}ms`);
            elemento.classList.add("revelada");

            // Terminada la animación se retiran las clases: la tarjeta
            // recupera sus transiciones normales (el hover, por ejemplo).
            window.setTimeout(() => {
                elemento.classList.remove("revelar-scroll", "revelada");
                elemento.style.removeProperty("--retraso-revelado");
            }, retraso + 800);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -36px 0px"
    });

    // Oculta un elemento y lo pone bajo vigilancia del observador.
    function vigilar(elemento) {
        if (!elemento || yaPreparados.has(elemento)) {
            return;
        }

        yaPreparados.add(elemento);
        elemento.classList.add("revelar-scroll");
        observador.observe(elemento);
    }

    // En cada rejilla: las tarjetas actuales y las que aparezcan después.
    function montarRejilla(rejilla) {
        function revisar() {
            rejilla.querySelectorAll(".tarjeta-producto").forEach(vigilar);
        }

        revisar();

        // El catálogo se redibuja con cada filtro u orden; el observador
        // de mutaciones detecta las tarjetas nuevas sin tocar script.js.
        new MutationObserver(revisar).observe(rejilla, { childList: true });
    }

    function iniciar() {
        document.querySelectorAll(SELECTOR_SECCIONES).forEach(vigilar);

        SELECTORES_REJILLA.forEach((selector) => {
            const rejilla = document.querySelector(selector);
            if (rejilla) {
                montarRejilla(rejilla);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
