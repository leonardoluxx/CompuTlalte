// Núcleo de la tienda, ahora alimentado por MySQL a través de la API PHP.
// ---------------------------------------------------------------
// Los datos llegan sincrónicamente en window.DatosBD (los genera
// api/bootstrap.php consultando la base de datos), así que toda la
// interfaz existente sigue funcionando sin rehacerse.
// Las escrituras (panel, ventas, cuentas, solicitudes) viajan por
// fetch() a los endpoints de /api/ y luego se refresca la caché.
(function () {
    "use strict";

    const DatosBD = window.DatosBD || {};

    // Los tres roles del sistema y lo que puede hacer cada uno.
    const ROLES = {
        admin: {
            etiqueta: "Administrador",
            descripcion: "Control total: productos, imágenes, precios, ofertas, cuentas y aprobaciones."
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

    // Permisos por rol (el servidor los vuelve a validar en cada endpoint).
    const PERMISOS = {
        admin: [
            "panel", "productos.ver", "precios.ver", "productos.editar", "productos.crear",
            "productos.eliminar", "imagenes.editar", "ofertas.editar", "config.editar",
            "solicitudes.ver", "solicitudes.aprobar", "usuarios.ver", "usuarios.editar"
        ],
        gerente: [
            "panel", "productos.ver", "precios.ver", "productos.editar", "ofertas.editar",
            "solicitudes.ver"
        ],
        cliente: ["comprar"]
    };

    // ---------------------------------------------------------------- caché
    // Estado en memoria, sembrado por la base de datos en cada carga.
    let productosCache = Array.isArray(DatosBD.productos) ? DatosBD.productos : [];
    let configCache = Object.assign({ margenGlobal: 35 }, DatosBD.config || {});
    let sesionCache = DatosBD.sesion || null;
    let permisosCache = Array.isArray(DatosBD.permisos)
        ? DatosBD.permisos
        : (sesionCache ? (PERMISOS[sesionCache.rol] || []) : []);
    let usuariosCache = Array.isArray(DatosBD.usuarios) ? DatosBD.usuarios : [];
    let solicitudesCache = Array.isArray(DatosBD.solicitudes) ? DatosBD.solicitudes : [];
    let bitacoraCache = Array.isArray(DatosBD.bitacora) ? DatosBD.bitacora : [];
    // Reseñas del sitio y de productos: solo viajan para admin y gerente.
    let resenasSitioCache = DatosBD.resenasSitio || { promedio: 0, total: 0, lista: [] };
    let resenasProductosCache = DatosBD.resenasProductos || { total: 0, lista: [] };

    function emitir() {
        try {
            document.dispatchEvent(new CustomEvent("tienda:actualizada"));
        } catch (error) {
            // En navegadores antiguos sin CustomEvent los cambios se ven al recargar.
        }
    }

    // Reemplaza la caché con datos frescos del servidor.
    function aplicarDatos(datos) {
        if (Array.isArray(datos.productos)) {
            productosCache = datos.productos;
        }
        if (datos.config) {
            configCache = Object.assign({}, datos.config);
        }
        sesionCache = datos.sesion || null;
        permisosCache = Array.isArray(datos.permisos) ? datos.permisos : [];
        if (Array.isArray(datos.usuarios)) {
            usuariosCache = datos.usuarios;
        }
        if (Array.isArray(datos.solicitudes)) {
            solicitudesCache = datos.solicitudes;
        }
        if (Array.isArray(datos.bitacora)) {
            bitacoraCache = datos.bitacora;
        }
        if (datos.resenasSitio) {
            resenasSitioCache = datos.resenasSitio;
        }
        if (datos.resenasProductos) {
            resenasProductosCache = datos.resenasProductos;
        }

        aplicarImagenes();
    }

    // Convierte una ruta guardada en la base de datos (ej. "imagenes/...")
    // en una URL que el navegador resuelve bien desde cualquier página: las
    // rutas relativas se anclan a la raíz del sitio y las que ya son absolutas
    // (http://, //, data:) pasan intactas. Así las imágenes siempre se encuentran.
    function construirRutaImagen(ruta) {
        const limpia = String(ruta || "").trim();

        if (!limpia) {
            return "";
        }

        // Ya es una URL completa (o un recurso incrustado): no se toca.
        if (/^(https?:)?\/\//i.test(limpia) || /^(data|blob):/i.test(limpia) || limpia.charAt(0) === "/") {
            return limpia;
        }

        return new URL(limpia, document.baseURI).href;
    }

    // Imágenes configurables de la tienda: el administrador las cambia desde
    // el panel o con el botón de lápiz, y aquí se aplican sin recargar la
    // página mediante variables CSS. Sin imagen configurada, cada sección
    // conserva el diseño predeterminado.
    function aplicarImagenes() {
        const raiz = document.documentElement;
        const mapa = [
            ["heroImagen", "--imagen-anuncio", null],
            ["imagenComputadoras", "--fondo-seccion-computadoras", "linear-gradient(rgb(10 10 10 / 86%), rgb(10 10 10 / 86%))"],
            ["imagenAccesorios", "--fondo-banner-accesorios", "linear-gradient(to right, rgb(0 0 0 / 92%), rgb(0 0 0 / 8%))"],
            ["imagenOfertas", "--fondo-banner-ofertas", null]
        ];

        mapa.forEach(function (item) {
            const clave = item[0];
            const variable = item[1];
            const degradado = item[2];
            const imagen = String(configCache[clave] || "");

            if (!imagen) {
                raiz.style.removeProperty(variable);
                return;
            }

            // URL absoluta (construirRutaImagen) para que el navegador no la
            // resuelva contra la carpeta css/ (donde viven las hojas que
            // consumen las variables).
            const absoluta = construirRutaImagen(imagen);
            const valor = degradado
                ? `${degradado}, url("${absoluta}")`
                : `url("${absoluta}")`;

            raiz.style.setProperty(variable, valor);
        });
    }

    // Vuelve a pedir el paquete completo a la API y redibuja la página.
    async function refrescar() {
        const respuesta = await fetch("api/datos.php", { headers: { "Accept": "application/json" } });
        if (!respuesta.ok) {
            throw new Error("El servidor respondió " + respuesta.status + ".");
        }

        const datos = await respuesta.json();
        if (!datos.ok) {
            throw new Error(datos.mensaje || "No se pudo refrescar el catálogo.");
        }

        aplicarDatos(datos);
        emitir();
        return datos;
    }

    // Pide un token CSRF vigente a la API y actualiza el <meta> de la página.
    // Se usa cuando el servidor rechaza la operación por token vencido.
    async function renovarTokenCsrf() {
        try {
            const respuesta = await fetch("api/csrf.php", { headers: { "Accept": "application/json" } });
            const datos = await respuesta.json();
            if (respuesta.ok && datos.ok && datos.csrf) {
                let meta = document.querySelector('meta[name="csrf-token"]');
                if (!meta) {
                    meta = document.createElement("meta");
                    meta.name = "csrf-token";
                    document.head.appendChild(meta);
                }
                meta.content = datos.csrf;
            }
        } catch (error) {
            // Si no se pudo renovar, se reintenta con el token ya conocido.
        }
        return document.querySelector('meta[name="csrf-token"]')?.content || "";
    }

    // Petición POST con JSON; siempre devuelve { ok, ... } para no romper
    // a quien llama, aunque el servidor esté caído.
    async function peticion(url, cuerpo) {
        // CSRF token desde meta tag (inyectado por bootstrap.php o layout)
        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";

        for (let intento = 0; intento < 2; intento++) {
            try {
                const headers = { "Content-Type": "application/json" };
                if (csrfToken) {
                    headers["X-CSRF-Token"] = csrfToken;
                }
                const respuesta = await fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ ...cuerpo, csrf: csrfToken })
                });

                const datos = await respuesta.json();
                if (!respuesta.ok || !datos.ok) {
                    // Token vencido (p. ej. la sesión se renovó en otra
                    // pestaña): se pide uno nuevo y se reintenta UNA vez en
                    // automático, sin obligar a recargar la página.
                    if (intento === 0 && (respuesta.status === 403 || /CSRF/i.test((datos && datos.mensaje) || ""))) {
                        csrfToken = await renovarTokenCsrf();
                        continue;
                    }
                    return { ok: false, mensaje: datos.mensaje || "El servidor rechazó la operación." };
                }

                return datos;
            } catch (error) {
                return {
                    ok: false,
                    mensaje: "No se pudo conectar con el servidor. Verifica que XAMPP (Apache y MySQL) esté corriendo."
                };
            }
        }
    }

    // ------------------------------------------------- lectura (síncrona)
    function productos(opciones) {
        const incluirEliminados = Boolean(opciones && opciones.incluirEliminados);
        return productosCache.filter(function (producto) {
            return incluirEliminados || producto.estado !== "eliminado";
        });
    }

    function producto(id) {
        return productosCache.find(function (item) {
            return Number(item.id) === Number(id);
        }) || null;
    }

    function ofertas() {
        return productos().filter(function (producto) {
            return descuentoDe(producto) > 0;
        });
    }

    function config() {
        return Object.assign({}, configCache);
    }

    // Margen efectivo del producto (propio o global); ya viene de la BD.
    function margenDe(producto) {
        return Number(producto && producto.margenAplicado) || 0;
    }

    // Precio de lista: guardado en la BD, ya calculado con el margen.
    function precioLista(producto) {
        return Math.round(Number(producto && producto.precioLista) || 0);
    }

    // Precio que ve el cliente: lista menos la oferta vigente.
    function precioVenta(producto) {
        return Math.round(Number(producto && producto.precioVenta) || 0);
    }

    function precioConDescuento(producto, descuento) {
        const porcentaje = Number(descuento) || 0;
        return Math.round(precioLista(producto) * (1 - porcentaje / 100));
    }

    function descuentoDe(producto) {
        return Number(producto && producto.descuento) || 0;
    }

    function usuarios() {
        return usuariosCache.slice();
    }

    function solicitudes() {
        return solicitudesCache.slice();
    }

    function solicitudesPendientes() {
        return solicitudesCache.filter(function (solicitud) {
            return solicitud.estado === "pendiente";
        });
    }

    function bitacora() {
        return bitacoraCache.slice();
    }

    // Encuesta del sitio tal como la verá el panel (admin y gerente).
    function resenasSitio() {
        return {
            promedio: Number(resenasSitioCache.promedio) || 0,
            total: Number(resenasSitioCache.total) || 0,
            lista: Array.isArray(resenasSitioCache.lista) ? resenasSitioCache.lista.slice() : []
        };
    }

    // Últimas reseñas de productos, también para el panel.
    function resenasProductos() {
        return {
            total: Number(resenasProductosCache.total) || 0,
            lista: Array.isArray(resenasProductosCache.lista) ? resenasProductosCache.lista.slice() : []
        };
    }

    function sesion() {
        return sesionCache ? Object.assign({}, sesionCache) : null;
    }

    function puede(accion) {
        return permisosCache.includes(accion);
    }

    // --------------------------------------------- escrituras (asíncronas)
    // El administrador aplica al instante; el gerente deja una solicitud
    // que el administrador aprueba o rechaza (última palabra).
    async function proponerCambios(productoId, cambios, resumen) {
        const resultado = await peticion("api/productos.php", {
            accion: "guardar",
            id: productoId,
            cambios: cambios,
            resumen: resumen
        });

        if (resultado.ok) {
            await refrescar();
        }

        return resultado;
    }

    async function crearProducto(datos) {
        const resultado = await peticion("api/productos.php", {
            accion: "crear",
            producto: datos
        });

        if (resultado.ok) {
            await refrescar();
        }

        return resultado;
    }

    async function eliminarProducto(id) {
        const resultado = await peticion("api/productos.php", { accion: "eliminar", id: id });
        if (resultado.ok) {
            await refrescar();
        }
        return resultado;
    }

    async function restaurarProducto(id) {
        const resultado = await peticion("api/productos.php", { accion: "restaurar", id: id });
        if (resultado.ok) {
            await refrescar();
        }
        return resultado;
    }

    // Margen global: la API recalcula el precio_final de todos los productos.
    async function guardarConfig(valores) {
        const resultado = await peticion("api/configuracion.php", {
            margenGlobal: Number(valores && valores.margenGlobal)
        });

        if (resultado.ok) {
            await refrescar();
        }

        return resultado;
    }

    // Guarda la imagen de una sección (portada, computadoras, accesorios,
    // ofertas) en la tabla configuracion; la tienda la aplica sola.
    async function guardarImagenConfig(clave, imagen) {
        const resultado = await peticion("api/configuracion.php", { clave: clave, imagen: imagen });

        if (resultado.ok) {
            await refrescar();
        }

        return resultado;
    }

    async function aprobarSolicitud(id) {
        const resultado = await peticion("api/solicitudes.php", { id: id, accion: "aprobar" });
        if (resultado.ok) {
            await refrescar();
        }
        return resultado;
    }

    // Limpia la bitácora de movimientos (solo administrador).
    async function limpiarBitacora() {
        const resultado = await peticion("api/bitacora.php", { accion: "limpiar" });
        if (resultado.ok) {
            await refrescar();
        }
        return resultado;
    }

    async function rechazarSolicitud(id) {
        const resultado = await peticion("api/solicitudes.php", { id: id, accion: "rechazar" });
        if (resultado.ok) {
            await refrescar();
        }
        return resultado;
    }

    // Gestión de cuentas del sistema (solo administrador).
    async function actualizarRolUsuario(id, rol) {
        const resultado = await peticion("api/usuarios.php", { accion: "rol", id: id, rol: rol });
        if (resultado.ok) {
            await refrescar();
        }
        return resultado;
    }

    async function eliminarUsuario(id) {
        const resultado = await peticion("api/usuarios.php", { accion: "eliminar", id: id });
        if (resultado.ok) {
            await refrescar();
        }
        return resultado;
    }

    // Cierra la sesión en el servidor y limpia las huellas locales antiguas.
    function cerrarSesion() {
        ["sesionIniciada", "usuario", "usuarioNombre", "usuarioRol"].forEach(function (clave) {
            try {
                window.localStorage.removeItem(clave);
            } catch (error) {
                // Sin almacenamiento no hay sesión que borrar.
            }
        });

        fetch("api/sesion.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "salir" })
        }).catch(function () {
            // Si el servidor no responde, la sesión local ya se limpió.
        });
    }

    // En las páginas del catálogo se añade el acceso al panel junto a los
    // iconos; en la cuenta se agrega un enlace dentro del menú lateral.
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

    // La API ya entregó los datos (bootstrap.php corre antes que este
    // archivo), así que el núcleo está listo de inmediato.
    aplicarImagenes();

    // ------------------------------------------------ conexión obligatoria
    // La tienda trabaja SIEMPRE con datos de MySQL: si api/bootstrap.php no
    // llegó (Apache o MySQL apagados) la página se avisa en pantalla y se
    // reintenta automáticamente hasta reconectar. Nunca se muestra una
    // tienda vacía en silencio ni se recurre a datos locales de respaldo.
    function crearAvisoConexion() {
        const aviso = document.createElement("div");
        aviso.id = "aviso-sin-conexion";
        aviso.setAttribute("role", "alert");
        aviso.style.cssText = "position:fixed;left:16px;right:16px;top:16px;z-index:9999;"
            + "display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:14px 18px;"
            + "background:#2b0d13;border:1px solid #ff0033;border-radius:10px;color:#ffd9de;"
            + "font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 12px 40px rgb(0 0 0 / 55%);";

        const texto = document.createElement("span");
        texto.style.cssText = "flex:1;min-width:220px;line-height:1.5;";
        texto.textContent = "No hay conexión con la base de datos. Verifica que XAMPP "
            + "(Apache y MySQL) esté encendido: la tienda se reconectará sola en cuanto vuelva.";

        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "Reintentar ahora";
        boton.style.cssText = "padding:8px 16px;border:0;border-radius:7px;background:#ff0033;"
            + "color:#fff;font-weight:700;font-size:14px;cursor:pointer;";
        boton.addEventListener("click", reconectar);

        aviso.append(texto, boton);
        document.body.appendChild(aviso);
        return aviso;
    }

    // Vuelve a pedir el paquete completo a la API. Devuelve true si MySQL
    // respondió con datos (aunque la base esté recién instalada y vacía).
    async function reconectar() {
        try {
            await refrescar();
            return true;
        } catch (error) {
            return false;
        }
    }

    function vigilarConexion() {
        // bootstrap.php entregó el paquete: la conexión ya está garantizada.
        if (Array.isArray(DatosBD.productos)) {
            return;
        }

        let aviso = null;
        let temporizador = null;

        async function intentar() {
            const conectada = await reconectar();
            if (conectada) {
                clearInterval(temporizador);
                if (aviso) {
                    aviso.remove();
                    aviso = null;
                }
            } else if (!aviso || !aviso.isConnected) {
                aviso = crearAvisoConexion();
            }
        }

        if (document.body) {
            intentar();
            temporizador = setInterval(intentar, 5000);
        }
    }

    vigilarConexion();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", montarEnlacesSesion);
    } else {
        montarEnlacesSesion();
    }

    window.Tienda = {
        claves: {},
        roles: ROLES,
        permisos: PERMISOS,
        usuarios: usuarios,
        actualizarRolUsuario: actualizarRolUsuario,
        eliminarUsuario: eliminarUsuario,
        iniciarSesion: null, // el login ahora habla directo con api/login.php
        cerrarSesion: cerrarSesion,
        sesion: sesion,
        puede: puede,
        productos: productos,
        producto: producto,
        config: config,
        margenDe: margenDe,
        precioLista: precioLista,
        precioVenta: precioVenta,
        precioConDescuento: precioConDescuento,
        descuentoDe: descuentoDe,
        ofertas: ofertas,
        proponerCambios: proponerCambios,
        crearProducto: crearProducto,
        eliminarProducto: eliminarProducto,
        restaurarProducto: restaurarProducto,
        guardarConfig: guardarConfig,
        solicitudes: solicitudes,
        solicitudesPendientes: solicitudesPendientes,
        aprobarSolicitud: aprobarSolicitud,
        rechazarSolicitud: rechazarSolicitud,
        limpiarBitacora: limpiarBitacora,
        bitacora: bitacora,
        resenasSitio: resenasSitio,
        resenasProductos: resenasProductos,
        guardarImagenConfig: guardarImagenConfig,
        construirRutaImagen: construirRutaImagen,
        refrescar: refrescar
    };
})();
