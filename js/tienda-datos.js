// Núcleo de la tienda. Centraliza el catálogo editable, el margen de ganancia,
// las ofertas, la sesión con roles y las solicitudes de cambio. Todo vive en el
// navegador: no hay servidor, pero las páginas comparten el mismo formato.
(function () {
    "use strict";

    const CLAVES = {
        catalogo: "computlalte-catalogo-v1",
        config: "computlalte-config-v1",
        solicitudes: "computlalte-solicitudes-v1",
        bitacora: "computlalte-bitacora-v1",
        usuarios: "usuarios"
    };

    // Los tres roles del sistema y lo que puede hacer cada uno.
    const ROLES = {
        admin: {
            etiqueta: "Administrador",
            descripcion: "Control total: productos, imágenes, precios, ofertas y aprobaciones."
        },
        gerente: {
            etiqueta: "Gerente",
            descripcion: "Consulta y propone cambios de productos, precios y ofertas; el administrador los aprueba."
        },
        cliente: {
            etiqueta: "Cliente",
            descripcion: "Consulta el catálogo y compra. Nunca ve el costo base ni el panel."
        }
    };

    // Permisos por rol. El costo base solo se muestra a quien puede verlo.
    const PERMISOS = {
        admin: [
            "panel", "productos.ver", "precios.ver", "productos.editar", "productos.crear",
            "productos.eliminar", "imagenes.editar", "ofertas.editar", "config.editar",
            "solicitudes.ver", "solicitudes.aprobar", "usuarios.ver"
        ],
        gerente: [
            "panel", "productos.ver", "precios.ver", "productos.editar", "ofertas.editar",
            "solicitudes.ver"
        ],
        cliente: ["comprar"]
    };

    // Credenciales básicas de prueba. Si ya existen, no se duplican.
    const CREDENCIALES_BASE = [
        { nombre: "Administrador", usuario: "admin", correo: "admin@computlalte.com", clave: "admin", rol: "admin" },
        { nombre: "Gerente", usuario: "gerente", correo: "gerente@computlalte.com", clave: "gerente", rol: "gerente" },
        { nombre: "Cliente", usuario: "usuario", correo: "usuario@computlalte.com", clave: "usuario", rol: "cliente" }
    ];

    const CONFIG_PREDETERMINADA = { margenGlobal: 35 };

    // Campos que un gerente puede proponer y un administrador puede aplicar.
    const CAMPOS_EDITABLES = [
        "nombre", "marca", "categoria", "tipo", "etiqueta", "costoBase", "margen",
        "disponible", "descripcionLarga", "especificacionesCortas", "caracteristicasClave",
        "especificacionesTecnicas", "imagenesGaleria", "imagenPrincipal", "terminosBusqueda", "oferta"
    ];

    function leerJSON(clave, alternativa) {
        try {
            const crudo = window.localStorage.getItem(clave);
            if (!crudo) {
                return alternativa;
            }

            const valor = JSON.parse(crudo);
            return valor === null || valor === undefined ? alternativa : valor;
        } catch (error) {
            return alternativa;
        }
    }

    function guardarJSON(clave, valor) {
        try {
            window.localStorage.setItem(clave, JSON.stringify(valor));
            return true;
        } catch (error) {
            // El navegador puede quedarse sin espacio (por ejemplo con imágenes).
            return false;
        }
    }

    function clonar(valor) {
        return JSON.parse(JSON.stringify(valor));
    }

    function nuevoId(prefijo) {
        return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    }

    // ---------------------------------------------------------------- usuarios

    function usuarios() {
        const lista = leerJSON(CLAVES.usuarios, []);
        return Array.isArray(lista) ? lista : [];
    }

    // Agrega las credenciales base y completa los datos que falten en las
    // cuentas creadas desde el registro (rol de cliente y nombre de usuario).
    function sembrarUsuarios() {
        const lista = usuarios();
        let cambio = false;

        CREDENCIALES_BASE.forEach(function (base) {
            const existe = lista.some(function (usuario) {
                return String(usuario.usuario || "").toLowerCase() === base.usuario
                    || String(usuario.correo || "").toLowerCase() === base.correo;
            });

            if (!existe) {
                lista.push(Object.assign({}, base, { creado: new Date().toISOString() }));
                cambio = true;
            }
        });

        lista.forEach(function (usuario) {
            if (!usuario.rol || !ROLES[usuario.rol]) {
                usuario.rol = "cliente";
                cambio = true;
            }

            if (!usuario.usuario) {
                usuario.usuario = String(usuario.correo || "").split("@")[0] || "cliente";
                cambio = true;
            }
        });

        if (cambio) {
            guardarJSON(CLAVES.usuarios, lista);
        }

        return lista;
    }

    function buscarUsuario(identificador) {
        const buscado = String(identificador || "").trim().toLowerCase();
        if (!buscado) {
            return null;
        }

        return sembrarUsuarios().find(function (usuario) {
            return String(usuario.usuario || "").toLowerCase() === buscado
                || String(usuario.correo || "").toLowerCase() === buscado;
        }) || null;
    }

    function iniciarSesion(identificador, clave) {
        const usuario = buscarUsuario(identificador);

        if (!usuario) {
            return { ok: false, motivo: "usuario" };
        }

        if (String(usuario.clave) !== String(clave)) {
            return { ok: false, motivo: "clave" };
        }

        const rol = ROLES[usuario.rol] ? usuario.rol : "cliente";

        try {
            window.localStorage.setItem("sesionIniciada", "true");
            window.localStorage.setItem("usuario", usuario.correo || usuario.usuario);
            window.localStorage.setItem("usuarioNombre", usuario.nombre || usuario.usuario);
            window.localStorage.setItem("usuarioRol", rol);
        } catch (error) {
            return { ok: false, motivo: "sesion" };
        }

        return {
            ok: true,
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                usuario: usuario.usuario,
                rol: rol
            }
        };
    }

    function cerrarSesion() {
        ["sesionIniciada", "usuario", "usuarioNombre", "usuarioRol"].forEach(function (clave) {
            try {
                window.localStorage.removeItem(clave);
            } catch (error) {
                // Sin almacenamiento no hay sesión que borrar.
            }
        });
    }

    function sesion() {
        let activa = false;
        let identificador = "";

        try {
            activa = window.localStorage.getItem("sesionIniciada") === "true";
            identificador = window.localStorage.getItem("usuario") || "";
        } catch (error) {
            return null;
        }

        if (!activa || !identificador) {
            return null;
        }

        const usuario = buscarUsuario(identificador);
        if (!usuario) {
            return null;
        }

        return {
            nombre: usuario.nombre || usuario.usuario,
            correo: usuario.correo || "",
            usuario: usuario.usuario || "",
            rol: ROLES[usuario.rol] ? usuario.rol : "cliente"
        };
    }

    function puede(accion) {
        const actual = sesion();
        if (!actual) {
            return false;
        }

        return (PERMISOS[actual.rol] || []).includes(accion);
    }

    // ----------------------------------------------------------------- catálogo

    let productosCache = null;

    function normalizarProducto(producto) {
        const oferta = producto && producto.oferta ? producto.oferta : {};

        return Object.assign({
            tipo: "computadora",
            disponible: true,
            etiqueta: "",
            margen: null,
            estado: "activo",
            terminosBusqueda: [],
            caracteristicasClave: [],
            especificacionesTecnicas: []
        }, producto, {
            costoBase: Number(producto && producto.costoBase) || 0,
            margen: producto && producto.margen !== null && producto.margen !== undefined && producto.margen !== ""
                ? Number(producto.margen)
                : null,
            imagenesGaleria: Array.isArray(producto && producto.imagenesGaleria) ? producto.imagenesGaleria.slice() : [],
            oferta: {
                activa: Boolean(oferta.activa),
                descuento: Math.min(95, Math.max(0, Number(oferta.descuento) || 0))
            }
        });
    }

    function catalogoSemilla() {
        const base = Array.isArray(window.catalogoLocal) ? window.catalogoLocal : [];

        return base.map(function (producto, indice) {
            const normalizado = normalizarProducto(producto);

            // La oferta que ya existía en la tienda se conserva al primer arranque.
            if (normalizado.id === 2) {
                normalizado.oferta = { activa: true, descuento: 1 };
            }

            normalizado.actualizado = normalizado.actualizado || new Date().toISOString();
            normalizado.estado = "activo";
            return normalizado;
        });
    }

    function cargarProductos() {
        if (productosCache) {
            return productosCache;
        }

        const guardado = leerJSON(CLAVES.catalogo, null);
        const semilla = catalogoSemilla();
        const catalogoVacio = guardado && Array.isArray(guardado.productos) && !guardado.productos.length;

        // Las páginas que no cargan catalogo-local.js (login, cuenta, pago) no
        // deben guardar un catálogo vacío: solo se siembra cuando hay datos.
        if (!guardado || !Array.isArray(guardado.productos) || (catalogoVacio && semilla.length)) {
            productosCache = semilla;

            if (semilla.length) {
                guardarJSON(CLAVES.catalogo, { version: 1, productos: productosCache });
            }

            return productosCache;
        }

        productosCache = guardado.productos.map(normalizarProducto);

        // Si se agrega un producto al catálogo base, aparece sin perder ediciones.
        semilla.forEach(function (producto) {
            const existe = productosCache.some(function (guardadoProducto) {
                return guardadoProducto.id === producto.id;
            });

            if (!existe) {
                productosCache.push(producto);
            }
        });

        return productosCache;
    }

    function guardarCatalogo() {
        const guardado = guardarJSON(CLAVES.catalogo, { version: 1, productos: productosCache });
        emitir();
        return guardado;
    }

    function productos(opciones) {
        const incluirEliminados = Boolean(opciones && opciones.incluirEliminados);
        return cargarProductos().filter(function (producto) {
            return incluirEliminados || producto.estado !== "eliminado";
        });
    }

    function buscarProducto(id) {
        return cargarProductos().find(function (producto) {
            return Number(producto.id) === Number(id);
        }) || null;
    }

    // ------------------------------------------------------------------ precios

    function config() {
        return Object.assign({}, CONFIG_PREDETERMINADA, leerJSON(CLAVES.config, {}));
    }

    function margenDe(producto) {
        if (!producto) {
            return Number(config().margenGlobal) || 0;
        }

        const propio = Number(producto.margen);
        return Number.isFinite(propio) && producto.margen !== null && producto.margen !== ""
            ? propio
            : Number(config().margenGlobal) || 0;
    }

    // Precio de lista: costo base más el margen (propio o global).
    function precioLista(producto) {
        return Math.round((Number(producto && producto.costoBase) || 0) * (1 + margenDe(producto) / 100));
    }

    function descuentoDe(producto) {
        if (!producto || !producto.oferta || !producto.oferta.activa) {
            return 0;
        }

        return Math.min(95, Math.max(0, Number(producto.oferta.descuento) || 0));
    }

    function precioConDescuento(producto, descuento) {
        const porcentaje = Number(descuento) || 0;
        return Math.round(precioLista(producto) * (1 - porcentaje / 100));
    }

    // Precio que ve el cliente: aplica la oferta si está activa.
    function precioVenta(producto) {
        return precioConDescuento(producto, descuentoDe(producto));
    }

    function productosConOferta() {
        return productos().filter(function (producto) {
            return descuentoDe(producto) > 0;
        });
    }

    // --------------------------------------------------------------- solicitudes

    function solicitudes() {
        const lista = leerJSON(CLAVES.solicitudes, []);
        return Array.isArray(lista) ? lista : [];
    }

    function guardarSolicitudes(lista) {
        guardarJSON(CLAVES.solicitudes, lista);
        emitir();
    }

    function solicitudesPendientes() {
        return solicitudes().filter(function (solicitud) {
            return solicitud.estado === "pendiente";
        });
    }

    function limpiarCambios(cambios) {
        const limpios = {};

        Object.keys(cambios || {}).forEach(function (campo) {
            if (!CAMPOS_EDITABLES.includes(campo)) {
                return;
            }

            const valor = cambios[campo];

            if (campo === "oferta") {
                limpios.oferta = {
                    activa: Boolean(valor && valor.activa),
                    descuento: Math.min(95, Math.max(0, Number(valor && valor.descuento) || 0))
                };
            } else if (campo === "margen") {
                limpios.margen = valor === null || valor === "" || !Number.isFinite(Number(valor))
                    ? null
                    : Number(valor);
            } else if (campo === "costoBase") {
                limpios.costoBase = Math.max(0, Number(valor) || 0);
            } else if (campo === "disponible") {
                limpios.disponible = Boolean(valor);
            } else {
                limpios[campo] = clonar(valor);
            }
        });

        return limpios;
    }

    function registrar(accion, detalle) {
        const lista = leerJSON(CLAVES.bitacora, []);
        const actual = sesion();

        const entradas = Array.isArray(lista) ? lista : [];
        entradas.unshift({
            id: nuevoId("b"),
            fecha: new Date().toISOString(),
            autor: actual ? actual.nombre : "Sistema",
            rol: actual ? actual.rol : "sistema",
            accion: accion,
            detalle: detalle
        });

        guardarJSON(CLAVES.bitacora, entradas.slice(0, 60));
    }

    function bitacora() {
        const lista = leerJSON(CLAVES.bitacora, []);
        return Array.isArray(lista) ? lista : [];
    }

    // El administrador aplica al instante; el gerente deja una solicitud.
    function proponerCambios(productoId, cambios, resumen) {
        const actual = sesion();
        if (!actual || (actual.rol !== "admin" && actual.rol !== "gerente")) {
            return { ok: false, mensaje: "Inicia sesión con un perfil autorizado." };
        }

        const producto = buscarProducto(productoId);
        if (!producto) {
            return { ok: false, mensaje: "Ese producto ya no existe." };
        }

        const limpios = limpiarCambios(cambios);

        // Las imágenes son territorio exclusivo del administrador.
        if (actual.rol === "gerente") {
            delete limpios.imagenesGaleria;
            delete limpios.imagenPrincipal;
        }

        if (!Object.keys(limpios).length) {
            return { ok: false, mensaje: "No hay cambios para guardar." };
        }

        if (actual.rol === "admin") {
            const respaldo = clonar(producto);
            Object.assign(producto, limpios);
            producto.actualizado = new Date().toISOString();

            if (!guardarCatalogo()) {
                // Si el navegador no puede guardar, la ficha vuelve como estaba.
                Object.assign(producto, respaldo);
                emitir();
                return { ok: false, mensaje: "No hay espacio en el navegador para guardar los cambios." };
            }

            registrar("edicion", `${producto.nombre}: ${resumen || "datos actualizados"}`);
            return { ok: true, aplicado: true, producto: producto };
        }

        const antes = {};
        Object.keys(limpios).forEach(function (campo) {
            antes[campo] = clonar(producto[campo] === undefined ? null : producto[campo]);
        });

        const solicitud = {
            id: nuevoId("s"),
            tipo: "editar",
            productoId: producto.id,
            productoNombre: producto.nombre,
            antes: antes,
            despues: limpios,
            resumen: resumen || "Cambios en el producto",
            autor: actual.nombre,
            rol: actual.rol,
            fecha: new Date().toISOString(),
            estado: "pendiente"
        };

        const listaSolicitudes = solicitudes();
        listaSolicitudes.unshift(solicitud);
        guardarSolicitudes(listaSolicitudes);

        return { ok: true, aplicado: false, solicitud: solicitud };
    }

    function crearProducto(datos) {
        if (!puede("productos.crear")) {
            return { ok: false, mensaje: "Solo el administrador puede crear productos." };
        }

        const lista = cargarProductos();
        const siguienteId = lista.reduce(function (mayor, producto) {
            return Math.max(mayor, Number(producto.id) || 0);
        }, 0) + 1;

        const nuevo = normalizarProducto(Object.assign({
            marca: "",
            nombre: "Producto sin nombre",
            categoria: "Juegos",
            descripcionLarga: "",
            especificacionesCortas: "",
            imagenPrincipal: "",
            imagenesGaleria: []
        }, datos, { id: siguienteId }));

        nuevo.creadoPor = sesion().nombre;
        nuevo.actualizado = new Date().toISOString();

        lista.push(nuevo);

        if (!guardarCatalogo()) {
            lista.splice(lista.indexOf(nuevo), 1);
            emitir();
            return { ok: false, mensaje: "No hay espacio en el navegador para guardar el producto." };
        }

        registrar("creacion", `${nuevo.nombre} (${nuevo.categoria})`);
        return { ok: true, producto: nuevo };
    }

    function eliminarProducto(id) {
        if (!puede("productos.eliminar")) {
            return { ok: false, mensaje: "Solo el administrador puede eliminar productos." };
        }

        const producto = buscarProducto(id);
        if (!producto) {
            return { ok: false, mensaje: "Ese producto ya no existe." };
        }

        producto.estado = "eliminado";
        producto.actualizado = new Date().toISOString();

        if (!guardarCatalogo()) {
            producto.estado = "activo";
            emitir();
            return { ok: false, mensaje: "No hay espacio en el navegador para guardar el cambio." };
        }

        registrar("eliminacion", producto.nombre);
        return { ok: true };
    }

    function restaurarProducto(id) {
        if (!puede("productos.eliminar")) {
            return { ok: false, mensaje: "Solo el administrador puede restaurar productos." };
        }

        const producto = buscarProducto(id);
        if (!producto) {
            return { ok: false, mensaje: "Ese producto ya no existe." };
        }

        producto.estado = "activo";
        producto.actualizado = new Date().toISOString();

        if (!guardarCatalogo()) {
            producto.estado = "eliminado";
            emitir();
            return { ok: false, mensaje: "No hay espacio en el navegador para guardar el cambio." };
        }

        registrar("restauracion", producto.nombre);
        return { ok: true };
    }

    function aplicarSolicitud(solicitud) {
        if (solicitud.tipo === "editar") {
            const producto = buscarProducto(solicitud.productoId);
            if (!producto) {
                return false;
            }

            Object.assign(producto, clonar(solicitud.despues));
            producto.actualizado = new Date().toISOString();
            return true;
        }

        return false;
    }

    function resolverSolicitud(id, estado) {
        if (!puede("solicitudes.aprobar")) {
            return { ok: false, mensaje: "Solo el administrador puede aprobar o rechazar." };
        }

        const lista = solicitudes();
        const solicitud = lista.find(function (elemento) {
            return elemento.id === id;
        });

        if (!solicitud || solicitud.estado !== "pendiente") {
            return { ok: false, mensaje: "Esa solicitud ya fue resuelta." };
        }

        if (estado === "aprobada" && !aplicarSolicitud(solicitud)) {
            return { ok: false, mensaje: "El producto de la solicitud ya no existe." };
        }

        solicitud.estado = estado;
        solicitud.resueltoPor = sesion().nombre;
        solicitud.fechaResolucion = new Date().toISOString();

        guardarSolicitudes(lista);
        guardarCatalogo();

        registrar(
            estado === "aprobada" ? "aprobacion" : "rechazo",
            `${solicitud.productoNombre || "Producto"}: ${solicitud.resumen} (${solicitud.autor})`
        );

        return { ok: true };
    }

    function guardarConfig(valores) {
        if (!puede("config.editar")) {
            return { ok: false, mensaje: "Solo el administrador cambia el margen global." };
        }

        const margen = Number(valores && valores.margenGlobal);
        if (!Number.isFinite(margen) || margen < 0 || margen > 300) {
            return { ok: false, mensaje: "El margen debe estar entre 0 % y 300 %." };
        }

        const guardado = guardarJSON(CLAVES.config, { margenGlobal: margen });
        if (!guardado) {
            return { ok: false, mensaje: "No hay espacio en el navegador para guardar la configuración." };
        }

        registrar("configuracion", `Margen global de ganancia: ${margen} %`);
        emitir();
        return { ok: true, config: config() };
    }

    // ---------------------------------------------------------------- utilidades

    function emitir() {
        try {
            document.dispatchEvent(new CustomEvent("tienda:actualizada"));
        } catch (error) {
            // En navegadores antiguos sin CustomEvent los cambios se ven al recargar.
        }
    }

    // En las páginas del catálogo se añade el acceso al panel junto a los iconos;
    // en la cuenta se agrega un enlace dentro del menú lateral.
    function montarEnlacesSesion() {
        const actual = sesion();
        const esGestor = actual && (actual.rol === "admin" || actual.rol === "gerente");

        if (!esGestor) {
            return;
        }

        const iconos = document.querySelector(".iconos-navegacion");
        if (iconos && !document.querySelector("#enlace-panel-tienda")) {
            const enlace = document.createElement("a");
            enlace.id = "enlace-panel-tienda";
            enlace.className = "boton-icono";
            enlace.href = "panel.html";
            enlace.title = "Panel de administración";
            enlace.setAttribute("aria-label", "Panel de administración");
            enlace.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>';
            iconos.insertBefore(enlace, iconos.firstChild);
        }

        const menuCuenta = document.querySelector(".menu-cuenta");
        if (menuCuenta && !document.querySelector("#enlace-panel-cuenta")) {
            const enlace = document.createElement("a");
            enlace.id = "enlace-panel-cuenta";
            enlace.href = "panel.html";
            enlace.setAttribute("data-panel", "true");

            const texto = document.createElement("span");
            texto.textContent = `Panel (${ROLES[actual.rol].etiqueta})`;

            const icono = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icono.setAttribute("viewBox", "0 0 24 24");
            icono.setAttribute("aria-hidden", "true");
            const trazo = document.createElementNS("http://www.w3.org/2000/svg", "path");
            trazo.setAttribute("d", "M12 3 4 6v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V6l-8-3Z");
            icono.append(trazo);

            enlace.append(texto, icono);
            menuCuenta.insertBefore(enlace, menuCuenta.firstChild);
        }
    }

    // Las páginas cargan este archivo antes que su propio script, así que los
    // datos ya están listos cuando se dibuja el catálogo.
    sembrarUsuarios();
    cargarProductos();

    window.Tienda = {
        claves: CLAVES,
        roles: ROLES,
        permisos: PERMISOS,
        usuarios: usuarios,
        iniciarSesion: iniciarSesion,
        cerrarSesion: cerrarSesion,
        sesion: sesion,
        puede: puede,
        productos: productos,
        producto: buscarProducto,
        config: config,
        margenDe: margenDe,
        precioLista: precioLista,
        precioVenta: precioVenta,
        precioConDescuento: precioConDescuento,
        descuentoDe: descuentoDe,
        ofertas: productosConOferta,
        proponerCambios: proponerCambios,
        crearProducto: crearProducto,
        eliminarProducto: eliminarProducto,
        restaurarProducto: restaurarProducto,
        guardarConfig: guardarConfig,
        solicitudes: solicitudes,
        solicitudesPendientes: solicitudesPendientes,
        aprobarSolicitud: function (id) { return resolverSolicitud(id, "aprobada"); },
        rechazarSolicitud: function (id) { return resolverSolicitud(id, "rechazada"); },
        bitacora: bitacora
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", montarEnlacesSesion);
    } else {
        montarEnlacesSesion();
    }
})();
