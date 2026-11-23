/* =========================================================
   editor-visual.js — Edición visual para administrador y gerente
   ---------------------------------------------------------
   · Aplica los textos guardados en contenido_sitio.
   · Inyecta lápices para editar títulos, párrafos, botones e
     imágenes desde la propia tienda.
   · Cada tarjeta de producto tiene un lápiz con edición rápida.
   · Las secciones de ofertas se pueden crear, renombrar, ordenar
     y eliminar; el menú de Ofertas se actualiza solo.
   · El administrador publica al instante; el gerente propone y el
     administrador aprueba desde el panel.
   ========================================================= */
(function () {
    "use strict";

    const sesion = window.Tienda ? Tienda.sesion() : null;
    const rol = sesion ? sesion.rol : null;
    const puedeEditar = rol === "admin" || rol === "gerente";
    const esAdmin = rol === "admin";
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pagina = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    const CLAVES_CONFIG = {
        hero_imagen: "heroImagen",
        imagen_computadoras: "imagenComputadoras",
        imagen_accesorios: "imagenAccesorios",
        imagen_ofertas: "imagenOfertas"
    };

    const IMAGENES = {
        hero_imagen: { carpeta: "imagenes/anuncios", predeterminada: "imagenes/anuncios/imagen-procesador-add.jpg", titulo: "la portada" },
        imagen_computadoras: { carpeta: "imagenes/anuncios", predeterminada: "", titulo: "Computadoras" },
        imagen_accesorios: { carpeta: "imagenes/anuncios", predeterminada: "imagenes/anuncios/imagen-mouse-accesorios-add.jpg", titulo: "Accesorios" },
        imagen_ofertas: { carpeta: "imagenes/anuncios", predeterminada: "imagenes/anuncios/imagen-ofertas-add.jpg", titulo: "Ofertas" }
    };

    const SECCIONES_FALLBACK = [
        { id: 1, clave: "semana", etiqueta: "DESTACADAS", titulo: "Ofertas", acento: "de la semana", descripcion: "Los favoritos del momento, con descuento durante esta semana.", orden: 1 },
        { id: 2, clave: "educativo", etiqueta: "PARA ESTUDIAR", titulo: "Descuentos", acento: "educativos", descripcion: "Equipos pensados para clases, programación y trabajo académico.", orden: 2 },
        { id: 3, clave: "especial", etiqueta: "SELECCIÓN PREMIUM", titulo: "Promociones", acento: "especiales", descripcion: "Oportunidades puntuales en equipos y accesorios de gama alta.", orden: 3 }
    ];

    // ------------------------------------------------------- contenido
    function obtenerSecciones() {
        const guardadas = window.Tienda ? Tienda.seccionesOferta() : [];
        return guardadas.length ? guardadas : SECCIONES_FALLBACK;
    }

    function valorContenido(clave) {
        if (!window.Tienda) {
            return null;
        }
        const contenido = Tienda.contenido();
        return Object.prototype.hasOwnProperty.call(contenido, clave) ? contenido[clave] : null;
    }

    function aplicarContenido() {
        document.querySelectorAll("[data-contenido]").forEach(function (elemento) {
            const clave = elemento.dataset.contenido;
            const guardado = valorContenido(clave);
            if (guardado !== null) {
                elemento.textContent = guardado;
            }
        });
        actualizarNavegacionOfertas();
    }

    function actualizarNavegacionOfertas() {
        const listas = document.querySelectorAll(".contenido-ofertas");
        if (!listas.length) {
            return;
        }
        const secciones = obtenerSecciones();
        const base = pagina === "ofertas.html" ? "" : "ofertas.html";

        listas.forEach(function (lista) {
            lista.replaceChildren(
                ...secciones.map(function (seccion) {
                    const item = document.createElement("li");
                    const enlace = document.createElement("a");
                    enlace.href = base + "#seccion-" + seccion.clave;
                    enlace.textContent = [seccion.titulo, seccion.acento].filter(Boolean).join(" ");
                    item.append(enlace);
                    return item;
                })
            );
        });
    }

    // ---------------------------------------------------------- lápices
    function crearBotonLapiz(texto) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton-lapiz-visual";
        boton.title = texto;
        boton.setAttribute("aria-label", texto);
        boton.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z"/>' +
            '<path d="m20.71 7.04-2.83-2.83a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2.32-2.33a1 1 0 0 0 0-1.42Z"/>' +
            "</svg>" +
            '<span class="etiqueta-lapiz-visual">' + texto + "</span>";
        return boton;
    }

    function montarLapiz(contenedor, texto, alPulsar) {
        if (!puedeEditar || !contenedor) {
            return;
        }
        if (contenedor.querySelector(":scope > .boton-lapiz-visual")) {
            return;
        }
        contenedor.classList.add("con-editor-visual");
        const boton = crearBotonLapiz(texto);
        boton.addEventListener("click", function (evento) {
            evento.preventDefault();
            evento.stopPropagation();
            alPulsar();
        });
        contenedor.append(boton);
    }

    function montarBotonNuevaSeccion(contenedor) {
        if (!puedeEditar || !contenedor || contenedor.querySelector(":scope > .boton-nueva-seccion")) {
            return;
        }
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton-nueva-seccion";
        boton.textContent = "+ Nueva sección";
        boton.title = "Crear una sección de ofertas";
        boton.addEventListener("click", function (evento) {
            evento.preventDefault();
            evento.stopPropagation();
            abrirSeccion(null);
        });
        contenedor.append(boton);
    }

    function inyectarLapicesSecciones() {
        if (!puedeEditar) {
            return;
        }

        document.querySelectorAll("[data-editor-grupo]").forEach(function (seccion) {
            const grupo = seccion.dataset.editorGrupo;
            const campos = Array.from(seccion.querySelectorAll("[data-contenido]")).filter(function (elemento) {
                return elemento.dataset.contenido.indexOf(grupo + ".") === 0;
            });
            const imagen = seccion.dataset.editorImagen || "";
            if (!campos.length && !imagen) {
                return;
            }
            montarLapiz(seccion, seccion.dataset.editorTitulo || "Editar sección", function () {
                abrirContenido({
                    grupo: grupo,
                    titulo: seccion.dataset.editorTitulo || "Editar sección",
                    campos: campos,
                    imagen: imagen
                });
            });

            if (seccion.dataset.editorSecciones === "true") {
                montarBotonNuevaSeccion(seccion);
            }
        });
    }

    function inyectarLapicesOfertas() {
        if (!puedeEditar) {
            return;
        }
        const secciones = obtenerSecciones();

        document.querySelectorAll("[data-seccion-oferta]").forEach(function (grupo) {
            const id = Number(grupo.dataset.seccionId) || 0;
            const clave = grupo.dataset.seccionOferta;
            const datos = secciones.find(function (seccion) {
                return Number(seccion.id) === id || seccion.clave === clave;
            });
            if (!datos) {
                return;
            }
            const encabezado = grupo.querySelector(".encabezado-grupo-ofertas");
            montarLapiz(encabezado, "Editar sección", function () {
                abrirSeccion(datos);
            });
        });
    }

    function inyectarLapices() {
        inyectarLapicesSecciones();
        inyectarLapicesOfertas();
    }

    // -------------------------------------------------- modal de contenido
    let modalContenido = null;
    let estadoContenido = null;

    function crearModalContenido() {
        modalContenido = document.createElement("dialog");
        modalContenido.className = "modal-editor-visual modal-editor-contenido";
        modalContenido.innerHTML =
            '<form class="caja-editor-visual" novalidate>' +
            '<header class="cabecera-editor-visual">' +
            '<div><p class="etiqueta-editor-visual">EDICIÓN VISUAL</p><h2 class="titulo-editor-visual">Editar sección</h2></div>' +
            '<button type="button" class="cerrar-editor-visual" data-cerrar aria-label="Cerrar">×</button>' +
            "</header>" +
            '<div class="cuerpo-editor-visual">' +
            '<div class="campos-editor-visual"></div>' +
            '<div class="bloque-imagen-editor">' +
            '<p class="subtitulo-editor-visual">Imagen de la sección</p>' +
            '<figure class="vista-previa-editor"><img class="imagen-previa-editor" alt="Imagen actual de la sección" hidden><figcaption class="nombre-previa-editor"></figcaption></figure>' +
            '<label class="campo-editor-visual campo-archivo-editor"><span>Nueva imagen (JPG, PNG, WEBP, GIF o AVIF · máx. 4 MB)</span><input type="file" class="archivo-editor-visual" accept="image/*"></label>' +
            '<p class="nota-editor-visual solo-gerente" hidden>Las imágenes solo las puede cambiar el administrador. Tu propuesta de textos sí se enviará.</p>' +
            "</div>" +
            "</div>" +
            '<p class="mensaje-editor-visual" role="status" aria-live="polite"></p>' +
            '<footer class="pie-editor-visual">' +
            '<button type="button" class="boton-editor-visual boton-editor-secundario" data-cancelar>Cancelar</button>' +
            '<button type="button" class="boton-editor-visual boton-editor-guardar">Guardar cambios</button>' +
            "</footer>" +
            "</form>";
        document.body.append(modalContenido);

        modalContenido.querySelector("[data-cerrar]").addEventListener("click", function () {
            modalContenido.close();
        });
        modalContenido.querySelector("[data-cancelar]").addEventListener("click", function () {
            modalContenido.close();
        });
        modalContenido.querySelector(".boton-editor-guardar").addEventListener("click", guardarContenido);
        modalContenido.addEventListener("click", function (evento) {
            if (evento.target === modalContenido) {
                modalContenido.close();
            }
        });
    }

    function abrirContenido(contexto) {
        if (!modalContenido) {
            crearModalContenido();
        }
        estadoContenido = contexto;

        modalContenido.querySelector(".titulo-editor-visual").textContent = "Editar " + contexto.titulo;
        modalContenido.querySelector(".boton-editor-guardar").textContent = esAdmin ? "Guardar cambios" : "Proponer cambios";
        const mensaje = modalContenido.querySelector(".mensaje-editor-visual");
        mensaje.textContent = "";
        mensaje.className = "mensaje-editor-visual";

        const contenedorCampos = modalContenido.querySelector(".campos-editor-visual");
        contenedorCampos.replaceChildren();

        contexto.campos.forEach(function (elemento) {
            const clave = elemento.dataset.contenido;
            const guardado = valorContenido(clave);
            const texto = guardado !== null ? guardado : String(elemento.textContent || "").trim();
            const etiqueta = document.createElement("label");
            etiqueta.className = "campo-editor-visual";
            const titulo = document.createElement("span");
            titulo.textContent = elemento.dataset.etiqueta || "Texto";
            let campo;
            if (elemento.tagName === "P" || elemento.dataset.editorLargo === "true") {
                campo = document.createElement("textarea");
                campo.rows = 3;
            } else {
                campo = document.createElement("input");
                campo.type = "text";
            }
            campo.value = texto;
            campo.dataset.clave = clave;
            campo.dataset.original = texto;
            etiqueta.append(titulo, campo);
            contenedorCampos.append(etiqueta);
        });

        const bloqueImagen = modalContenido.querySelector(".bloque-imagen-editor");
        const archivo = modalContenido.querySelector(".archivo-editor-visual");
        archivo.value = "";
        bloqueImagen.hidden = !contexto.imagen;
        modalContenido.querySelector(".solo-gerente").hidden = esAdmin;

        if (contexto.imagen) {
            const info = IMAGENES[contexto.imagen] || { predeterminada: "", carpeta: "imagenes/anuncios", titulo: contexto.titulo };
            const guardada = String(Tienda.config()[CLAVES_CONFIG[contexto.imagen]] || "").trim();
            const previa = modalContenido.querySelector(".imagen-previa-editor");
            const nombre = modalContenido.querySelector(".nombre-previa-editor");
            const ruta = guardada || info.predeterminada;
            if (ruta) {
                previa.src = Tienda.construirRutaImagen(ruta);
                previa.hidden = false;
            } else {
                previa.removeAttribute("src");
                previa.hidden = true;
            }
            nombre.textContent = guardada || "Sin imagen guardada: se muestra el diseño original.";
            archivo.closest("label").hidden = !esAdmin;
        }

        modalContenido.showModal();
        const primero = contenedorCampos.querySelector("input, textarea");
        if (primero) {
            primero.focus();
        }
    }

    async function subirImagen(archivo, carpeta, productoNombre) {
        const carga = new FormData();
        carga.append("archivo", archivo);
        carga.append("carpeta", carpeta);
        if (productoNombre) {
            carga.append("producto", productoNombre);
        }
        const respuesta = await fetch("api/subir_imagen.php", { method: "POST", body: carga });
        return await respuesta.json();
    }

    async function guardarContenido() {
        if (!estadoContenido || !modalContenido) {
            return;
        }
        const mensaje = modalContenido.querySelector(".mensaje-editor-visual");
        const boton = modalContenido.querySelector(".boton-editor-guardar");
        const archivo = modalContenido.querySelector(".archivo-editor-visual").files[0] || null;
        const cambios = {};

        modalContenido.querySelectorAll("[data-clave]").forEach(function (campo) {
            if (campo.value !== campo.dataset.original) {
                cambios[campo.dataset.clave] = campo.value;
            }
        });

        if (archivo && !esAdmin) {
            mensaje.textContent = "Solo el administrador puede cambiar imágenes.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
            return;
        }
        if (!Object.keys(cambios).length && !archivo) {
            mensaje.textContent = "No cambiaste nada todavía.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
            return;
        }

        mensaje.textContent = "Guardando…";
        mensaje.className = "mensaje-editor-visual";
        boton.disabled = true;

        try {
            if (archivo && estadoContenido.imagen) {
                const info = IMAGENES[estadoContenido.imagen] || { carpeta: "imagenes/anuncios" };
                const subida = await subirImagen(archivo, info.carpeta);
                if (!subida.ok) {
                    mensaje.textContent = subida.mensaje || "No se pudo subir la imagen.";
                    mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                    return;
                }
                const resultadoImagen = await Tienda.guardarImagenConfig(estadoContenido.imagen, subida.url);
                if (!resultadoImagen.ok) {
                    mensaje.textContent = resultadoImagen.mensaje || "No se pudo aplicar la imagen.";
                    mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                    return;
                }
            }

            if (Object.keys(cambios).length) {
                const resultado = await Tienda.guardarContenido(cambios);
                if (!resultado.ok) {
                    mensaje.textContent = resultado.mensaje || "No se pudo guardar el contenido.";
                    mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                    return;
                }
                mensaje.textContent = resultado.propuesta
                    ? "✔ Propuesta enviada al administrador."
                    : "✔ Contenido actualizado.";
            } else {
                mensaje.textContent = "✔ Imagen actualizada.";
            }
            mensaje.className = "mensaje-editor-visual mensaje-editor-exito";
            aplicarContenido();
            window.setTimeout(function () {
                if (modalContenido && modalContenido.open) {
                    modalContenido.close();
                }
            }, movimientoReducido ? 150 : 800);
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
        } finally {
            boton.disabled = false;
        }
    }

    // -------------------------------------------------- modal de producto
    let modalProducto = null;

    function crearModalProducto() {
        modalProducto = document.createElement("dialog");
        modalProducto.className = "modal-editor-visual modal-editor-producto";
        modalProducto.innerHTML =
            '<form class="caja-editor-visual" novalidate>' +
            '<header class="cabecera-editor-visual">' +
            '<div><p class="etiqueta-editor-visual">EDICIÓN RÁPIDA</p><h2 class="titulo-editor-visual">Editar producto</h2></div>' +
            '<button type="button" class="cerrar-editor-visual" data-cerrar aria-label="Cerrar">×</button>' +
            "</header>" +
            '<div class="cuerpo-editor-visual">' +
            '<div class="rejilla-campos-editor">' +
            '<label class="campo-editor-visual"><span>Nombre</span><input type="text" data-campo="nombre"></label>' +
            '<label class="campo-editor-visual"><span>Marca</span><input type="text" data-campo="marca"></label>' +
            '<label class="campo-editor-visual"><span>Categoría</span><input type="text" data-campo="categoria" list="lista-categorias-editor"></label>' +
            '<label class="campo-editor-visual"><span>Tipo</span><select data-campo="tipo"><option value="computadora">Computadora</option><option value="accesorio">Accesorio</option></select></label>' +
            '<label class="campo-editor-visual"><span>Costo base</span><input type="number" data-campo="costoBase" min="0" step="0.01"></label>' +
            '<label class="campo-editor-visual"><span>Margen (%)</span><input type="number" data-campo="margen" min="0" max="300" step="0.01"></label>' +
            '<label class="campo-editor-visual"><span>Precio de venta</span><input type="number" data-campo="precio" min="0" step="0.01"></label>' +
            '<label class="campo-editor-visual"><span>Stock</span><input type="number" data-campo="stock" min="0" step="1"></label>' +
            '<label class="campo-editor-visual"><span>Etiqueta</span><input type="text" data-campo="etiqueta"></label>' +
            '<label class="campo-editor-visual"><span>Sección de ofertas</span><select data-campo="grupoOferta"></select></label>' +
            '<label class="campo-editor-visual"><span>Descuento (%)</span><input type="number" data-campo="descuento" min="0" max="95" step="1"></label>' +
            "</div>" +
            '<label class="campo-editor-visual"><span>Descripción corta</span><textarea rows="2" data-campo="especificacionesCortas"></textarea></label>' +
            '<label class="campo-editor-visual"><span>Descripción larga</span><textarea rows="4" data-campo="descripcionLarga"></textarea></label>' +
            '<label class="campo-editor-visual"><span>Características (una por línea)</span><textarea rows="4" data-campo="caracteristicasClave"></textarea></label>' +
            '<label class="campo-editor-visual"><span>Especificaciones (una por línea)</span><textarea rows="4" data-campo="especificacionesTecnicas"></textarea></label>' +
            '<div class="fila-checks-editor">' +
            '<label><input type="checkbox" data-campo="disponible"> Disponible</label>' +
            '<label><input type="checkbox" data-campo="destacado"> Destacado</label>' +
            '<label><input type="checkbox" data-campo="ofertaActiva"> En oferta</label>' +
            "</div>" +
            '<div class="bloque-imagen-editor bloque-imagen-producto">' +
            '<p class="subtitulo-editor-visual">Imagen principal</p>' +
            '<figure class="vista-previa-editor"><img class="imagen-previa-producto" alt="Imagen actual del producto" hidden><figcaption class="nombre-previa-producto"></figcaption></figure>' +
            '<label class="campo-editor-visual campo-archivo-editor solo-admin"><span>Cambiar imagen (JPG, PNG, WEBP, GIF o AVIF · máx. 4 MB)</span><input type="file" class="archivo-producto-editor" accept="image/*"></label>' +
            '<p class="nota-editor-visual solo-gerente" hidden>Las imágenes solo las puede cambiar el administrador.</p>' +
            "</div>" +
            "</div>" +
            '<p class="mensaje-editor-visual" role="status" aria-live="polite"></p>' +
            '<footer class="pie-editor-visual">' +
            '<button type="button" class="boton-editor-visual boton-editor-secundario" data-cancelar>Cancelar</button>' +
            '<button type="button" class="boton-editor-visual boton-editor-guardar">Guardar producto</button>' +
            "</footer>" +
            "</form>" +
            '<datalist id="lista-categorias-editor"></datalist>';
        document.body.append(modalProducto);

        const listaCategorias = modalProducto.querySelector("#lista-categorias-editor");
        const categorias = (window.DatosBD && Array.isArray(window.DatosBD.categorias)) ? window.DatosBD.categorias : [];
        categorias.forEach(function (categoria) {
            const opcion = document.createElement("option");
            opcion.value = categoria;
            listaCategorias.append(opcion);
        });

        modalProducto.querySelector("[data-cerrar]").addEventListener("click", function () {
            modalProducto.close();
        });
        modalProducto.querySelector("[data-cancelar]").addEventListener("click", function () {
            modalProducto.close();
        });
        modalProducto.querySelector(".boton-editor-guardar").addEventListener("click", guardarProducto);
        modalProducto.addEventListener("click", function (evento) {
            if (evento.target === modalProducto) {
                modalProducto.close();
            }
        });

        const costo = modalProducto.querySelector('[data-campo="costoBase"]');
        const margen = modalProducto.querySelector('[data-campo="margen"]');
        const precio = modalProducto.querySelector('[data-campo="precio"]');

        function precioDesdeMargen() {
            const c = Number(costo.value) || 0;
            const m = Number(margen.value) || 0;
            precio.value = (Math.round(c * (1 + m / 100) * 100) / 100).toFixed(2);
        }
        function margenDesdePrecio() {
            const c = Number(costo.value) || 0;
            const p = Number(precio.value) || 0;
            if (c > 0) {
                margen.value = (Math.round((p / c - 1) * 10000) / 100).toFixed(2);
            }
        }
        costo.addEventListener("input", precioDesdeMargen);
        margen.addEventListener("input", precioDesdeMargen);
        precio.addEventListener("input", margenDesdePrecio);
    }

    function campoProducto(nombre) {
        return modalProducto.querySelector('[data-campo="' + nombre + '"]');
    }

    function abrirProducto(id) {
        const producto = window.Tienda ? Tienda.producto(id) : null;
        if (!producto) {
            return;
        }
        if (!modalProducto) {
            crearModalProducto();
        }

        const detalle = document.querySelector("#modal-producto");
        if (detalle && detalle.open) {
            detalle.close();
        }

        modalProducto.dataset.productoId = String(producto.id);
        modalProducto.querySelector(".titulo-editor-visual").textContent = "Editar " + producto.nombre;
        modalProducto.querySelector(".boton-editor-guardar").textContent = esAdmin ? "Guardar producto" : "Proponer cambios";
        const mensaje = modalProducto.querySelector(".mensaje-editor-visual");
        mensaje.textContent = "";
        mensaje.className = "mensaje-editor-visual";

        campoProducto("nombre").value = producto.nombre || "";
        campoProducto("marca").value = producto.marca || "";
        campoProducto("categoria").value = producto.categoria || "";
        campoProducto("tipo").value = producto.tipo || "computadora";
        campoProducto("costoBase").value = Number(producto.costoBase) || 0;
        campoProducto("margen").value = Number(producto.margenAplicado) || 0;
        campoProducto("precio").value = (Number(producto.precioLista) || 0).toFixed(2);
        campoProducto("stock").value = Number(producto.stock) || 0;
        campoProducto("etiqueta").value = producto.etiqueta || "";
        campoProducto("descuento").value = Number(producto.oferta && producto.oferta.descuento) || 0;
        campoProducto("especificacionesCortas").value = producto.especificacionesCortas || "";
        campoProducto("descripcionLarga").value = producto.descripcionLarga || "";
        campoProducto("caracteristicasClave").value = (producto.caracteristicasClave || []).join("\n");
        campoProducto("especificacionesTecnicas").value = (producto.especificacionesTecnicas || []).join("\n");
        campoProducto("disponible").checked = producto.disponible !== false;
        campoProducto("destacado").checked = producto.destacado === true;
        campoProducto("ofertaActiva").checked = Boolean(producto.oferta && producto.oferta.activa);

        const selectorGrupo = campoProducto("grupoOferta");
        selectorGrupo.replaceChildren();
        obtenerSecciones().forEach(function (seccion) {
            const opcion = document.createElement("option");
            opcion.value = seccion.clave;
            opcion.textContent = [seccion.titulo, seccion.acento].filter(Boolean).join(" ");
            selectorGrupo.append(opcion);
        });
        selectorGrupo.value = producto.grupoOferta || (obtenerSecciones()[0] || {}).clave || "semana";

        const previa = modalProducto.querySelector(".imagen-previa-producto");
        const nombrePrevia = modalProducto.querySelector(".nombre-previa-producto");
        const imagen = String(producto.imagenPrincipal || "").trim();
        if (imagen) {
            previa.src = Tienda.construirRutaImagen(imagen);
            previa.hidden = false;
        } else {
            previa.removeAttribute("src");
            previa.hidden = true;
        }
        nombrePrevia.textContent = imagen || "Sin imagen guardada.";
        modalProducto.querySelector(".archivo-producto-editor").value = "";
        modalProducto.querySelector(".solo-admin").hidden = !esAdmin;
        modalProducto.querySelector(".solo-gerente").hidden = esAdmin;
        modalProducto.querySelector(".bloque-imagen-producto").hidden = false;

        modalProducto.showModal();
        campoProducto("nombre").focus();
    }

    function carpetaDeProducto(producto) {
        if (producto.tipo === "accesorio") {
            return "imagenes/imagenes-accesorios";
        }
        const categoria = String(producto.categoria || "").toLowerCase();
        if (categoria.indexOf("juego") !== -1 || categoria.indexOf("gaming") !== -1) {
            return "imagenes/computadoras-gaming";
        }
        if (categoria.indexOf("desarrollo") !== -1 || categoria.indexOf("program") !== -1) {
            return "imagenes/computadoras-desarrollo";
        }
        return "imagenes/computadoras-uso-diario";
    }

    async function guardarProducto() {
        if (!modalProducto || !modalProducto.dataset.productoId) {
            return;
        }
        const id = Number(modalProducto.dataset.productoId);
        const producto = Tienda.producto(id);
        if (!producto) {
            return;
        }

        const mensaje = modalProducto.querySelector(".mensaje-editor-visual");
        const boton = modalProducto.querySelector(".boton-editor-guardar");
        const archivo = modalProducto.querySelector(".archivo-producto-editor").files[0] || null;
        const grupo = campoProducto("grupoOferta").value;
        const ofertaActiva = campoProducto("ofertaActiva").checked;
        const costo = Number(campoProducto("costoBase").value) || 0;
        const precio = Number(campoProducto("precio").value) || 0;
        // El precio es la intención final del usuario: se calcula el margen
        // desde él (sin redondearlo antes) para que el servidor devuelva
        // exactamente el precio escrito y no un centavo de diferencia.
        const margen = costo > 0 ? (precio / costo - 1) * 100 : (Number(campoProducto("margen").value) || 0);

        const cambios = {
            nombre: campoProducto("nombre").value.trim(),
            marca: campoProducto("marca").value.trim(),
            categoria: campoProducto("categoria").value.trim(),
            tipo: campoProducto("tipo").value,
            etiqueta: campoProducto("etiqueta").value.trim(),
            costoBase: costo,
            margen: margen,
            stock: Math.max(0, parseInt(campoProducto("stock").value, 10) || 0),
            disponible: campoProducto("disponible").checked,
            destacado: campoProducto("destacado").checked,
            especificacionesCortas: campoProducto("especificacionesCortas").value.trim(),
            descripcionLarga: campoProducto("descripcionLarga").value.trim(),
            caracteristicasClave: campoProducto("caracteristicasClave").value.split(/\r?\n/).map(function (linea) { return linea.trim(); }).filter(Boolean),
            especificacionesTecnicas: campoProducto("especificacionesTecnicas").value.split(/\r?\n/).map(function (linea) { return linea.trim(); }).filter(Boolean),
            grupoOferta: grupo,
            oferta: {
                activa: ofertaActiva,
                descuento: Math.min(95, Math.max(0, parseInt(campoProducto("descuento").value, 10) || 0)),
                grupo: grupo
            }
        };

        if (!cambios.nombre) {
            mensaje.textContent = "El producto necesita un nombre.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
            return;
        }
        if (archivo && !esAdmin) {
            mensaje.textContent = "Solo el administrador puede cambiar imágenes.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
            return;
        }

        mensaje.textContent = "Guardando…";
        mensaje.className = "mensaje-editor-visual";
        boton.disabled = true;

        try {
            if (archivo) {
                const subida = await subirImagen(archivo, carpetaDeProducto(producto), cambios.nombre);
                if (!subida.ok) {
                    mensaje.textContent = subida.mensaje || "No se pudo subir la imagen.";
                    mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                    return;
                }
                cambios.imagenPrincipal = subida.url;
                const galeria = [subida.url].concat((producto.imagenesGaleria || []).filter(function (url) {
                    return url !== subida.url;
                }));
                cambios.imagenesGaleria = galeria;
            }

            const resultado = await Tienda.proponerCambios(id, cambios, "Edición rápida desde la tienda");
            if (!resultado.ok) {
                mensaje.textContent = resultado.mensaje || "No se pudo guardar el producto.";
                mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                return;
            }
            mensaje.textContent = resultado.propuesta
                ? "✔ Propuesta enviada al administrador."
                : "✔ Producto actualizado.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-exito";
            window.setTimeout(function () {
                if (modalProducto && modalProducto.open) {
                    modalProducto.close();
                }
            }, movimientoReducido ? 150 : 800);
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
        } finally {
            boton.disabled = false;
        }
    }

    // -------------------------------------------------- modal de sección
    let modalSeccion = null;

    function crearModalSeccion() {
        modalSeccion = document.createElement("dialog");
        modalSeccion.className = "modal-editor-visual modal-editor-seccion";
        modalSeccion.innerHTML =
            '<form class="caja-editor-visual" novalidate>' +
            '<header class="cabecera-editor-visual">' +
            '<div><p class="etiqueta-editor-visual">SECCIONES DE OFERTAS</p><h2 class="titulo-editor-visual">Editar sección</h2></div>' +
            '<button type="button" class="cerrar-editor-visual" data-cerrar aria-label="Cerrar">×</button>' +
            "</header>" +
            '<div class="cuerpo-editor-visual">' +
            '<div class="rejilla-campos-editor">' +
            '<label class="campo-editor-visual"><span>Etiqueta superior</span><input type="text" data-campo-seccion="etiqueta" maxlength="60"></label>' +
            '<label class="campo-editor-visual"><span>Título (parte blanca)</span><input type="text" data-campo-seccion="titulo" maxlength="120"></label>' +
            '<label class="campo-editor-visual"><span>Título rojo</span><input type="text" data-campo-seccion="acento" maxlength="120"></label>' +
            "</div>" +
            '<label class="campo-editor-visual"><span>Descripción</span><textarea rows="3" data-campo-seccion="descripcion" maxlength="500"></textarea></label>' +
            '<p class="nota-editor-visual">Al eliminar una sección, sus ofertas pasan automáticamente a otra sección para no perder ningún producto.</p>' +
            "</div>" +
            '<p class="mensaje-editor-visual" role="status" aria-live="polite"></p>' +
            '<footer class="pie-editor-visual pie-editor-seccion">' +
            '<button type="button" class="boton-editor-visual boton-editor-eliminar" data-eliminar>Eliminar sección</button>' +
            '<button type="button" class="boton-editor-visual boton-editor-secundario" data-mover="arriba" title="Mover esta sección antes">↑ Subir</button>' +
            '<button type="button" class="boton-editor-visual boton-editor-secundario" data-mover="abajo" title="Mover esta sección después">↓ Bajar</button>' +
            '<span class="espaciador-editor"></span>' +
            '<button type="button" class="boton-editor-visual boton-editor-secundario" data-cancelar>Cancelar</button>' +
            '<button type="button" class="boton-editor-visual boton-editor-guardar">Guardar sección</button>' +
            "</footer>" +
            "</form>";
        document.body.append(modalSeccion);

        modalSeccion.querySelector("[data-cerrar]").addEventListener("click", function () {
            modalSeccion.close();
        });
        modalSeccion.querySelector("[data-cancelar]").addEventListener("click", function () {
            modalSeccion.close();
        });
        modalSeccion.querySelector(".boton-editor-guardar").addEventListener("click", guardarSeccion);
        modalSeccion.querySelector("[data-eliminar]").addEventListener("click", eliminarSeccion);
        modalSeccion.querySelectorAll("[data-mover]").forEach(function (boton) {
            boton.addEventListener("click", function () {
                moverSeccion(boton.dataset.mover);
            });
        });
        modalSeccion.addEventListener("click", function (evento) {
            if (evento.target === modalSeccion) {
                modalSeccion.close();
            }
        });
    }

    function campoSeccion(nombre) {
        return modalSeccion.querySelector('[data-campo-seccion="' + nombre + '"]');
    }

    function abrirSeccion(seccion) {
        if (!modalSeccion) {
            crearModalSeccion();
        }
        const esNueva = !seccion;
        modalSeccion.dataset.seccionId = esNueva ? "" : String(seccion.id || "");
        modalSeccion.querySelector(".titulo-editor-visual").textContent = esNueva ? "Nueva sección" : "Editar sección";
        modalSeccion.querySelector(".boton-editor-guardar").textContent = esAdmin
            ? (esNueva ? "Crear sección" : "Guardar sección")
            : (esNueva ? "Proponer sección" : "Proponer cambios");
        modalSeccion.querySelector("[data-eliminar]").hidden = esNueva;

        const ordenadas = seccionesOrdenadas();
        const posicion = seccion ? ordenadas.findIndex(function (item) {
            return Number(item.id) === Number(seccion.id);
        }) : -1;
        const subir = modalSeccion.querySelector('[data-mover="arriba"]');
        const bajar = modalSeccion.querySelector('[data-mover="abajo"]');
        subir.hidden = esNueva || posicion <= 0;
        bajar.hidden = esNueva || posicion < 0 || posicion >= ordenadas.length - 1;

        campoSeccion("etiqueta").value = seccion ? (seccion.etiqueta || "") : "";
        campoSeccion("titulo").value = seccion ? (seccion.titulo || "") : "";
        campoSeccion("acento").value = seccion ? (seccion.acento || "") : "";
        campoSeccion("descripcion").value = seccion ? (seccion.descripcion || "") : "";

        const mensaje = modalSeccion.querySelector(".mensaje-editor-visual");
        mensaje.textContent = "";
        mensaje.className = "mensaje-editor-visual";
        modalSeccion.showModal();
        campoSeccion("titulo").focus();
    }

    function seccionesOrdenadas() {
        return (window.Tienda ? Tienda.seccionesOferta() : []).slice().sort(function (a, b) {
            return Number(a.orden) - Number(b.orden);
        });
    }

    async function moverSeccion(direccion) {
        if (!modalSeccion) {
            return;
        }
        const id = Number(modalSeccion.dataset.seccionId) || 0;
        const lista = seccionesOrdenadas();
        const posicion = lista.findIndex(function (seccion) {
            return Number(seccion.id) === id;
        });
        const destino = direccion === "arriba" ? posicion - 1 : posicion + 1;
        if (posicion < 0 || destino < 0 || destino >= lista.length) {
            return;
        }
        const reordenadas = lista.slice();
        const movida = reordenadas.splice(posicion, 1)[0];
        reordenadas.splice(destino, 0, movida);

        const mensaje = modalSeccion.querySelector(".mensaje-editor-visual");
        const botones = modalSeccion.querySelectorAll("[data-mover]");
        mensaje.textContent = "Guardando orden…";
        mensaje.className = "mensaje-editor-visual";
        botones.forEach(function (boton) { boton.disabled = true; });

        try {
            const resultado = await Tienda.ordenarSecciones(reordenadas.map(function (seccion) {
                return Number(seccion.id);
            }));
            if (!resultado.ok) {
                mensaje.textContent = resultado.mensaje || "No se pudo cambiar el orden.";
                mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                return;
            }
            mensaje.textContent = resultado.propuesta
                ? "✔ Propuesta de orden enviada al administrador."
                : "✔ Orden de secciones actualizado.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-exito";
            actualizarNavegacionOfertas();
            window.setTimeout(function () {
                if (modalSeccion && modalSeccion.open) {
                    modalSeccion.close();
                }
            }, movimientoReducido ? 150 : 800);
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
        } finally {
            botones.forEach(function (boton) { boton.disabled = false; });
        }
    }

    function datosSeccion() {
        return {
            etiqueta: campoSeccion("etiqueta").value.trim(),
            titulo: campoSeccion("titulo").value.trim(),
            acento: campoSeccion("acento").value.trim(),
            descripcion: campoSeccion("descripcion").value.trim()
        };
    }

    async function guardarSeccion() {
        if (!modalSeccion) {
            return;
        }
        const datos = datosSeccion();
        if (!datos.titulo) {
            const mensaje = modalSeccion.querySelector(".mensaje-editor-visual");
            mensaje.textContent = "La sección necesita un título.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
            return;
        }

        const id = Number(modalSeccion.dataset.seccionId) || 0;
        const mensaje = modalSeccion.querySelector(".mensaje-editor-visual");
        const boton = modalSeccion.querySelector(".boton-editor-guardar");
        mensaje.textContent = "Guardando…";
        mensaje.className = "mensaje-editor-visual";
        boton.disabled = true;

        try {
            const resultado = id
                ? await Tienda.guardarSeccion(Object.assign({ id: id }, datos))
                : await Tienda.crearSeccion(datos);
            if (!resultado.ok) {
                mensaje.textContent = resultado.mensaje || "No se pudo guardar la sección.";
                mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                return;
            }
            mensaje.textContent = resultado.propuesta
                ? "✔ Propuesta enviada al administrador."
                : "✔ Sección guardada.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-exito";
            actualizarNavegacionOfertas();
            window.setTimeout(function () {
                if (modalSeccion && modalSeccion.open) {
                    modalSeccion.close();
                }
            }, movimientoReducido ? 150 : 800);
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
        } finally {
            boton.disabled = false;
        }
    }

    async function eliminarSeccion() {
        if (!modalSeccion) {
            return;
        }
        const id = Number(modalSeccion.dataset.seccionId) || 0;
        if (!id) {
            return;
        }
        if (!window.confirm("¿Eliminar esta sección? Sus ofertas pasarán a otra sección.")) {
            return;
        }
        const mensaje = modalSeccion.querySelector(".mensaje-editor-visual");
        const boton = modalSeccion.querySelector("[data-eliminar]");
        mensaje.textContent = "Eliminando…";
        mensaje.className = "mensaje-editor-visual";
        boton.disabled = true;

        try {
            const resultado = await Tienda.eliminarSeccion(id);
            if (!resultado.ok) {
                mensaje.textContent = resultado.mensaje || "No se pudo eliminar la sección.";
                mensaje.className = "mensaje-editor-visual mensaje-editor-error";
                return;
            }
            mensaje.textContent = resultado.propuesta
                ? "✔ Propuesta de eliminación enviada."
                : "✔ Sección eliminada.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-exito";
            actualizarNavegacionOfertas();
            window.setTimeout(function () {
                if (modalSeccion && modalSeccion.open) {
                    modalSeccion.close();
                }
            }, movimientoReducido ? 150 : 800);
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
            mensaje.className = "mensaje-editor-visual mensaje-editor-error";
        } finally {
            boton.disabled = false;
        }
    }

    // ------------------------------------------------------------- inicio
    aplicarContenido();
    inyectarLapices();

    document.addEventListener("producto:editar", function (evento) {
        if (evento.detail && evento.detail.id) {
            abrirProducto(evento.detail.id);
        }
    });
    document.addEventListener("ofertas:renderizadas", function () {
        inyectarLapicesOfertas();
    });
    document.addEventListener("tienda:actualizada", function () {
        aplicarContenido();
        inyectarLapices();
    });

    window.inicializarEditorVisual = inyectarLapices;
})();
