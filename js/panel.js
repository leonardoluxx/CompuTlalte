// Panel de control. Un solo panel para administrador y gerente: el
// administrador aplica los cambios al instante y el gerente los deja como
// solicitudes que el administrador aprueba o rechaza.
(function () {
    "use strict";

    const Tienda = window.Tienda;
    const sesion = Tienda ? Tienda.sesion() : null;
    const esAdmin = Boolean(sesion && sesion.rol === "admin");
    const esGerente = Boolean(sesion && sesion.rol === "gerente");

    const formatearMoneda = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
    });

    const ETIQUETAS_CAMPO = {
        nombre: "Nombre",
        marca: "Marca",
        categoria: "Categoría",
        tipo: "Tipo",
        etiqueta: "Etiqueta",
        costoBase: "Costo base",
        margen: "Margen",
        disponible: "Disponibilidad",
        descripcionLarga: "Descripción larga",
        especificacionesCortas: "Descripción corta",
        caracteristicasClave: "Características",
        especificacionesTecnicas: "Especificaciones",
        imagenesGaleria: "Imágenes",
        imagenPrincipal: "Imagen principal",
        terminosBusqueda: "Términos de búsqueda",
        oferta: "Oferta"
    };

    const panelAcceso = document.getElementById("panel-acceso");
    const disposicion = document.getElementById("panel-disposicion");
    const tituloAcceso = document.getElementById("panel-acceso-titulo");
    const textoAcceso = document.getElementById("panel-acceso-texto");
    const enlaceLogin = document.getElementById("panel-acceso-login");

    const botonesMenu = [...document.querySelectorAll(".panel-menu-boton")];
    const vistas = [...document.querySelectorAll("[data-vista-panel]")];

    const statProductos = document.getElementById("stat-productos");
    const statOfertas = document.getElementById("stat-ofertas");
    const statPendientes = document.getElementById("stat-pendientes");
    const statMargen = document.getElementById("stat-margen");
    const contadorOfertas = document.getElementById("contador-ofertas");
    const contadorSolicitudes = document.getElementById("contador-solicitudes");
    const resumenPendientes = document.getElementById("resumen-pendientes");
    const listaBitacora = document.getElementById("lista-bitacora");

    const buscarProductoEl = document.getElementById("buscar-producto");
    const filtroCategoriaEl = document.getElementById("filtro-categoria");
    const filtroEstadoEl = document.getElementById("filtro-estado");
    const tablaProductos = document.getElementById("tabla-productos");
    const conteoProductos = document.getElementById("conteo-productos");
    const notaProductos = document.getElementById("nota-productos");
    const botonNuevoProducto = document.getElementById("nuevo-producto");

    const listaOfertas = document.getElementById("lista-ofertas");
    const listaSolicitudes = document.getElementById("lista-solicitudes");
    const notaSolicitudes = document.getElementById("nota-solicitudes");

    const formularioMargen = document.getElementById("formulario-margen");
    const margenGlobalEl = document.getElementById("margen-global");
    const ejemploMargen = document.getElementById("ejemplo-margen");
    const listaUsuarios = document.getElementById("lista-usuarios");

    const editor = document.getElementById("editor-producto");
    const formularioProducto = document.getElementById("formulario-producto");
    const editorTitulo = document.getElementById("editor-titulo");
    const mensajeEditor = document.getElementById("mensaje-editor");
    const guardarProductoEl = document.getElementById("guardar-producto");
    const listaImagenes = document.getElementById("lista-imagenes");
    const nuevaImagenUrl = document.getElementById("nueva-imagen-url");
    const nuevaImagenArchivo = document.getElementById("nueva-imagen-archivo");

    const avisoEl = document.getElementById("panel-aviso");

    let vistaActual = "resumen";
    let productoEnEdicion = null;
    let imagenesDraft = [];
    let esNuevo = false;
    let temporizadorAviso = null;

    // ------------------------------------------------------------ utilidades

    function crear(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);
        if (clase) {
            elemento.className = clase;
        }
        if (texto !== undefined) {
            elemento.textContent = texto;
        }
        return elemento;
    }

    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function fechaCorta(iso) {
        const valor = new Date(iso);
        if (Number.isNaN(valor.getTime())) {
            return "";
        }

        return valor.toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }) + " h";
    }

    function avisar(texto, tipo) {
        avisoEl.textContent = texto;
        avisoEl.className = "panel-aviso panel-aviso-visible" + (tipo ? " panel-aviso-" + tipo : "");
        avisoEl.hidden = false;

        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(function () {
            avisoEl.hidden = true;
            avisoEl.className = "panel-aviso";
        }, 4200);
    }

    function crearVacio(texto) {
        return crear("p", "panel-vacio", texto);
    }

    // --------------------------------------------------------------- arranque

    if (!Tienda) {
        return;
    }

    if (!esAdmin && !esGerente) {
        panelAcceso.hidden = false;

        if (sesion && sesion.rol === "cliente") {
            tituloAcceso.textContent = "Esta sección es del equipo de la tienda";
            textoAcceso.textContent = "Tu cuenta es de cliente: puedes comprar en la tienda, pero no administrar el catálogo.";
            enlaceLogin.hidden = true;
        } else {
            enlaceLogin.addEventListener("click", function () {
                try {
                    localStorage.setItem("redirigirTrasLogin", "panel");
                } catch (error) {
                    // Si el navegador bloquea el almacenamiento, el login igual funciona.
                }
            });
        }

        return;
    }

    document.body.classList.add(esAdmin ? "rol-admin" : "rol-gerente");
    panelAcceso.hidden = true;
    disposicion.hidden = false;

    document.getElementById("panel-rol").hidden = false;
    document.getElementById("panel-rol").textContent = Tienda.roles[sesion.rol].etiqueta;
    document.getElementById("panel-nombre").textContent = sesion.nombre;
    document.getElementById("panel-rol-texto").textContent = Tienda.roles[sesion.rol].etiqueta;
    document.getElementById("panel-avatar").textContent = String(sesion.nombre || "?").charAt(0).toUpperCase();
    document.getElementById("panel-fecha").textContent = new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("cerrar-sesion-panel").addEventListener("click", function () {
        Tienda.cerrarSesion();
        window.location.href = "index.html";
    });

    notaProductos.textContent = esAdmin
        ? "Edita cualquier ficha, su precio y sus imágenes. Los cambios se publican al guardar."
        : "Puedes proponer cambios de precio, descripción y oferta. El administrador los aprueba antes de publicarlos.";

    notaSolicitudes.textContent = esAdmin
        ? "Revisa lo que propone el gerente y aprueba o rechaza cada cambio."
        : "Aquí ves el estado de los cambios que propusiste.";

    botonesMenu.forEach(function (boton) {
        boton.addEventListener("click", function () {
            mostrarVista(boton.dataset.vista);
        });
    });

    function mostrarVista(vista) {
        vistaActual = vista;

        botonesMenu.forEach(function (boton) {
            boton.classList.toggle("esta-activo", boton.dataset.vista === vista);
        });

        vistas.forEach(function (seccion) {
            seccion.hidden = seccion.dataset.vistaPanel !== vista;
        });

        renderVistaActual();
    }

    function renderVistaActual() {
        renderContadores();

        if (vistaActual === "productos") {
            renderProductos();
        } else if (vistaActual === "ofertas") {
            renderOfertas();
        } else if (vistaActual === "solicitudes") {
            renderSolicitudes();
        } else if (vistaActual === "ajustes" && esAdmin) {
            renderAjustes();
        } else {
            renderResumen();
        }
    }

    // -------------------------------------------------------------- resumen

    function renderContadores() {
        const productosActivos = Tienda.productos().length;
        const ofertasActivas = Tienda.ofertas().length;
        const pendientes = Tienda.solicitudesPendientes().length;

        statProductos.textContent = String(productosActivos);
        statOfertas.textContent = String(ofertasActivas);
        statPendientes.textContent = String(pendientes);
        statMargen.textContent = `${Tienda.config().margenGlobal} %`;
        contadorOfertas.textContent = String(ofertasActivas);
        contadorSolicitudes.textContent = String(pendientes);
        contadorSolicitudes.hidden = pendientes === 0;
    }

    function renderResumen() {
        renderContadores();

        const pendientes = Tienda.solicitudesPendientes();
        resumenPendientes.replaceChildren();

        if (!pendientes.length) {
            resumenPendientes.append(crearVacio("No hay solicitudes esperando revisión."));
        } else {
            pendientes.slice(0, 5).forEach(function (solicitud) {
                const fila = crear("div", "panel-lista-item");
                const texto = crear("div", "panel-lista-texto");
                texto.append(
                    crear("strong", "", solicitud.productoNombre || "Producto"),
                    crear("small", "", `${solicitud.resumen} · ${solicitud.autor}`)
                );
                fila.append(texto);

                if (esAdmin) {
                    const acciones = crear("div", "panel-lista-acciones");
                    const aprobar = crear("button", "panel-boton panel-boton-mini", "Aprobar");
                    aprobar.type = "button";
                    aprobar.addEventListener("click", function () {
                        resolverSolicitud(solicitud.id, "aprobar");
                    });
                    acciones.append(aprobar);
                    fila.append(acciones);
                } else {
                    fila.append(crear("span", "panel-insignia panel-insignia-pendiente", "Pendiente"));
                }

                resumenPendientes.append(fila);
            });
        }

        const movimientos = Tienda.bitacora();
        listaBitacora.replaceChildren();

        if (!movimientos.length) {
            listaBitacora.append(crearVacio("Todavía no hay movimientos registrados."));
        } else {
            movimientos.slice(0, 6).forEach(function (movimiento) {
                const fila = crear("div", "panel-lista-item");
                const texto = crear("div", "panel-lista-texto");
                texto.append(
                    crear("strong", "", movimiento.detalle),
                    crear("small", "", `${movimiento.autor} · ${fechaCorta(movimiento.fecha)}`)
                );
                fila.append(texto, crear("span", "panel-insignia", movimiento.accion));
                listaBitacora.append(fila);
            });
        }
    }

    // -------------------------------------------------------------- productos

    function renderCategorias() {
        const seleccionada = filtroCategoriaEl.value;
        const categorias = [...new Set(Tienda.productos({ incluirEliminados: true })
            .map(function (producto) { return producto.categoria; })
            .filter(Boolean))].sort(function (a, b) { return a.localeCompare(b, "es"); });

        filtroCategoriaEl.replaceChildren(crear("option", "", "Todas"));
        filtroCategoriaEl.firstChild.value = "";

        categorias.forEach(function (categoria) {
            const opcion = crear("option", "", categoria);
            opcion.value = categoria;
            filtroCategoriaEl.append(opcion);
        });

        filtroCategoriaEl.value = categorias.includes(seleccionada) ? seleccionada : "";
    }

    function productosFiltrados() {
        const busqueda = normalizar(buscarProductoEl.value);
        const categoria = filtroCategoriaEl.value;
        const estado = filtroEstadoEl.value;

        return Tienda.productos({ incluirEliminados: true }).filter(function (producto) {
            if (estado === "activos" && producto.estado === "eliminado") {
                return false;
            }

            if (estado === "eliminados" && producto.estado !== "eliminado") {
                return false;
            }

            if (categoria && producto.categoria !== categoria) {
                return false;
            }

            if (!busqueda) {
                return true;
            }

            return normalizar([producto.nombre, producto.marca, producto.categoria].join(" ")).includes(busqueda);
        });
    }

    function renderProductos() {
        renderCategorias();

        const lista = productosFiltrados();
        tablaProductos.replaceChildren();

        if (!lista.length) {
            const fila = crear("tr");
            const celda = crear("td", "panel-tabla-vacia", "No hay productos con esos filtros.");
            celda.colSpan = 6;
            fila.append(celda);
            tablaProductos.append(fila);
        }

        lista.forEach(function (producto) {
            const fila = document.createElement("tr");
            fila.dataset.id = String(producto.id);

            const celdaProducto = document.createElement("td");
            const ficha = crear("div", "panel-ficha-producto");
            const marco = crear("span", "panel-miniatura");

            if (producto.imagenPrincipal) {
                const imagen = document.createElement("img");
                imagen.src = producto.imagenPrincipal;
                imagen.alt = "";
                imagen.loading = "lazy";
                marco.append(imagen);
            }

            const datos = crear("div", "panel-ficha-datos");
            datos.append(
                crear("strong", "", producto.nombre),
                crear("small", "", [producto.marca, producto.categoria].filter(Boolean).join(" · "))
            );
            ficha.append(marco, datos);
            celdaProducto.append(ficha);

            const celdaCosto = crear("td", "", formatearMoneda.format(Number(producto.costoBase) || 0));
            const margen = Tienda.margenDe(producto);
            const celdaMargen = crear(
                "td",
                "",
                producto.margen === null || producto.margen === ""
                    ? `${margen} % (global)`
                    : `${margen} %`
            );
            celdaMargen.title = "Margen sobre el costo base";

            const celdaPrecio = document.createElement("td");
            const precio = crear("div", "panel-precio-celda");
            precio.append(crear("strong", "", formatearMoneda.format(Tienda.precioVenta(producto))));
            if (Tienda.descuentoDe(producto) > 0) {
                precio.append(crear("small", "panel-precio-anterior", formatearMoneda.format(Tienda.precioLista(producto))));
            }
            celdaPrecio.append(precio);

            const descuento = Tienda.descuentoDe(producto);
            const celdaOferta = crear(
                "td",
                "",
                descuento > 0 ? `${descuento} % de descuento` : "Sin oferta"
            );
            if (descuento > 0) {
                celdaOferta.classList.add("panel-texto-oferta");
            }

            const celdaAcciones = document.createElement("td");
            const acciones = crear("div", "panel-acciones-tabla");

            const editar = crear("button", "panel-boton panel-boton-mini", "Editar");
            editar.type = "button";
            editar.dataset.accion = "editar";
            acciones.append(editar);

            if (esAdmin) {
                if (producto.estado === "eliminado") {
                    const restaurar = crear("button", "panel-boton panel-boton-mini panel-boton-secundario", "Restaurar");
                    restaurar.type = "button";
                    restaurar.dataset.accion = "restaurar";
                    acciones.append(restaurar);
                } else {
                    const eliminar = crear("button", "panel-boton panel-boton-mini panel-boton-peligro", "Eliminar");
                    eliminar.type = "button";
                    eliminar.dataset.accion = "eliminar";
                    acciones.append(eliminar);
                }
            }

            celdaAcciones.append(acciones);
            fila.append(celdaProducto, celdaCosto, celdaMargen, celdaPrecio, celdaOferta, celdaAcciones);

            if (producto.estado === "eliminado") {
                fila.classList.add("panel-fila-eliminada");
            }

            tablaProductos.append(fila);
        });

        const activos = lista.filter(function (producto) { return producto.estado !== "eliminado"; }).length;
        conteoProductos.textContent = `${activos} producto${activos === 1 ? "" : "s"} visible${activos === 1 ? "" : "s"} en la tienda`
            + (esAdmin ? " · puedes editar, crear o eliminar fichas." : " · tus cambios pasan por aprobación.");
    }

    buscarProductoEl.addEventListener("input", renderProductos);
    filtroCategoriaEl.addEventListener("change", renderProductos);
    filtroEstadoEl.addEventListener("change", renderProductos);

    tablaProductos.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) {
            return;
        }

        const fila = boton.closest("tr");
        const producto = Tienda.producto(fila.dataset.id);

        if (!producto) {
            return;
        }

        if (boton.dataset.accion === "editar") {
            abrirEditor(producto);
        } else if (boton.dataset.accion === "eliminar") {
            if (window.confirm(`¿Eliminar "${producto.nombre}" de la tienda? Podrás restaurarlo desde el filtro Eliminados.`)) {
                const resultado = Tienda.eliminarProducto(producto.id);
                avisar(resultado.ok ? "Producto eliminado de la tienda." : resultado.mensaje, resultado.ok ? "exito" : "error");
                renderProductos();
                renderContadores();
            }
        } else if (boton.dataset.accion === "restaurar") {
            const resultado = Tienda.restaurarProducto(producto.id);
            avisar(resultado.ok ? "Producto restaurado." : resultado.mensaje, resultado.ok ? "exito" : "error");
            renderProductos();
            renderContadores();
        }
    });

    if (botonNuevoProducto) {
        botonNuevoProducto.addEventListener("click", function () {
            abrirEditor(null);
        });
    }

    // ---------------------------------------------------------------- ofertas

    function renderOfertas() {
        const productos = Tienda.productos();
        listaOfertas.replaceChildren();

        if (!productos.length) {
            const fila = crear("tr");
            const celda = crear("td", "panel-tabla-vacia", "No hay productos activos.");
            celda.colSpan = 5;
            fila.append(celda);
            listaOfertas.append(fila);
            return;
        }

        productos.forEach(function (producto) {
            const fila = document.createElement("tr");
            fila.dataset.id = String(producto.id);

            const nombre = crear("td");
            nombre.append(
                crear("strong", "", producto.nombre),
                crear("small", "panel-subtexto", producto.categoria)
            );

            const precio = crear("td", "", formatearMoneda.format(Tienda.precioLista(producto)));

            const celdaActiva = document.createElement("td");
            const casilla = document.createElement("input");
            casilla.type = "checkbox";
            casilla.className = "oferta-activa";
            casilla.checked = Tienda.descuentoDe(producto) > 0;
            casilla.setAttribute("aria-label", `Poner ${producto.nombre} en oferta`);
            celdaActiva.append(casilla);

            const celdaDescuento = document.createElement("td");
            const campo = document.createElement("input");
            campo.type = "number";
            campo.className = "oferta-descuento";
            campo.min = "0";
            campo.max = "95";
            campo.step = "1";
            campo.value = String(Tienda.descuentoDe(producto));
            campo.setAttribute("aria-label", `Descuento de ${producto.nombre} en porcentaje`);
            celdaDescuento.append(campo, document.createTextNode(" %"));

            const celdaBoton = document.createElement("td");
            const boton = crear("button", "panel-boton panel-boton-mini", esAdmin ? "Aplicar" : "Proponer");
            boton.type = "button";
            boton.dataset.guardarOferta = "true";
            celdaBoton.append(boton);

            fila.append(nombre, precio, celdaActiva, celdaDescuento, celdaBoton);
            listaOfertas.append(fila);
        });
    }

    listaOfertas.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-guardar-oferta]");
        if (!boton) {
            return;
        }

        const fila = boton.closest("tr");
        const producto = Tienda.producto(fila.dataset.id);
        if (!producto) {
            return;
        }

        const activa = fila.querySelector(".oferta-activa").checked;
        const descuento = Number(fila.querySelector(".oferta-descuento").value) || 0;

        if (activa && (descuento <= 0 || descuento > 95)) {
            avisar("El descuento debe estar entre 1 % y 95 %.", "error");
            return;
        }

        const resultado = Tienda.proponerCambios(
            producto.id,
            { oferta: { activa: activa, descuento: descuento } },
            activa ? `Oferta de ${descuento} %` : "Oferta retirada"
        );

        if (!resultado.ok) {
            avisar(resultado.mensaje, "error");
            return;
        }

        avisar(
            resultado.aplicado ? "Oferta publicada en la tienda." : "Solicitud de oferta enviada al administrador.",
            "exito"
        );
        renderOfertas();
        renderContadores();
    });

    // -------------------------------------------------------------- solicitudes

    function formatearValor(campo, valor) {
        if (campo === "costoBase") {
            return formatearMoneda.format(Number(valor) || 0);
        }

        if (campo === "margen") {
            return valor === null || valor === "" || valor === undefined ? "Margen global" : `${valor} %`;
        }

        if (campo === "oferta") {
            const oferta = valor || {};
            return oferta.activa ? `${oferta.descuento} % de descuento` : "Sin oferta";
        }

        if (campo === "disponible") {
            return valor ? "Disponible" : "Agotado";
        }

        if (campo === "imagenPrincipal") {
            return valor ? "Definida" : "Sin imagen";
        }

        if (Array.isArray(valor)) {
            return valor.length === 1 ? "1 elemento" : `${valor.length} elementos`;
        }

        if (valor === null || valor === undefined || valor === "") {
            return "Vacío";
        }

        const texto = String(valor);
        return texto.length > 70 ? texto.slice(0, 70) + "…" : texto;
    }

    function crearDetalleSolicitud(solicitud) {
        const lista = crear("dl", "panel-diff");

        Object.keys(solicitud.despues || {}).forEach(function (campo) {
            const antes = formatearValor(campo, solicitud.antes ? solicitud.antes[campo] : null);
            const despues = formatearValor(campo, solicitud.despues[campo]);

            if (antes === despues) {
                return;
            }

            const grupo = crear("div", "panel-diff-fila");
            grupo.append(
                crear("dt", "", ETIQUETAS_CAMPO[campo] || campo),
                crear("dd", "", `${antes} → ${despues}`)
            );
            lista.append(grupo);
        });

        if (!lista.children.length) {
            lista.append(crear("p", "panel-vacio", "Sin diferencias visibles."));
        }

        return lista;
    }

    function resolverSolicitud(id, accion) {
        const resultado = accion === "aprobar"
            ? Tienda.aprobarSolicitud(id)
            : Tienda.rechazarSolicitud(id);

        if (!resultado.ok) {
            avisar(resultado.mensaje, "error");
            return;
        }

        avisar(accion === "aprobar" ? "Cambio aprobado y publicado." : "Solicitud rechazada.", "exito");
        renderVistaActual();
    }

    function renderSolicitudes() {
        const solicitudes = Tienda.solicitudes();
        listaSolicitudes.replaceChildren();

        if (!solicitudes.length) {
            listaSolicitudes.append(crearVacio("Todavía no hay solicitudes. Los cambios del gerente aparecerán aquí."));
            return;
        }

        solicitudes.forEach(function (solicitud) {
            const tarjeta = crear("article", "panel-solicitud");
            const cabecera = crear("header", "panel-solicitud-cabecera");
            const titulo = crear("div");
            titulo.append(
                crear("h2", "", solicitud.productoNombre || "Producto"),
                crear("p", "panel-subtexto", `${solicitud.resumen} · ${solicitud.autor} · ${fechaCorta(solicitud.fecha)}`)
            );

            const estado = crear(
                "span",
                "panel-insignia panel-insignia-" + solicitud.estado,
                solicitud.estado === "pendiente" ? "Pendiente" : solicitud.estado === "aprobada" ? "Aprobada" : "Rechazada"
            );

            cabecera.append(titulo, estado);
            tarjeta.append(cabecera, crearDetalleSolicitud(solicitud));

            if (solicitud.estado === "pendiente" && esAdmin) {
                const acciones = crear("div", "panel-solicitud-acciones");

                const aprobar = crear("button", "panel-boton panel-boton-mini", "Aprobar cambio");
                aprobar.type = "button";
                aprobar.addEventListener("click", function () { resolverSolicitud(solicitud.id, "aprobar"); });

                const rechazar = crear("button", "panel-boton panel-boton-mini panel-boton-peligro", "Rechazar");
                rechazar.type = "button";
                rechazar.addEventListener("click", function () { resolverSolicitud(solicitud.id, "rechazar"); });

                acciones.append(aprobar, rechazar);
                tarjeta.append(acciones);
            }

            if (solicitud.estado !== "pendiente" && solicitud.resueltoPor) {
                tarjeta.append(crear(
                    "p",
                    "panel-nota",
                    `${solicitud.estado === "aprobada" ? "Aprobada" : "Rechazada"} por ${solicitud.resueltoPor} · ${fechaCorta(solicitud.fechaResolucion)}`
                ));
            }

            listaSolicitudes.append(tarjeta);
        });
    }

    // ----------------------------------------------------------------- ajustes

    function renderAjustes() {
        const config = Tienda.config();
        margenGlobalEl.value = String(config.margenGlobal);
        actualizarEjemploMargen();

        listaUsuarios.replaceChildren();

        Tienda.usuarios().forEach(function (usuario) {
            const fila = document.createElement("tr");
            const rol = Tienda.roles[usuario.rol] ? usuario.rol : "cliente";

            fila.append(
                crear("td", "", usuario.nombre || "Sin nombre"),
                crear("td", "", usuario.usuario || "—"),
                crear("td", "", usuario.correo || "—"),
                crear("td", "", Tienda.roles[rol].etiqueta)
            );
            listaUsuarios.append(fila);
        });

        renderContadores();
    }

    function actualizarEjemploMargen() {
        const margen = Number(margenGlobalEl.value) || 0;
        const costo = 10000;
        ejemploMargen.textContent = `Ejemplo: un producto con costo de ${formatearMoneda.format(costo)} se vende en ${formatearMoneda.format(costo * (1 + margen / 100))} con ${margen} % de margen.`;
    }

    margenGlobalEl.addEventListener("input", actualizarEjemploMargen);

    formularioMargen.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const resultado = Tienda.guardarConfig({ margenGlobal: Number(margenGlobalEl.value) });

        if (!resultado.ok) {
            avisar(resultado.mensaje, "error");
            return;
        }

        avisar(`Margen global actualizado a ${resultado.config.margenGlobal} %. Los precios ya se recalcularon.`, "exito");
        renderAjustes();
    });

    // ------------------------------------------------------------------ editor

    function llenarCampo(id, valor) {
        document.getElementById(id).value = valor === null || valor === undefined ? "" : String(valor);
    }

    function abrirEditor(producto) {
        esNuevo = !producto;
        productoEnEdicion = producto || null;
        mensajeEditor.textContent = "";

        const datos = producto || {
            nombre: "",
            marca: "",
            categoria: "Juegos",
            tipo: "computadora",
            etiqueta: "",
            costoBase: 0,
            margen: null,
            disponible: true,
            descripcionLarga: "",
            especificacionesCortas: "",
            caracteristicasClave: [],
            especificacionesTecnicas: [],
            imagenPrincipal: "",
            imagenesGaleria: [],
            oferta: { activa: false, descuento: 0 }
        };

        imagenesDraft = Array.isArray(datos.imagenesGaleria) ? datos.imagenesGaleria.slice() : [];
        if (!imagenesDraft.length && datos.imagenPrincipal) {
            imagenesDraft = [datos.imagenPrincipal];
        }

        editorTitulo.textContent = esNuevo ? "Nuevo producto" : datos.nombre;
        guardarProductoEl.textContent = esNuevo || esAdmin ? "Guardar cambios" : "Enviar a aprobación";

        llenarCampo("p-nombre", datos.nombre);
        llenarCampo("p-marca", datos.marca);
        llenarCampo("p-categoria", datos.categoria);
        llenarCampo("p-tipo", datos.tipo || "computadora");
        llenarCampo("p-etiqueta", datos.etiqueta);
        llenarCampo("p-costo", Number(datos.costoBase) || 0);
        llenarCampo("p-margen", datos.margen);
        llenarCampo("p-descripcion-corta", datos.especificacionesCortas);
        llenarCampo("p-descripcion-larga", datos.descripcionLarga);
        llenarCampo("p-caracteristicas", (datos.caracteristicasClave || []).join("\n"));
        llenarCampo("p-especificaciones", (datos.especificacionesTecnicas || []).join("\n"));
        llenarCampo("p-oferta-descuento", datos.oferta ? datos.oferta.descuento : 0);

        document.getElementById("p-disponible").checked = datos.disponible !== false;
        document.getElementById("p-oferta-activa").checked = Boolean(datos.oferta && datos.oferta.activa);
        document.getElementById("p-oferta-descuento").disabled = !document.getElementById("p-oferta-activa").checked;

        nuevaImagenUrl.value = "";
        nuevaImagenArchivo.value = "";
        renderImagenesDraft();

        editor.showModal();
        document.body.classList.add("panel-modal-abierto");
        document.getElementById("p-nombre").focus();
    }

    function cerrarEditor() {
        editor.close();
        document.body.classList.remove("panel-modal-abierto");
        productoEnEdicion = null;
        imagenesDraft = [];
    }

    document.getElementById("cerrar-editor").addEventListener("click", cerrarEditor);
    document.getElementById("cancelar-editor").addEventListener("click", cerrarEditor);

    editor.addEventListener("click", function (evento) {
        if (evento.target === editor) {
            cerrarEditor();
        }
    });

    // Escape cierra el diálogo sin pasar por los botones: se limpia igual.
    editor.addEventListener("close", function () {
        document.body.classList.remove("panel-modal-abierto");
        productoEnEdicion = null;
        imagenesDraft = [];
    });

    document.getElementById("p-oferta-activa").addEventListener("change", function (evento) {
        const campo = document.getElementById("p-oferta-descuento");
        campo.disabled = !evento.target.checked;
        if (evento.target.checked && Number(campo.value) <= 0) {
            campo.value = "10";
        }
    });

    function renderImagenesDraft() {
        listaImagenes.replaceChildren();

        if (!imagenesDraft.length) {
            listaImagenes.append(crear("p", "panel-vacio", "Este producto todavía no tiene imágenes."));
            return;
        }

        imagenesDraft.forEach(function (ruta, indice) {
            const figura = crear("figure", "panel-imagen");
            const imagen = document.createElement("img");
            imagen.src = ruta;
            imagen.alt = indice === 0 ? "Imagen principal" : `Imagen ${indice + 1}`;
            imagen.loading = "lazy";

            const pie = document.createElement("figcaption");
            if (indice === 0) {
                pie.append(crear("span", "panel-insignia", "Principal"));
            }

            const quitar = crear("button", "panel-quitar-imagen", "Quitar");
            quitar.type = "button";
            quitar.dataset.indice = String(indice);
            pie.append(quitar);

            figura.append(imagen, pie);
            listaImagenes.append(figura);
        });
    }

    listaImagenes.addEventListener("click", function (evento) {
        const boton = evento.target.closest(".panel-quitar-imagen");
        if (!boton) {
            return;
        }

        imagenesDraft.splice(Number(boton.dataset.indice), 1);
        renderImagenesDraft();
    });

    document.getElementById("agregar-imagen-url").addEventListener("click", function () {
        const ruta = nuevaImagenUrl.value.trim();

        if (!ruta) {
            mensajeEditor.textContent = "Escribe la ruta o la URL de la imagen.";
            return;
        }

        imagenesDraft.push(ruta);
        nuevaImagenUrl.value = "";
        mensajeEditor.textContent = "";
        renderImagenesDraft();
    });

    // Reduce la imagen antes de guardarla: localStorage tiene poco espacio.
    function reducirImagen(archivo) {
        return new Promise(function (resolver, rechazar) {
            if (!archivo.type.startsWith("image/")) {
                rechazar(new Error("El archivo no es una imagen."));
                return;
            }

            const lector = new FileReader();

            lector.onload = function () {
                const imagen = new Image();

                imagen.onload = function () {
                    const maximo = 900;
                    const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
                    const lienzo = document.createElement("canvas");
                    lienzo.width = Math.max(1, Math.round(imagen.width * escala));
                    lienzo.height = Math.max(1, Math.round(imagen.height * escala));

                    const contexto = lienzo.getContext("2d");
                    contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

                    const webp = lienzo.toDataURL("image/webp", 0.82);
                    resolver(webp.startsWith("data:image/webp") ? webp : lienzo.toDataURL("image/jpeg", 0.82));
                };

                imagen.onerror = function () {
                    rechazar(new Error("No se pudo leer la imagen."));
                };
                imagen.src = lector.result;
            };

            lector.onerror = function () {
                rechazar(new Error("No se pudo abrir el archivo."));
            };
            lector.readAsDataURL(archivo);
        });
    }

    nuevaImagenArchivo.addEventListener("change", function (evento) {
        const archivo = evento.target.files && evento.target.files[0];
        if (!archivo) {
            return;
        }

        reducirImagen(archivo).then(function (dataUrl) {
            if (dataUrl.length > 1200000) {
                mensajeEditor.textContent = "La imagen sigue siendo muy pesada. Usa una más pequeña.";
                return;
            }

            imagenesDraft.push(dataUrl);
            mensajeEditor.textContent = "";
            renderImagenesDraft();
        }).catch(function (error) {
            mensajeEditor.textContent = error.message;
        }).finally(function () {
            nuevaImagenArchivo.value = "";
        });
    });

    function lineasDe(id) {
        return document.getElementById(id).value
            .split("\n")
            .map(function (linea) { return linea.trim(); })
            .filter(Boolean);
    }

    function cambiosDelFormulario() {
        const margenTexto = document.getElementById("p-margen").value.trim();

        return {
            nombre: document.getElementById("p-nombre").value.trim(),
            marca: document.getElementById("p-marca").value.trim(),
            categoria: document.getElementById("p-categoria").value.trim() || "Juegos",
            tipo: document.getElementById("p-tipo").value,
            etiqueta: document.getElementById("p-etiqueta").value.trim(),
            costoBase: Number(document.getElementById("p-costo").value) || 0,
            margen: margenTexto === "" ? null : Number(margenTexto),
            disponible: document.getElementById("p-disponible").checked,
            descripcionLarga: document.getElementById("p-descripcion-larga").value.trim(),
            especificacionesCortas: document.getElementById("p-descripcion-corta").value.trim(),
            caracteristicasClave: lineasDe("p-caracteristicas"),
            especificacionesTecnicas: lineasDe("p-especificaciones"),
            imagenesGaleria: imagenesDraft.slice(),
            imagenPrincipal: imagenesDraft[0] || "",
            oferta: {
                activa: document.getElementById("p-oferta-activa").checked,
                descuento: Number(document.getElementById("p-oferta-descuento").value) || 0
            }
        };
    }

    function resumenCambios(cambios) {
        const actual = productoEnEdicion;
        const cambiosReales = Object.keys(cambios).filter(function (campo) {
            return JSON.stringify(cambios[campo]) !== JSON.stringify(actual[campo] === undefined ? null : actual[campo]);
        });

        if (!cambiosReales.length) {
            return "";
        }

        return "Cambió: " + cambiosReales
            .map(function (campo) { return (ETIQUETAS_CAMPO[campo] || campo).toLowerCase(); })
            .slice(0, 5)
            .join(", ");
    }

    formularioProducto.addEventListener("submit", function (evento) {
        evento.preventDefault();
        mensajeEditor.textContent = "";

        const cambios = cambiosDelFormulario();

        if (!cambios.nombre) {
            mensajeEditor.textContent = "El producto necesita un nombre.";
            document.getElementById("p-nombre").focus();
            return;
        }

        if (!Number.isFinite(cambios.costoBase) || cambios.costoBase < 0) {
            mensajeEditor.textContent = "El costo base debe ser un número mayor o igual a cero.";
            document.getElementById("p-costo").focus();
            return;
        }

        if (cambios.oferta.activa && (cambios.oferta.descuento <= 0 || cambios.oferta.descuento > 95)) {
            mensajeEditor.textContent = "El descuento de la oferta debe estar entre 1 % y 95 %.";
            document.getElementById("p-oferta-descuento").focus();
            return;
        }

        let resultado;
        const fueNuevo = esNuevo;

        if (fueNuevo) {
            resultado = Tienda.crearProducto(cambios);
        } else {
            const resumen = resumenCambios(cambios);
            if (!resumen) {
                cerrarEditor();
                avisar("No cambiaste nada en la ficha.");
                return;
            }

            resultado = Tienda.proponerCambios(productoEnEdicion.id, cambios, resumen);
        }

        if (!resultado.ok) {
            mensajeEditor.textContent = resultado.mensaje;
            return;
        }

        const idEditado = fueNuevo ? resultado.producto.id : productoEnEdicion.id;
        cerrarEditor();

        if (fueNuevo) {
            avisar("Producto creado y publicado en la tienda.", "exito");
        } else {
            avisar(
                resultado.aplicado
                    ? "Cambios guardados y publicados en la tienda."
                    : "Solicitud enviada. El administrador debe aprobarla.",
                "exito"
            );
        }

        renderVistaActual();

        if (idEditado && vistaActual === "productos") {
            const fila = tablaProductos.querySelector(`tr[data-id="${idEditado}"]`);
            if (fila) {
                fila.classList.add("panel-fila-resaltada");
            }
        }
    });

    // Cualquier cambio del núcleo (incluido otro panel en la misma sesión)
    // actualiza la vista que está abierta.
    document.addEventListener("tienda:actualizada", function () {
        if (!disposicion.hidden) {
            renderVistaActual();
        }
    });

    mostrarVista("resumen");
})();
