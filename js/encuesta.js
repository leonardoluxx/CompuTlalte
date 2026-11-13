// encuesta.js — Encuesta de satisfacción del sitio.
// No aparece al entrar: se muestra cuando el visitante llega al final de la
// página (scroll hasta abajo) o justo después de completar una compra
// (la página de pago dispara el evento "encuesta:mostrar").
(function () {
    "use strict";

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

    // Oculta por completo al inicio, sin depender del CSS.
    tarjeta.hidden = true;
    tarjeta.classList.add("oculta");

    function mostrar() {
        // Encuesta inteligente: si este visitante ya respondió alguna vez
        // (cuenta en la base de datos o cookie del navegador), no se vuelve
        // a preguntar.
        if (yaRespondio || estado !== "oculta") {
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
    function tokenCsrf() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : "";
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
                const cuerpo = { calificacion: valor, csrf: tokenCsrf() };
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
                        "X-CSRF-Token": tokenCsrf()
                    },
                    body: JSON.stringify(cuerpo)
                });
                const datos = await respuesta.json();
                if (!respuesta.ok || !datos.ok) {
                    throw new Error(datos.mensaje || "No se pudo enviar la encuesta.");
                }
                if (selectorFacilidad) selectorFacilidad.disabled = true;
                if (campoComentario) campoComentario.disabled = true;
                // Respondió: a partir de ahora la encuesta no vuelve a
                // mostrarse en esta sesión (el servidor ya dejó la cookie).
                yaRespondio = true;
                estado = "cerrada";
                if (mensajeGracias) {
                    mensajeGracias.hidden = false;
                }
                window.setTimeout(ocultar, 1400);
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
                yaRespondio = true;
                estado = "cerrada";
                tarjeta.hidden = true;
            }
        } catch (error) {
            // Sin respuesta del servidor se conserva el comportamiento de
            // siempre: la encuesta se ofrece al llegar al final.
        }
    })();
})();
