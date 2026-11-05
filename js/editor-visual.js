/* =========================================================
   editor-visual.js — Lápices de edición visual (solo administrador)
   ---------------------------------------------------------
   Si la sesión abierta es de administrador, esta pieza inyecta un
   botón flotante con forma de lápiz en la esquina inferior derecha
   de cada imagen principal del sitio (portada, Computadoras,
   Accesorios y Ofertas). Al pulsarlo se abre un modal elegante para
   subir una nueva imagen: se guarda en imagenes/anuncios, se registra
   en la tabla configuracion y la página la muestra al instante, sin
   recargar. Quien no sea admin no ve nada de esto.
   ========================================================= */
(function () {
    "use strict";

    // Solo el administrador tiene los lápices.
    const sesion = window.Tienda ? Tienda.sesion() : null;
    if (!sesion || sesion.rol !== "admin") {
        return;
    }

    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Objetivos por página: selector del contenedor, clave de la tabla
    // configuracion, nombre bonito para el modal, etiqueta corta del lápiz,
    // carpeta de destino e imagen original del diseño (para la vista previa
    // cuando todavía no hay nada guardado en la base de datos).
    const pagina = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const OBJETIVOS_POR_PAGINA = {
        "index.html": [
            { selector: ".seccion-anuncio", clave: "hero_imagen", titulo: "la portada", etiqueta: "Editar portada", carpeta: "imagenes/anuncios", predeterminada: "imagenes/anuncios/imagen-procesador-add.jpg" },
            { selector: ".titulo-categoria", clave: "imagen_computadoras", titulo: "la sección de Computadoras", etiqueta: "Editar Computadoras", carpeta: "imagenes/anuncios", predeterminada: null }
        ],
        "accesorios.html": [
            { selector: ".seccion-anuncio", clave: "imagen_accesorios", titulo: "la sección de Accesorios", etiqueta: "Editar Accesorios", carpeta: "imagenes/anuncios", predeterminada: "imagenes/anuncios/imagen-mouse-accesorios-add.jpg" }
        ],
        "ofertas.html": [
            { selector: ".seccion-anuncio", clave: "imagen_ofertas", titulo: "la sección de Ofertas", etiqueta: "Editar Ofertas", carpeta: "imagenes/anuncios", predeterminada: "imagenes/anuncios/imagen-ofertas-add.jpg" }
        ]
    };

    const objetivos = OBJETIVOS_POR_PAGINA[pagina] || [];

    // Mapa de claves de la BD → llaves de Tienda.config() para la vista previa.
    const CLAVES_CONFIG = {
        hero_imagen: "heroImagen",
        imagen_computadoras: "imagenComputadoras",
        imagen_accesorios: "imagenAccesorios",
        imagen_ofertas: "imagenOfertas"
    };

    let modal = null;
    let objetivoActivo = null;
    let archivoSeleccionado = null;

    // ---------------------------------------------------------- modal
    // Un solo diálogo reutilizable para todos los lápices.
    function crearModal() {
        modal = document.createElement("dialog");
        modal.className = "modal-editor-visual";
        modal.innerHTML = `
            <form class="caja-editor-visual" novalidate>
                <header class="cabecera-editor-visual">
                    <div>
                        <p class="etiqueta-editor-visual">EDICIÓN VISUAL</p>
                        <h2 class="titulo-editor-visual">Cambiar imagen</h2>
                    </div>
                    <button type="button" class="cerrar-editor-visual" aria-label="Cerrar">×</button>
                </header>
                <figure class="vista-previa-editor">
                    <img class="imagen-previa-editor" alt="Imagen actual de la sección" hidden>
                    <figcaption class="nombre-previa-editor">Imagen predeterminada del diseño.</figcaption>
                </figure>
                <label class="campo-editor-visual">
                    <span>Nueva imagen (JPG, PNG, WEBP, GIF o AVIF · máx. 4 MB)</span>
                    <input type="file" class="archivo-editor-visual" accept="image/*">
                </label>
                <p class="mensaje-editor-visual" role="status" aria-live="polite"></p>
                <footer class="pie-editor-visual">
                    <button type="button" class="boton-editor-visual boton-editor-secundario">Cancelar</button>
                    <button type="button" class="boton-editor-visual boton-editor-guardar">Guardar imagen</button>
                </footer>
            </form>
        `;
        document.body.append(modal);

        modal.querySelector(".cerrar-editor-visual").addEventListener("click", cerrarModal);
        modal.querySelector(".boton-editor-secundario").addEventListener("click", cerrarModal);
        modal.querySelector(".archivo-editor-visual").addEventListener("change", function () {
            const campo = modal.querySelector(".archivo-editor-visual");
            archivoSeleccionado = campo.files && campo.files[0] ? campo.files[0] : null;
        });
        modal.querySelector(".boton-editor-guardar").addEventListener("click", guardar);

        // Clic fuera de la caja cierra el modal.
        modal.addEventListener("click", function (evento) {
            if (evento.target === modal) {
                cerrarModal();
            }
        });
    }

    function abrirModal(objetivo) {
        if (!modal) {
            crearModal();
        }

        objetivoActivo = objetivo;
        archivoSeleccionado = null;

        modal.querySelector(".titulo-editor-visual").textContent = "Cambiar imagen de " + objetivo.titulo;
        modal.querySelector(".archivo-editor-visual").value = "";
        const mensaje = modal.querySelector(".mensaje-editor-visual");
        mensaje.textContent = "";
        mensaje.className = "mensaje-editor-visual";

        // Vista previa fiel a la base de datos: si hay imagen guardada se
        // muestra esa ruta exacta; si no, se muestra la imagen original del
        // diseño (lo que ve el visitante) y el texto lo aclara. Nunca queda
        // un <img> vacío: sin ruta se le quita el src por completo.
        const configActual = Tienda.config();
        const guardada = String(configActual[CLAVES_CONFIG[objetivo.clave]] || "").trim();
        const previa = modal.querySelector(".imagen-previa-editor");
        const nombre = modal.querySelector(".nombre-previa-editor");
        const rutaPrevia = guardada || objetivo.predeterminada || "";

        if (rutaPrevia) {
            previa.src = Tienda.construirRutaImagen(rutaPrevia);
            previa.hidden = false;
        } else {
            previa.removeAttribute("src");
            previa.hidden = true;
        }

        // El texto SIEMPRE refleja lo que hay guardado en configuracion:
        // con imagen, la ruta exacta; sin imagen, se dice explícitamente.
        nombre.textContent = guardada
            ? guardada
            : "Sin imagen guardada: se muestra el diseño original.";

        modal.showModal();
        modal.querySelector(".archivo-editor-visual").focus();
    }

    function cerrarModal() {
        if (modal && modal.open) {
            modal.close();
        }
        objetivoActivo = null;
        archivoSeleccionado = null;
    }

    // ----------------------------------------------------- guardado
    async function guardar() {
        if (!objetivoActivo) {
            return;
        }

        const mensaje = modal.querySelector(".mensaje-editor-visual");
        const boton = modal.querySelector(".boton-editor-guardar");

        if (!archivoSeleccionado) {
            mensaje.textContent = "Primero elige una imagen desde tu equipo.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
            return;
        }

        mensaje.textContent = "Subiendo imagen…";
        mensaje.className = "mensaje-editor-visual";
        boton.disabled = true;

        try {
            // 1) El archivo viaja al servidor, que lo guarda en la carpeta
            //    de anuncios y devuelve su ruta local.
            const carga = new FormData();
            carga.append("archivo", archivoSeleccionado);
            carga.append("carpeta", objetivoActivo.carpeta);

            const respuestaSubida = await fetch("api/subir_imagen.php", {
                method: "POST",
                body: carga
            });
            const subida = await respuestaSubida.json();

            if (!subida.ok) {
                mensaje.textContent = subida.mensaje || "No se pudo subir la imagen.";
                mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                return;
            }

            // 2) La ruta se registra en la tabla configuracion.
            const resultado = await Tienda.guardarImagenConfig(objetivoActivo.clave, subida.url);

            if (!resultado.ok) {
                mensaje.textContent = resultado.mensaje || "No se pudo aplicar la imagen.";
                mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                return;
            }

            // 3) La tienda ya refrescó sus datos y aplicó la variable CSS:
            //    la imagen cambió en pantalla sin recargar la página.
            mensaje.textContent = "✔ Imagen actualizada";
            mensaje.className = "mensaje-editor-visual mensaje-editor-exito";

            window.setTimeout(cerrarModal, movimientoReducido ? 150 : 900);
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
        } finally {
            boton.disabled = false;
        }
    }

    // ------------------------------------------------- lápices flotantes
    function inyectarLapices() {
        objetivos.forEach(function (objetivo) {
            const seccion = document.querySelector(objetivo.selector);

            if (!seccion || seccion.querySelector(".boton-lapiz-visual")) {
                return;
            }

            seccion.classList.add("con-editor-visual");

            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "boton-lapiz-visual";
            boton.setAttribute("aria-label", "Cambiar imagen de " + objetivo.titulo);
            boton.title = "Cambiar imagen de " + objetivo.titulo;
            boton.innerHTML =
                '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z"/>' +
                '<path d="m20.71 7.04-2.83-2.83a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2.32-2.33a1 1 0 0 0 0-1.42Z"/>' +
                "</svg>" +
                '<span class="etiqueta-lapiz-visual">' + objetivo.etiqueta + "</span>";

            boton.addEventListener("click", function () {
                abrirModal(objetivo);
            });

            seccion.append(boton);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inyectarLapices);
    } else {
        inyectarLapices();
    }
})();
