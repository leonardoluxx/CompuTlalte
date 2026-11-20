/* =========================================================
   scripts-login-cinematico.js
   ---------------------------------------------------------
   Experiencia de acceso en tres caras, sin recargar la página:
   1) Formulario con medidor de fuerza de contraseña en vivo.
   2) Verificación animada: spinner → palomita.
   3) Panel de permisos según el rol (Admin, Gerente, Cliente).
   Las credenciales se validan contra la base de datos MySQL a
   través de api/login.php; la sesión vive en el servidor (PHP).
   ========================================================= */
(function () {
    "use strict";

    // ---------- Elementos de la página ----------
    const formulario = document.getElementById("formulario");
    const correo = document.getElementById("correo");
    const clave = document.getElementById("clave");
    const mensaje = document.getElementById("mensaje");
    const verClave = document.getElementById("ver-clave");
    const botonEntrar = document.getElementById("entrar");
    const tarjeta = document.getElementById("tarjeta-acceso");

    // Las tres caras de la tarjeta de acceso.
    const caraFormulario = document.getElementById("cara-formulario");
    const caraVerificacion = document.getElementById("cara-verificacion");
    const caraSesion = document.getElementById("cara-sesion");
    const textoVerificacion = document.getElementById("texto-verificacion");

    // Medidor de fuerza de la contraseña.
    const medidor = document.getElementById("medidor-clave");
    const relleno = document.getElementById("relleno-clave");
    const etiquetaFuerza = document.getElementById("etiqueta-clave");

    // Vista de sesión por rol.
    const distintivoRol = document.getElementById("distintivo-rol");
    const nombreRol = document.getElementById("nombre-rol");
    const descripcionRol = document.getElementById("descripcion-rol");
    const listaPermisos = document.getElementById("lista-permisos");
    const enlaceDestino = document.getElementById("enlace-destino");
    const botonSalir = document.getElementById("salir-sesion");

    // Recuperación de contraseña (la solicitud la aprueba el administrador).
    const botonOlvidaste = document.getElementById("olvidaste-clave");
    const modalRecuperacion = document.getElementById("modal-recuperacion");
    const formularioRecuperacion = document.getElementById("formulario-recuperacion");
    const correoRecuperacion = document.getElementById("correo-recuperacion");
    const razonRecuperacion = document.getElementById("razon-recuperacion");
    const mensajeRecuperacion = document.getElementById("mensaje-recuperacion");
    const estadoRecuperacion = document.getElementById("estado-recuperacion");
    const estadoSolicitudClave = document.getElementById("estado-solicitud-clave");
    const botonEnviarRecuperacion = document.getElementById("enviar-recuperacion");
    const botonCerrarRecuperacion = document.getElementById("cerrar-recuperacion");

    const CLAVE_SOLICITUD = "computlalte-recuperacion";
    // Ficha secreta de la solicitud: permite consultar el estado (y recibir
    // la contraseña temporal) sin depender de la sesión de PHP, que el
    // servidor puede caducar antes de que el administrador responda.
    const CLAVE_TOKEN = "computlalte-recuperacion-token";
    // Sondeo silencioso cada 5 segundos mientras la solicitud esté abierta.
    const INTERVALO_POLLING = 5000;

    // Estado del sondeo (una sola consulta a la vez por pestaña).
    let temporizadorPolling = null;
    let consultaEnCurso = false;
    let emailEnSeguimiento = "";

    // Con movimiento reducido las animaciones se acortan casi a cero.
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- Mostrar / ocultar contraseña ----------
    verClave.addEventListener("click", () => {
        const estaOculta = clave.type === "password";
        clave.type = estaOculta ? "text" : "password";
        verClave.textContent = estaOculta ? "Ocultar" : "Mostrar";
        clave.focus();
    });

    // ---------- Medidor de fuerza en tiempo real ----------
    // Contraseñas demasiado conocidas: siempre se marcan débiles.
    const CLAVES_COMUNES = ["password", "123456", "computlalte", "qwerty", "contrasena"];

    // Cuatro niveles de seguridad con etiquetas progresivas.
    const NIVELES = [
        { clase: "nivel-debil", texto: "Débil" },
        { clase: "nivel-media", texto: "Media" },
        { clase: "nivel-alta", texto: "Alta" },
        { clase: "nivel-elite", texto: "Élite" }
    ];

    // Devuelve una puntuación de 0 a 100 según largo y variedad.
    function evaluarFuerza(texto) {
        if (!texto) {
            return 0;
        }

        // Las contraseñas muy comunes nunca pasan de débiles.
        if (CLAVES_COMUNES.some((comun) => texto.toLowerCase().includes(comun))) {
            return 18;
        }

        // Largo (hasta 12 caracteres cuentan) ...
        let puntos = Math.min(texto.length, 12) * 4; // hasta 48

        // ... variedad de caracteres ...
        if (/[a-z]/.test(texto) && /[A-Z]/.test(texto)) {
            puntos += 16; // mezcla de mayúsculas y minúsculas
        }
        if (/[0-9]/.test(texto)) {
            puntos += 14;
        }
        if (/[^a-zA-Z0-9]/.test(texto)) {
            puntos += 16; // símbolos
        }

        // ... y bonos por longitud considerable.
        if (texto.length >= 10) {
            puntos += 6;
        }
        if (texto.length >= 14) {
            puntos += 6;
        }

        // Un solo tipo de carácter nunca pasa de débil.
        const soloMinusculas = /^[a-z]+$/.test(texto);
        const soloNumeros = /^[0-9]+$/.test(texto);
        if (soloMinusculas || soloNumeros) {
            puntos = Math.min(puntos, 24);
        }

        return Math.max(0, Math.min(100, puntos));
    }

    // Traduce la puntuación a uno de los tres niveles.
    function nivelDe(puntos) {
        if (puntos < 30) {
            return 0; // Débil
        }
        if (puntos < 55) {
            return 1; // Media
        }
        if (puntos < 80) {
            return 2; // Alta
        }
        return 3; // Élite
    }

    clave.addEventListener("input", () => {
        const texto = clave.value;

        // Sin texto no hay medidor: se oculta por completo.
        if (!texto) {
            medidor.hidden = true;
            return;
        }

        const puntos = evaluarFuerza(texto);
        const datos = NIVELES[nivelDe(puntos)];

        medidor.hidden = false;
        relleno.className = `relleno-clave ${datos.clase}`;
        relleno.style.width = `${Math.max(puntos, 8)}%`;
        etiquetaFuerza.className = `etiqueta-clave ${datos.clase}`;
        etiquetaFuerza.textContent = `Seguridad: ${datos.texto}`;
    });

    // ---------- Cambio de caras de la tarjeta ----------
    function mostrarCara(cara) {
        [caraFormulario, caraVerificacion, caraSesion].forEach((elemento) => {
            elemento.hidden = elemento !== cara;
        });
    }

    // ---------- Permisos traducidos a lenguaje claro ----------
    const ETIQUETAS_PERMISOS = {
        "panel": "Acceso al panel de control",
        "productos.ver": "Ver el catálogo completo",
        "precios.ver": "Ver precios y márgenes",
        "productos.editar": "Editar productos",
        "productos.crear": "Crear productos nuevos",
        "productos.eliminar": "Eliminar y restaurar productos",
        "imagenes.editar": "Gestionar imágenes del catálogo",
        "ofertas.editar": "Activar y ajustar ofertas",
        "config.editar": "Configurar el margen global",
        "solicitudes.ver": "Revisar solicitudes de cambio",
        "solicitudes.aprobar": "Aprobar o rechazar solicitudes",
        "usuarios.ver": "Consultar cuentas registradas",
        "usuarios.editar": "Cambiar roles y eliminar cuentas",
        "comprar": "Comprar en la tienda"
    };

    // Destino natural de cada rol al continuar la sesión.
    const DESTINOS = {
        admin: { url: "panel.html", texto: "Ir al panel de control" },
        gerente: { url: "panel.html", texto: "Ir al panel de control" },
        cliente: { url: "index.html", texto: "Ir a la tienda" }
    };

    const ETIQUETAS_ROL = {
        admin: "Administrador",
        gerente: "Gerente",
        cliente: "Cliente"
    };

    const DESCRIPCIONES_ROL = {
        admin: "Control total: productos, imágenes, precios, ofertas, cuentas y aprobaciones.",
        gerente: "Consulta y propone cambios de productos, precios y ofertas; el administrador los aprueba.",
        cliente: "Consulta el catálogo y compra. Nunca ve el costo base ni el panel."
    };

    // Dibuja la cara de sesión: distintivo, descripción y permisos del rol.
    function dibujarSesion(usuario, permisos) {
        const rol = usuario.rol;

        distintivoRol.className = `distintivo-rol rol-${rol}`;
        distintivoRol.textContent = ETIQUETAS_ROL[rol] || rol;
        nombreRol.textContent = usuario.nombre || usuario.email;
        descripcionRol.textContent = DESCRIPCIONES_ROL[rol] || "";

        // Cada permiso llega con su palomita y un pequeño retardo en
        // cascada (la variable --indice alimenta la animación del CSS).
        listaPermisos.replaceChildren(...(permisos || []).map((permiso, indice) => {
            const elemento = document.createElement("li");
            elemento.style.setProperty("--indice", String(indice));

            const icono = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icono.setAttribute("viewBox", "0 0 24 24");
            icono.setAttribute("aria-hidden", "true");
            const trazo = document.createElementNS("http://www.w3.org/2000/svg", "path");
            trazo.setAttribute("d", "m5 13 4 4 10-11");
            icono.append(trazo);

            const texto = document.createElement("span");
            texto.textContent = ETIQUETAS_PERMISOS[permiso] || permiso;

            elemento.append(icono, texto);
            return elemento;
        }));

        const destino = DESTINOS[rol] || DESTINOS.cliente;
        enlaceDestino.href = destino.url;
        enlaceDestino.textContent = destino.texto;
    }

    // ---------- Envío del formulario ----------
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const identificador = correo.value.trim();
        const contrasena = clave.value;

        if (!identificador || !contrasena) {
            mensaje.textContent = "Escribe tu correo y tu contraseña.";
            return;
        }

        mensaje.textContent = "";
        botonEntrar.disabled = true;

        let respuesta;
        try {
            respuesta = await fetch("api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identificador: identificador, password: contrasena })
            });
        } catch (error) {
            botonEntrar.disabled = false;
            mensaje.textContent = "No se pudo conectar con el servidor. Verifica que XAMPP esté corriendo.";
            return;
        }

        botonEntrar.disabled = false;

        let resultado;
        try {
            resultado = await respuesta.json();
        } catch (error) {
            resultado = { ok: false, mensaje: "Respuesta inválida del servidor." };
        }

        if (!respuesta.ok || !resultado.ok) {
            mensaje.textContent = resultado.mensaje || "No se pudo iniciar sesión.";
            clave.value = "";
            medidor.hidden = true;
            clave.focus();

            // Sacudida breve de la tarjeta: error notorio sin brutalidad.
            if (!movimientoReducido) {
                tarjeta.classList.remove("sacudir");
                void tarjeta.offsetWidth; // reinicia la animación
                tarjeta.classList.add("sacudir");
            }
            return;
        }

        // ¿Venía de otra página (carrito, pago, panel)? Se respeta ese destino.
        let redirigir = null;
        try {
            redirigir = localStorage.getItem("redirigirTrasLogin");
            localStorage.removeItem("redirigirTrasLogin");
        } catch (error) {
            // Sin almacenamiento se muestra el panel del rol.
        }

        entrarConAnimacion(resultado.usuario, resultado.permisos, redirigir, resultado.usuario.debeCambiarClave);
    });

    // Secuencia cinemática: spinner → palomita → permisos del rol.
    function entrarConAnimacion(usuario, permisos, redirigir, debeCambiarClave) {
        // Si el acceso se resolvió, ya no hay solicitud que vigilar.
        detenerPolling();

        mostrarCara(caraVerificacion);
        caraVerificacion.classList.remove("confirmada");
        textoVerificacion.textContent = "Verificando credenciales…";

        // Duraciones: casi instantáneo si el sistema pide menos movimiento.
        const milisVerificacion = movimientoReducido ? 150 : 950;
        const milisPalomita = movimientoReducido ? 150 : 700;

        window.setTimeout(() => {
            // El anillo se completa en verde y la palomita se dibuja.
            caraVerificacion.classList.add("confirmada");
            textoVerificacion.textContent = "Acceso confirmado";

            window.setTimeout(() => {
                // Contraseña temporal del administrador: el cambio es
                // obligatorio y tiene prioridad sobre cualquier destino.
                if (debeCambiarClave) {
                    window.location.href = "cuenta.html?cambiar=1";
                    return;
                }

                if (redirigir) {
                    // El destino se resuelve con la lista central de páginas
                    // (js/navegacion.js): acepta la clave corta ("cuenta") o
                    // el archivo ("cuenta.html") y nunca manda el navegador a
                    // una dirección sin .html. Si el valor no corresponde a
                    // ninguna página conocida, se muestra la tarjeta de sesión.
                    const destinoResuelto = window.Navegacion ? Navegacion.destino(redirigir) : null;

                    if (destinoResuelto) {
                        window.location.href = destinoResuelto;
                        return;
                    }
                }

                // Sin destino pendiente: la tarjeta muestra los permisos
                // del rol sin recargar la página.
                dibujarSesion(usuario, permisos);
                mostrarCara(caraSesion);
            }, milisPalomita);
        }, milisVerificacion);
    }

    // ---------- Salir de la vista de sesión ----------
    botonSalir.addEventListener("click", async () => {
        try {
            await fetch("api/sesion.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "salir" })
            });
        } catch (error) {
            // Aunque el servidor no responda, volvemos al formulario.
        }

        clave.value = "";
        medidor.hidden = true;
        mensaje.textContent = "";
        caraVerificacion.classList.remove("confirmada");
        mostrarCara(caraFormulario);
        correo.focus();
    });

    // ---------- Chips de acceso de prueba ----------
    // Un clic llena el formulario con la cuenta elegida.
    document.querySelectorAll(".chip-credencial").forEach((chip) => {
        chip.addEventListener("click", () => {
            correo.value = chip.dataset.usuario || "";
            clave.value = chip.dataset.clave || "";
            clave.dispatchEvent(new Event("input")); // el medidor reacciona igual
            mensaje.textContent = "";
            botonEntrar.focus();
        });
    });

    // ------------------------------------- recuperación de contraseña
    // La solicitud se guarda como pendiente y el administrador la aprueba
    // desde el panel. LocalStorage recuerda el correo y su estado para que
    // el visitante vea en qué va sin volver a escribir todo.
    function leerSolicitudLocal() {
        try {
            return JSON.parse(localStorage.getItem(CLAVE_SOLICITUD) || "null");
        } catch (error) {
            return null;
        }
    }

    function guardarSolicitudLocal(datos) {
        try {
            // Se mezcla con lo guardado: la ficha (token), la contraseña
            // temporal y el aviso ya mostrado no se pierden al actualizar
            // solo el estado.
            const previos = leerSolicitudLocal() || {};
            localStorage.setItem(CLAVE_SOLICITUD, JSON.stringify(Object.assign({}, previos, datos)));
        } catch (error) {
            // Sin almacenamiento el estado igual se consulta al servidor.
        }
    }

    function leerToken() {
        try {
            return localStorage.getItem(CLAVE_TOKEN) || "";
        } catch (error) {
            return "";
        }
    }

    function guardarToken(token) {
        try {
            if (token) {
                localStorage.setItem(CLAVE_TOKEN, token);
            }
        } catch (error) {
            // Sin almacenamiento la consulta de estado sigue funcionando,
            // solo que sin poder recibir la contraseña temporal.
        }
    }

    function marcarNotificada(estado) {
        const guardada = leerSolicitudLocal() || {};
        guardarSolicitudLocal({
            email: guardada.email || emailEnSeguimiento,
            estado: guardada.estado || estado,
            fecha: guardada.fecha || "",
            claveTemporal: guardada.claveTemporal || "",
            notificada: estado
        });
    }

    // Aviso flotante de reserva: si notificaciones.js no está disponible
    // (o el CSS no cargó), el mensaje igual se ve. Nunca deja al usuario
    // sin enterarse de que su solicitud cambió de estado.
    function avisoMinimo(titulo, texto, tono) {
        const caja = document.createElement("div");
        caja.setAttribute("role", "alert");
        caja.style.cssText = [
            "position:fixed", "right:18px", "bottom:18px", "z-index:2147483647",
            "max-width:min(420px,calc(100vw - 36px))", "padding:16px 40px 16px 18px",
            "border-radius:12px", "border:1px solid " + (tono === "error" ? "#ff0033" : "#2fbf7a"),
            "background:#141414", "color:#f5f5f5", "font:14px/1.6 'Segoe UI',system-ui,sans-serif",
            "box-shadow:0 18px 44px rgba(0,0,0,.6)", "white-space:pre-line"
        ].join(";");

        const fuerte = document.createElement("strong");
        fuerte.textContent = titulo;
        fuerte.style.cssText = "display:block;margin-bottom:6px;font-size:15px";

        const cuerpo = document.createElement("span");
        cuerpo.textContent = texto;

        const cerrar = document.createElement("button");
        cerrar.type = "button";
        cerrar.setAttribute("aria-label", "Cerrar aviso");
        cerrar.textContent = "\u00d7";
        cerrar.style.cssText = "position:absolute;top:8px;right:10px;background:none;border:0;"
            + "color:#a3a3a3;font-size:20px;line-height:1;cursor:pointer";
        cerrar.addEventListener("click", function () {
            caja.remove();
        });

        caja.append(fuerte, cuerpo, cerrar);
        document.body.appendChild(caja);
        window.setTimeout(function () {
            caja.remove();
        }, 15000);
    }

    function avisar(titulo, texto, tono, esModal) {
        if (window.Notificaciones) {
            if (esModal) {
                window.Notificaciones.tarjeta({
                    tipo: tono || "exito",
                    titulo: titulo,
                    texto: texto,
                    textoBoton: "Entendido"
                });
            } else {
                window.Notificaciones.toast({
                    tipo: tono || "info",
                    titulo: titulo,
                    texto: texto,
                    duracion: 12000
                });
            }
            return;
        }

        avisoMinimo(titulo, texto, tono);
    }

    function pintarEstadoSolicitud(estado, email) {
        const textos = {
            pendiente: "Solicitud pendiente. El administrador la revisará y te avisará.",
            aprobada: "¡Solicitud aprobada! Inicia sesión con la contraseña temporal que te compartió el administrador.",
            rechazada: "Solicitud rechazada. Contacta al administrador para revisar tu caso."
        };
        const texto = textos[estado] || "";
        const clase = "estado-solicitud-clave" + (estado ? " estado-" + estado : "");

        [estadoSolicitudClave, estadoRecuperacion].forEach(function (elemento) {
            if (!elemento) {
                return;
            }
            elemento.textContent = texto;
            elemento.className = clase;
            elemento.hidden = texto === "";
        });

        if (texto && email) {
            estadoSolicitudClave.dataset.email = email;
        }
    }

    async function obtenerTokenCsrf() {
        try {
            const respuesta = await fetch("api/csrf.php", {
                headers: { "Accept": "application/json" }
            });
            const datos = await respuesta.json();
            return respuesta.ok && datos.ok ? (datos.csrf || "") : "";
        } catch (error) {
            return "";
        }
    }

    async function enviarSolicitudRecuperacion(email, razon) {
        for (let intento = 0; intento < 2; intento += 1) {
            const token = await obtenerTokenCsrf();
            let respuesta;

            try {
                respuesta = await fetch("api/recuperar_password.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": token
                    },
                    body: JSON.stringify({ email: email, razon: razon, csrf: token })
                });
            } catch (error) {
                return { ok: false, mensaje: "No se pudo conectar con el servidor. Intenta de nuevo." };
            }

            const datos = await respuesta.json().catch(function () {
                return { ok: false, mensaje: "Respuesta inválida del servidor." };
            });

            // Token vencido: se renueva y se reintenta una sola vez.
            if (respuesta.status === 403 && intento === 0) {
                continue;
            }

            return {
                ok: respuesta.ok && datos.ok,
                mensaje: datos.mensaje || "No se pudo enviar la solicitud.",
                estado: datos.estado || "pendiente",
                token: datos.token || ""
            };
        }

        return { ok: false, mensaje: "No se pudo validar la seguridad de la sesión. Recarga la página." };
    }

    // Refresca el estado con el servidor: si el admin aprobó, el visitante
    // lo ve en cuanto vuelve a esta página.
    //
    // Sondeo en tiempo real (polling): mientras la solicitud esté abierta,
    // la página pregunta al servidor cada 5 segundos. Cuando el estado cambia
    // se avisa al instante, sin necesidad de recargar.
    function detenerPolling() {
        if (temporizadorPolling !== null) {
            window.clearInterval(temporizadorPolling);
            temporizadorPolling = null;
        }
    }

    function iniciarPolling(email) {
        if (!email) {
            return;
        }

        emailEnSeguimiento = email;

        // Comprobación inmediata: el usuario ve el estado real sin esperar
        // los primeros 5 segundos.
        consultarEstadoSolicitud();

        if (temporizadorPolling !== null) {
            return; // ya hay un sondeo activo
        }

        temporizadorPolling = window.setInterval(consultarEstadoSolicitud, INTERVALO_POLLING);
    }

    function mostrarClaveEnLinea(estado, clave) {
        if (!estadoSolicitudClave) {
            return;
        }

        if (estado === "aprobada" && clave) {
            estadoSolicitudClave.textContent =
                "¡Solicitud aprobada! Tu contraseña temporal es: " + clave;
            estadoSolicitudClave.className = "estado-solicitud-clave estado-aprobada";
            estadoSolicitudClave.hidden = false;
        }
    }

    async function consultarEstadoSolicitud() {
        const previa = leerSolicitudLocal() || {};
        const email = emailEnSeguimiento || previa.email || "";

        // Una sola consulta a la vez: si el servidor tarda, el siguiente
        // ciclo no se acumula encima.
        if (!email || consultaEnCurso) {
            return;
        }

        consultaEnCurso = true;
        let datos = null;

        try {
            const parametros = new URLSearchParams();
            parametros.set("accion", "estado");
            parametros.set("email", email);

            // La ficha secreta viaja aparte del correo: sin ella el servidor
            // solo revela el estado, nunca la contraseña temporal.
            const token = leerToken();
            if (token) {
                parametros.set("token", token);
            }

            const respuesta = await fetch("api/recuperar_password.php?" + parametros.toString(), {
                headers: { "Accept": "application/json" },
                cache: "no-store"
            });
            const cuerpo = await respuesta.json();

            if (respuesta.ok && cuerpo.ok && cuerpo.solicitud) {
                datos = cuerpo.solicitud;
            }
        } catch (error) {
            // Sin conexión (XAMPP apagado, red del plantel): se conserva el
            // estado guardado y se reintenta en el siguiente ciclo.
            return;
        } finally {
            consultaEnCurso = false;
        }

        if (!datos) {
            return;
        }

        const estado = String(datos.estado || "pendiente");
        const clave = estado === "aprobada"
            ? String(datos.claveTemporal || previa.claveTemporal || "")
            : "";

        // ¿Es un cambio respecto a lo último que se le mostró al usuario?
        // "notificada" guarda el estado ya avisado, para no repetir el modal.
        const notificada = previa.notificada || "";
        const esNuevo = notificada !== estado;

        guardarSolicitudLocal({
            email: email,
            estado: estado,
            fecha: datos.fecha || previa.fecha || "",
            claveTemporal: clave,
            notificada: notificada
        });

        pintarEstadoSolicitud(estado, email);
        mostrarClaveEnLinea(estado, clave);

        if (estado === "aprobada" || estado === "rechazada") {
            // Ya no hay nada que esperar: se detiene el sondeo.
            detenerPolling();

            // La solicitud quedó resuelta: se vuelve a habilitar el envío
            // por si la persona necesita pedir otra. Sin esto, el botón se
            // quedaba en "Solicitud enviada" para siempre.
            if (botonEnviarRecuperacion) {
                botonEnviarRecuperacion.disabled = false;
                botonEnviarRecuperacion.textContent = "Enviar solicitud";
            }
        }

        if (!esNuevo) {
            return;
        }

        if (estado === "aprobada") {
            avisarAprobada(clave);
            marcarNotificada(estado);
            return;
        }

        if (estado === "rechazada") {
            avisar(
                "Solicitud rechazada",
                "El administrador rechazó tu solicitud. Contacta a soporte para revisar tu caso.",
                "error",
                false
            );
            marcarNotificada(estado);
        }
    }

    function avisarAprobada(clave) {
        const texto = clave
            ? "¡Tu solicitud fue aprobada! Usa esta contraseña temporal: " + clave
            : "¡Tu solicitud fue aprobada! El administrador te compartirá la contraseña temporal.";

        if (mensajeRecuperacion) {
            mensajeRecuperacion.textContent = texto;
            mensajeRecuperacion.classList.add("mensaje-exito");
        }

        avisar("¡Solicitud aprobada!", texto, "exito", true);
    }

    if (botonOlvidaste && modalRecuperacion && formularioRecuperacion) {
        botonOlvidaste.addEventListener("click", function () {
            const guardada = leerSolicitudLocal();
            correoRecuperacion.value = (guardada && guardada.email) || correo.value.trim();
            razonRecuperacion.value = "";
            mensajeRecuperacion.textContent = "";
            mensajeRecuperacion.classList.remove("mensaje-exito");
            botonEnviarRecuperacion.disabled = false;
            botonEnviarRecuperacion.textContent = "Enviar solicitud";

            pintarEstadoSolicitud(guardada ? guardada.estado : "", guardada ? guardada.email : "");

            if (guardada && guardada.email) {
                iniciarPolling(guardada.email);

                // Ya hay una solicitud pendiente: no se duplica.
                if (guardada.estado === "pendiente") {
                    botonEnviarRecuperacion.disabled = true;
                    botonEnviarRecuperacion.textContent = "Solicitud enviada";
                }
            }

            modalRecuperacion.showModal();
            correoRecuperacion.focus();
        });

        botonCerrarRecuperacion.addEventListener("click", function () {
            modalRecuperacion.close();
        });

        modalRecuperacion.addEventListener("click", function (evento) {
            if (evento.target === modalRecuperacion) {
                modalRecuperacion.close();
            }
        });

        formularioRecuperacion.addEventListener("submit", async function (evento) {
            evento.preventDefault();

            const email = correoRecuperacion.value.trim();
            const razon = razonRecuperacion.value.trim();

            mensajeRecuperacion.textContent = "";
            mensajeRecuperacion.classList.remove("mensaje-exito");

            if (!email || !correoRecuperacion.checkValidity()) {
                mensajeRecuperacion.textContent = "Escribe un correo electrónico válido.";
                correoRecuperacion.focus();
                return;
            }

            if (razon.length < 5) {
                mensajeRecuperacion.textContent = "Cuéntanos brevemente por qué necesitas recuperarla.";
                razonRecuperacion.focus();
                return;
            }

            botonEnviarRecuperacion.disabled = true;
            botonEnviarRecuperacion.textContent = "Enviando…";

            const resultado = await enviarSolicitudRecuperacion(email, razon);

            if (!resultado.ok) {
                botonEnviarRecuperacion.disabled = false;
                botonEnviarRecuperacion.textContent = "Enviar solicitud";
                mensajeRecuperacion.textContent = resultado.mensaje;
                return;
            }

            guardarToken(resultado.token);
            guardarSolicitudLocal({
                email: email,
                estado: resultado.estado || "pendiente",
                fecha: new Date().toISOString(),
                claveTemporal: "",
                // Solicitud nueva: el próximo aviso sí debe mostrarse.
                notificada: ""
            });

            pintarEstadoSolicitud(resultado.estado || "pendiente", email);
            // A partir de aquí la página vigila la solicitud cada 5 s.
            iniciarPolling(email);
            mensajeRecuperacion.textContent =
                "Tu solicitud ha sido enviada. El administrador la revisará y te avisaremos. No cierres sesión";
            mensajeRecuperacion.classList.add("mensaje-exito");
            botonEnviarRecuperacion.textContent = "Solicitud enviada";
        });

        // Estado recordado al volver a la página de acceso: se pinta y se
        // retoma el sondeo para no perder el aviso del administrador.
        const guardada = leerSolicitudLocal();
        if (guardada && guardada.email) {
            pintarEstadoSolicitud(guardada.estado, guardada.email);
            mostrarClaveEnLinea(guardada.estado, guardada.claveTemporal || "");
            iniciarPolling(guardada.email);
        }
    }
})();
