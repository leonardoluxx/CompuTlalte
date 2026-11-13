/* =========================================================
   notificaciones.js — Sistema de avisos de Computlalte
   ---------------------------------------------------------
   Dos formatos con los materiales del sitio (tokens.css):

   • Notificaciones.exito(titulo, texto, opciones) → tarjeta
     centrada para los momentos grandes (cuenta creada,
     compra confirmada...). Se cierra con su botón, con la
     tecla Escape o al hacer clic fuera.
   • Notificaciones.toast(...) → avisos rápidos apilados en
     la esquina inferior derecha, se van solos.

   API completa:
     Notificaciones.tarjeta({ tipo, titulo, texto,
                              textoBoton, alCerrar })
     Notificaciones.toast({ tipo, titulo, texto, duracion })
     Notificaciones.exito(titulo, texto, alCerrar)
     Notificaciones.error(titulo, texto, alCerrar)
     Notificaciones.aviso(texto)      → toast ámbar
     Notificaciones.avisoTexto(texto) → toast de éxito corto

   Tipos: exito | error | aviso | info. Mejora progresiva:
   si este archivo no carga, las páginas siguen mostrando
   sus mensajes en línea como siempre.
   ========================================================= */
(function () {
    "use strict";

    var DURACION_TOAST = 4500;
    var DURACION_SALIDA = 260;

    /* ------------------------------------------------- iconos */
    var ICONOS = {
        exito: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4 10-11" /></svg>',
        error: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3.4v.1" /></svg>',
        aviso: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 2.8 19.4h18.4L12 4Z" /><path d="M12 10v4.6m0 3v.1" /></svg>',
        info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8.4v.1" /></svg>'
    };

    var CIERRE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>';

    /* ------------------------------------------------ utilidades */
    function crear(tag, clase, texto) {
        var elemento = document.createElement(tag);
        if (clase) {
            elemento.className = clase;
        }
        if (texto !== undefined) {
            elemento.textContent = texto;
        }
        return elemento;
    }

    function iconoDe(tipo, clase) {
        var envoltura = document.createElement("span");
        envoltura.className = clase || "";
        envoltura.innerHTML = ICONOS[tipo] || ICONOS.info;
        var svg = envoltura.querySelector("svg");
        if (svg) {
            // setAttribute y no className: en SVG, className no es una
            // cadena en todos los navegadores.
            if (clase) {
                svg.setAttribute("class", clase);
            }
            svg.setAttribute("aria-hidden", "true");
        }
        return envoltura;
    }

    /* ------------------------------------------- tarjeta centrada */
    // Devuelve una función cerrar() para quien necesite cerrarla solo.
    function tarjeta(opciones) {
        var datos = opciones || {};
        var tipo = datos.tipo || "exito";

        // Solo una tarjeta a la vez: si hay una abierta se cierra primero.
        var abierta = document.querySelector(".aviso-velo");
        if (abierta) {
            cerrarVelo(abierta);
        }

        var elementoPrevio = document.activeElement;

        var velo = crear("div", "aviso-velo");
        velo.setAttribute("role", "dialog");
        velo.setAttribute("aria-modal", "true");

        var caja = crear("div", "aviso-tarjeta aviso-" + tipo);

        var titulo = crear("h2", "aviso-titulo", datos.titulo || "");
        var texto = crear("p", "aviso-texto", datos.texto || "");
        var acciones = crear("div", "aviso-acciones");
        var boton = crear("button", "aviso-boton", datos.textoBoton || "Entendido");
        boton.type = "button";
        acciones.append(boton);

        var insignia = crear("div", "aviso-insignia");
        insignia.append(iconoDe(tipo));

        caja.append(insignia, titulo, texto, acciones);
        velo.append(caja);

        var cerrada = false;

        function cerrar() {
            // Guardas: no re-disparar el cierre (doble clic rápido) ni
            // ejecutar alCerrar de una tarjeta que ya fue reemplazada.
            if (cerrada || !velo.isConnected) {
                return;
            }
            cerrada = true;

            cerrarVelo(velo);
            if (typeof datos.alCerrar === "function") {
                datos.alCerrar();
            }
        }

        boton.addEventListener("click", cerrar);
        velo.addEventListener("click", function (evento) {
            if (evento.target === velo) {
                cerrar();
            }
        });

        document.addEventListener("keydown", alPulsarTecla);

        function alPulsarTecla(evento) {
            // La guarda de isConnected ignora los Escape de una tarjeta que
            // ya se cerró programáticamente (p. ej. reemplazada por otra).
            if (evento.key === "Escape" && velo.isConnected) {
                evento.preventDefault();
                cerrar();
            }
        }

        // Si hay un diálogo abierto, el velo vive dentro de él para pintarse
        // en la capa superior (por encima del modal) y no detrás.
        var dialogoAbierto = dialogoSuperior();
        (dialogoAbierto || document.body).append(velo);
        document.body.style.overflow = "hidden";

        window.setTimeout(function () {
            boton.focus();
        }, 60);

        function cerrarVelo(velo) {
            if (!velo.isConnected) {
                return;
            }

            document.removeEventListener("keydown", alPulsarTecla);
            document.body.style.overflow = "";

            velo.classList.add("aviso-saliendo");
            window.setTimeout(function () {
                velo.remove();
            }, DURACION_SALIDA);

            if (elementoPrevio && typeof elementoPrevio.focus === "function") {
                try {
                    elementoPrevio.focus({ preventScroll: true });
                } catch (error) {
                    // El elemento original ya puede no existir.
                }
            }
        }

        // La función cerrarVelo se usa antes de declararse (hoisting de
        // function declarations dentro de la misma función) y también
        // queda disponible por si alguien cierra manualmente.
        return cerrar;
    }

    /* ------------------------------------------------------ toasts */
    // Los diálogos (showModal) viven en la capa superior del navegador:
    // ningún z-index del cuerpo puede verse por encima de ellos. Por eso,
    // mientras haya un diálogo abierto, el contenedor de avisos se crea
    // DENTRO de él: position:fixed sigue funcionando y el toast se pinta
    // encima del modal en vez de quedar enterrado detrás.
    function dialogoSuperior() {
        // Preferimos el modal de reseñas (se abre encima del de producto);
        // si no, el último diálogo abierto es el que está más arriba.
        var reseñas = document.querySelector(".modal-resenas[open]");
        if (reseñas) {
            return reseñas;
        }
        var abiertos = document.querySelectorAll("dialog[open]");
        return abiertos.length ? abiertos[abiertos.length - 1] : null;
    }

    function contenedorToasts() {
        var anfitrion = dialogoSuperior() || document.body;
        var contenedor = anfitrion.querySelector(":scope > .aviso-toasts");
        if (!contenedor) {
            contenedor = crear("div", "aviso-toasts");
            contenedor.setAttribute("aria-live", "polite");
            anfitrion.append(contenedor);
        }
        return contenedor;
    }

    function toast(opciones) {
        var datos = opciones || {};
        if (typeof datos === "string") {
            datos = { texto: datos };
        }

        var tipo = datos.tipo || "exito";
        var contenedor = contenedorToasts();

        var toastEl = crear("div", "aviso-toast aviso-" + tipo);
        toastEl.setAttribute("role", tipo === "error" ? "alert" : "status");

        var cuerpo = crear("div", "aviso-cuerpo-toast");

        if (datos.titulo) {
            cuerpo.append(crear("p", "aviso-titulo-toast", datos.titulo));
        }
        if (datos.texto) {
            cuerpo.append(crear("p", "aviso-texto-toast", datos.texto));
        }

        var cerrarBoton = crear("button", "aviso-cerrar-toast");
        cerrarBoton.type = "button";
        cerrarBoton.setAttribute("aria-label", "Cerrar aviso");
        cerrarBoton.innerHTML = CIERRE;

        toastEl.append(iconoDe(tipo, "aviso-icono-toast"), cuerpo, cerrarBoton);
        contenedor.append(toastEl);

        // Máximo 4 avisos a la vez: el más viejo sale con gracia.
        var enPantalla = contenedor.querySelectorAll(".aviso-toast:not(.aviso-saliendo)");
        if (enPantalla.length > 4) {
            quitar(enPantalla[0]);
        }

        function quitar(elemento) {
            if (!elemento || elemento.classList.contains("aviso-saliendo")) {
                return;
            }
            elemento.classList.add("aviso-saliendo");
            window.setTimeout(function () {
                elemento.remove();
            }, DURACION_SALIDA);
        }

        var temporizador = window.setTimeout(function () {
            quitar(toastEl);
        }, datos.duracion || DURACION_TOAST);

        // Al pasar el cursor el aviso espera; al salir, vuelve su cuenta.
        toastEl.addEventListener("mouseenter", function () {
            window.clearTimeout(temporizador);
        });
        toastEl.addEventListener("mouseleave", function () {
            temporizador = window.setTimeout(function () {
                quitar(toastEl);
            }, DURACION_TOAST / 2);
        });

        cerrarBoton.addEventListener("click", function () {
            window.clearTimeout(temporizador);
            quitar(toastEl);
        });

        return toastEl;
    }

    /* -------------------------------------------------------- API */
    window.Notificaciones = {
        tarjeta: tarjeta,
        toast: toast,

        // Tarjeta centrada de éxito (momentos grandes).
        exito: function (titulo, texto, alCerrar) {
            return tarjeta({ tipo: "exito", titulo: titulo, texto: texto, alCerrar: alCerrar });
        },

        // Tarjeta centrada de error (algo importante falló).
        error: function (titulo, texto, alCerrar) {
            return tarjeta({ tipo: "error", titulo: titulo, texto: texto, alCerrar: alCerrar });
        },

        // Toast rápido de éxito.
        avisoTexto: function (texto, titulo) {
            return toast({ tipo: "exito", texto: texto, titulo: titulo });
        },

        // Toast de precaución (faltan datos, sesión requerida...).
        aviso: function (texto, titulo) {
            return toast({ tipo: "aviso", texto: texto, titulo: titulo });
        },

        // Toast de error puntual.
        alerta: function (texto, titulo) {
            return toast({ tipo: "error", texto: texto, titulo: titulo });
        },

        // Toast neutro informativo.
        informacion: function (texto, titulo) {
            return toast({ tipo: "info", texto: texto, titulo: titulo });
        }
    };
})();
