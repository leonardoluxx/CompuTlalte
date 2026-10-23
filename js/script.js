// Guarda referencias a los elementos HTML que controla este archivo.
const menuMovil = document.querySelector("#menu-movil");
const botonMenu = document.querySelector(".boton-menu");
const botonCerrar = document.querySelector(".boton-cerrar");
const botonAcordeon = document.querySelector(".boton-acordeon");
const submenuMovil = document.querySelector("#opciones-movil");

// Abre el panel, bloquea el desplazamiento del fondo y mueve el foco a la X.
function abrirMenu() {
    menuMovil.classList.add("esta-abierto");
    menuMovil.setAttribute("aria-hidden", "false");
    menuMovil.inert = false;
    botonMenu.setAttribute("aria-expanded", "true");
    botonMenu.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-abierto");
    botonCerrar.focus();
    if (document.activeElement !== botonCerrar) {
        requestAnimationFrame(() => botonCerrar.focus());
    }
}

// Cierra el panel, permite desplazar el fondo y devuelve el foco al botón.
function cerrarMenu() {
    menuMovil.classList.remove("esta-abierto");
    menuMovil.setAttribute("aria-hidden", "true");
    menuMovil.inert = true;
    botonMenu.setAttribute("aria-expanded", "false");
    botonMenu.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-abierto");
    botonMenu.focus();
}

// Cambia el estado del acordeón y actualiza su información de accesibilidad.
function cambiarEstadoSubmenu(estaAbierto) {
    botonAcordeon.setAttribute("aria-expanded", String(estaAbierto));
    submenuMovil.classList.toggle("esta-expandido", estaAbierto);
    submenuMovil.inert = !estaAbierto;
}

// Al pulsar la hamburguesa se abre el menú, y la X lo cierra.
botonMenu.addEventListener("click", abrirMenu);
botonCerrar.addEventListener("click", cerrarMenu);

// Al pulsar Computadoras se muestran u ocultan las opciones del acordeón.
botonAcordeon.addEventListener("click", () => {
    const estaAbierto = botonAcordeon.getAttribute("aria-expanded") === "true";
    cambiarEstadoSubmenu(!estaAbierto);
});

// Cierra el menú después de elegir un enlace.
menuMovil.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", cerrarMenu);
});

// Escape cierra el menú; Tab mantiene el foco dentro del panel móvil.
document.addEventListener("keydown", (evento) => {
    if (!menuMovil.classList.contains("esta-abierto")) {
        return;
    }

    if (evento.key === "Escape") {
        cerrarMenu();
        return;
    }

    if (evento.key === "Tab") {
        // Excluye los controles del submenú mientras esté cerrado (inert).
        const elementosEnfocables = [...menuMovil.querySelectorAll("a[href], button:not([disabled])")]
            .filter((elemento) => !elemento.closest("[inert]"));
        const primerElemento = elementosEnfocables[0];
        const ultimoElemento = elementosEnfocables[elementosEnfocables.length - 1];

        if (!menuMovil.contains(document.activeElement)) {
            evento.preventDefault();
            (evento.shiftKey ? ultimoElemento : primerElemento).focus();
        } else if (evento.shiftKey && document.activeElement === primerElemento) {
            evento.preventDefault();
            ultimoElemento.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimoElemento) {
            evento.preventDefault();
            primerElemento.focus();
        }
    }
});

// Si la ventana pasa a escritorio, cierra el panel y reinicia el acordeón.
window.matchMedia("(min-width: 769px)").addEventListener("change", (cambio) => {
    if (cambio.matches && menuMovil.classList.contains("esta-abierto")) {
        cerrarMenu();
        cambiarEstadoSubmenu(false);
    }
});