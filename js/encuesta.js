// encuesta.js — Encuesta de satisfacción del sitio.
// No aparece al entrar: se muestra cuando el visitante llega al final de la
// página (scroll hasta abajo) o justo después de completar una compra
// (la página de pago dispara el evento "encuesta:mostrar").
(function () {
    "use strict";

    // La encuesta solo vive en las páginas de exploración. En carrito, pago,
    // login, cuenta, panel y registro no se carga el script; esta guarda
    // protege además ante un <script> olvidado o una copia cacheada.
    const PAGINAS_CON_ENCUESTA = ["index.html", "accesorios.html", "ofertas.html"];
    const CLAVE_RESPONDIDA = "computlalte-encuesta-respondida";

    function paginaActual() {
        return window.location.pathname.split("/").pop() || "index.html";
    }

    function eliminarWidget() {
        const existente = document.querySelector("#encuesta-sitio");
        if (existente) {
            existente.remove();
        }
    }

    // Función principal de inicialización (expuesta globalmente)
    function inicializarEncuesta() {
        if (!PAGINAS_CON_ENCUESTA.includes(paginaActual())) {
            eliminarWidget();
            return;
        }

        // Respuesta recordada en este navegador: no se vuelve a preguntar ni se
        // deja el widget escondido en el DOM.
        let respondidaLocal = false;
        try {
            respondidaLocal = window.localStorage.getItem(CLAVE_RESPONDIDA) === "1";
        } catch (error) {
            // Si el navegador bloquea localStorage, decide el servidor.
        }

        if (respondidaLocal) {
            eliminarWidget();
            return;
        }

        // Si la página no trae el HTML del widget, se inyecta aquí.
        function inyectarWidget() {
            if (document.querySelector("#encuesta-sitio")) {
                return;
            }

            const contenedor = document.createElement("div");
            contenedor.className = "encuesta-sitio oculta";
            contenedor.id = "encuesta-sitio";
            contenedor.hidden = true;
            contenedor.setAttribute("role", "dialog");
            contenedor.setAttribute("aria-label", "Encuesta de satisfacción");
            contenedor.innerHTML =
                '<button class="encuesta-cerrar" id="encuesta-cerrar" type="button" aria-label="Cerrar encuesta">×</button>' +
                '<p class="encuesta-titulo">¿Cómo fue tu experiencia en Computlalte?</p>' +
                '<div class="encuesta-estrellas" id="encuesta-estrellas">' +
                '<button type="button" data-valor="1" aria-label="1 estrella">★</button>' +
                '<button type="button" data-valor="2" aria-label="2 estrellas">★</button>' +
                '<button type="button" data-valor="3" aria-label="3 estrellas">★</button>' +
                '<button type="button" data-valor="4" aria-label="4 estrellas">★</button>' +
                '<button type="button" data-valor="5" aria-label="5 estrellas">★</button>' +
                '</div>' +
                '<label class="encuesta-campo">' +
                '<span>¿Qué tan fácil te resultó comprar?</span>' +
                '<select id="encuesta-facilidad">' +
                '<option value="">Sin responder</option>' +
                '<option value="5">Muy fácil</option>' +
                '<option value="4">Fácil</option>' +
                '<option value="3">Normal</option>' +
                '<option value="2">Complicado</option>' +
                '<option value="1">Muy complicado</option>' +
                '</select></label>' +
                '<label class="encuesta-campo">' +
                '<span>¿Qué fue lo más difícil o qué mejorarías? (opcional)</span>' +
                '<textarea id="encuesta-comentario" rows="2" maxlength="400"></textarea>' +
                '</label>' +
                '<button class="encuesta-enviar boton-brillante" id="encuesta-enviar" type="button">Enviar</button>' +
                '<p class="encuesta-gracias" id="encuesta-gracias" hidden>¡Gracias por tu feedback!</p>';

            document.body.appendChild(contenedor);
        }

        inyectarWidget();

        const tarjeta = document.querySelector("#encuesta-sitio");
        if (!tarjeta) {
            return;
        }

        const contenedorEstrellas = tarjeta.querySelector("#encuesta-estrellas");
        const estrellas = Array.from(tarjeta.querySelectorAll("#encuesta-estrellas button"));
        const selectorFacilidad = tarjeta.querySelector("#encuesta-facilidad");
        const campoComentario = tarjeta.querySelector("#encuesta-comentario");
        const botonEnviar = tarjeta.querySelector("#encuesta-enviar");
        const mensajeGracias = tarjeta.querySelector("#encuesta-gracias");
        const botonCerrar = tarjeta.querySelector("#encuesta-cerrar");

        let valor = 0;
        let estado = "oculta"; // oculta | visible | cerrada
        let yaRespondio = false;
        let estadoComprobado = false;
        let mostrarPendiente = false;

        // Deja constancia en el navegador: ni recargando ni navegando a otra de
        // las tres páginas vuelve a aparecer la encuesta.
        function recordarRespuesta() {
            yaRespondio = true;
            estado = "cerrada";
            try {
                window.localStorage.setItem(CLAVE_RESPONDIDA, "1");
            } catch (error) {
                // Sin almacenamiento, la cookie y la base de datos siguen mandando.
            }
        }

        // Oculta por completo al inicio, sin depender del CSS.
        tarjeta.hidden = true;
        tarjeta.classList.add("oculta");

        function mostrar() {
            // Encuesta inteligente: si este visitante ya respondió alguna vez
            // (cuenta en la base de datos o cookie del navegador), no se vuelve
            // a preguntar. Tampoco se muestra hasta que el servidor confirmó
            // el estado, para no parpadear y desaparecer en cuentas que ya
            // respondieron desde otro navegador.
            if (yaRespondio || estado !== "oculta") {
                return;
            }
            if (!estadoComprobado) {
                mostrarPendiente = true;
                return;
            }
            estado = "visible";
            tarjeta.hidden = false;
            // Se quita la clase en el siguiente cuadro para que la transición anime.
            window.requestAnimationFrame(function () {
                tarjeta.classList.remove("oculta");
            });
        }

        function ocultar() {
            estado = "cerrada";
            tarjeta.classList.add("oculta");
            window.setTimeout(function () {
                tarjeta.hidden = true;
            }, 320);
        }

        // --------------------------------------------------- chispas 5 estrellas
        function lanzarChispas() {
            if (!contenedorEstrellas) {
                return;
            }
            contenedorEstrellas.classList.remove("destello");
            void contenedorEstrellas.offsetWidth;
            contenedorEstrellas.classList.add("destello");

            const colores = ["#ffe066", "#f0c040", "#fff4c2"];
            for (let i = 0; i < 12; i += 1) {
                const chispa = document.createElement("span");
                chispa.className = "chispa";
                const angulo = (Math.PI * 2 * i) / 12;
                const distancia = 18 + Math.random() * 22;
                chispa.style.setProperty("--dx", (Math.cos(angulo) * distancia).toFixed(1) + "px");
                chispa.style.setProperty("--dy", (Math.sin(angulo) * distancia - 10).toFixed(1) + "px");
                chispa.style.left = "50%";
                chispa.style.top = "50%";
                chispa.style.background = colores[i % colores.length];
                chispa.style.animationDelay = (Math.random() * 0.08).toFixed(2) + "s";
                contenedorEstrellas.appendChild(chispa);
                window.setTimeout(function () {
                    chispa.remove();
                }, 1000);
            }

            window.setTimeout(function () {
                contenedorEstrellas.classList.remove("destello");
            }, 900);
        }

        function pintarEstrellas(n) {
            estrellas.forEach(function (boton) {
                boton.classList.toggle("activo", Number(boton.dataset.valor) <= n);
            });
        }

        estrellas.forEach(function (boton) {
            boton.addEventListener("mouseenter", function () {
                pintarEstrellas(Number(boton.dataset.valor));
            });
            boton.addEventListener("click", function () {
                valor = Number(boton.dataset.valor);
                pintarEstrellas(valor);
                if (valor === 5) {
                    lanzarChispas();
                }
            });
        });

        if (contenedorEstrellas) {
            contenedorEstrellas.addEventListener("mouseleave", function () {
                pintarEstrellas(valor);
            });
        }

        if (botonCerrar) {
            botonCerrar.addEventListener("click", ocultar);
        }

        // ------------------------------------------------------------ envío
        // El token vive en un <meta> que inyecta bootstrap.php. En páginas sin
        // bootstrap (login, registro) se pide a la API antes de enviar.
        async function tokenCsrf() {
            const meta = document.querySelector('meta[name="csrf-token"]');
            if (meta && meta.content) {
                return meta.content;
            }

            try {
                const respuesta = await fetch("api/csrf.php", {
                    headers: { "Accept": "application/json" }
                });
                const datos = await respuesta.json();
                if (respuesta.ok && datos.ok && datos.csrf) {
                    const nueva = document.createElement("meta");
                    nueva.name = "csrf-token";
                    nueva.content = datos.csrf;
                    document.head.appendChild(nueva);
                    return datos.csrf;
                }
            } catch (error) {
                // Sin token el servidor responderá 403 y se conserva el aviso.
            }

            return "";
        }

        if (botonEnviar) {
            botonEnviar.addEventListener("click", async function () {
                if (valor < 1) {
                    if (window.Notificaciones) {
                        Notificaciones.aviso("Elige de 1 a 5 estrellas.", "Encuesta");
                    }
                    return;
                }

                botonEnviar.disabled = true;
                try {
                    // La facilidad y el comentario son opcionales: el servidor
                    // guarda lo que llegue (la facilidad 0 se guarda como vacía).
                    const token = await tokenCsrf();
                    const cuerpo = { calificacion: valor, csrf: token };
                    if (selectorFacilidad && selectorFacilidad.value) {
                        cuerpo.facilidad = Number(selectorFacilidad.value);
                    }
                    if (campoComentario && campoComentario.value.trim()) {
                        cuerpo.comentario = campoComentario.value.trim();
                    }

                    const respuesta = await fetch("api/encuesta.php", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": token
                        },
                        body: JSON.stringify(cuerpo)
                    });
                    const datos = await respuesta.json();
                    if (!respuesta.ok || !datos.ok) {
                        throw new Error(datos.mensaje || "No se pudo enviar la encuesta.");
                    }
                    if (selectorFacilidad) selectorFacilidad.disabled = true;
                    if (campoComentario) campoComentario.disabled = true;
                    // Respondió: se recuerda en localStorage y el widget se
                    // retira del DOM tras mostrar el agradecimiento.
                    recordarRespuesta();
                    if (mensajeGracias) {
                        mensajeGracias.hidden = false;
                    }
                    window.setTimeout(function () {
                        ocultar();
                        eliminarWidget();
                    }, 1400);
                } catch (error) {
                    botonEnviar.disabled = false;
                    if (window.Notificaciones) {
                        Notificaciones.alerta(error.message, "No se pudo enviar");
                    }
                }
            });
        }

        // ------------------------------------------- cuándo se hace visible
        // Solo se evalúa cuando el usuario realmente hace scroll.
        function alHacerScroll() {
            if (estado !== "oculta") {
                return;
            }
            const recorrido = window.scrollY || document.documentElement.scrollTop || 0;
            if (recorrido < 120) {
                return;
            }
            const alturaTotal = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            const bordeInferior = recorrido + window.innerHeight;
            if (bordeInferior >= alturaTotal - 350) {
                mostrar();
            }
        }

        window.addEventListener("scroll", alHacerScroll, { passive: true });

        // La página de pago lo dispara al confirmar una compra.
        document.addEventListener("encuesta:mostrar", mostrar);

        // Comprueba al cargar si este visitante ya respondió alguna vez:
        // con cuenta se consulta la base de datos; sin cuenta, la cookie.
        (async function comprobarEstado() {
            try {
                const respuesta = await fetch("api/encuesta.php?accion=estado", {
                    headers: { "Accept": "application/json" }
                });
                const datos = await respuesta.json();
                if (datos && datos.ok && datos.respondida) {
                    recordarRespuesta();
                    tarjeta.hidden = true;
                    eliminarWidget();
                }
            } catch (error) {
                // Sin respuesta del servidor se conserva el comportamiento de
                // siempre: la encuesta se ofrece al llegar al final.
            } finally {
                estadoComprobado = true;
                if (mostrarPendiente && !yaRespondio) {
                    mostrarPendiente = false;
                    alHacerScroll();
                }
            }
        })();
    } // fin de inicializarEncuesta

    // Exponer globalmente para uso desde otras páginas
    window.inicializarEncuesta = inicializarEncuesta;

    // Auto-ejecutar al cargar
    inicializarEncuesta();
})();