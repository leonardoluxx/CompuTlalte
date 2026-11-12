# 💻 Computlalte — Guía de instalación para otra computadora

Esta guía es para instalar la tienda en una computadora nueva (por ejemplo, en la
escuela) en **menos de 5 minutos**. No necesitas saber de bases de datos.

---

## Lo que necesitas antes de empezar

1. **XAMPP** instalado en la computadora (descarga: <https://www.apachefriends.org>).
2. La **carpeta del proyecto** (`computlalte`), que ya trae todo adentro.

### Compatibilidad

| Componente | Mínimo | Probado en |
|---|---|---|
| PHP | 7.1 | 8.3 |
| MySQL / MariaDB | 5.7 / 10.3 | 10.11 (MariaDB de XAMPP) |
| Extensiones PHP | `mysqli`, `json`, `fileinfo` | vienen activas en XAMPP |

- El código evita la sintaxis posterior a PHP 7.1: nada de funciones flecha
  `fn()` (7.4), `str_contains` (8.0) ni el tipo `never` (8.1). Así corre igual en
  un XAMPP viejo con PHP 7.2 y en uno nuevo con PHP 8.3.
- `api/_compat.php` detecta la versión y adapta lo que cambia entre versiones
  (por ejemplo la cookie de sesión, que se configura distinto antes de PHP 7.3).
- El instalador avisa con un mensaje claro si el servidor tiene PHP 7.0 o menos.
- **`instalacion/requisitos.php`** revisa todo y lo muestra en pantalla (versión
  de PHP, extensiones, utf8mb4, si la base ya está instalada). Está escrito con
  sintaxis muy antigua a propósito, así abre incluso cuando el resto del sitio no
  puede cargar por la versión de PHP.
- El archivo `computlalte_db.sql` usa solo sintaxis estándar (`utf8mb4_unicode_ci`,
  InnoDB), compatible con MySQL 5.7+ y MariaDB 10.3+.
- No se necesita internet en ningún momento: tipografías, iconos e imágenes son
  locales.

> 📥 ¿Vas a traerlo desde GitHub? Clona el repositorio indicando el nombre de
> la carpeta para que las rutas de esta guía funcionen tal cual:
>
> ```
> git clone https://github.com/leonardoluxx/CompuTlalte.git computlalte
> ```

---

## Paso 0 · Comprobar que la computadora puede (30 segundos)

Abre `instalacion/requisitos.php` en el navegador:

```
http://localhost/computlalte/instalacion/requisitos.php
```

La página revisa sola la versión de PHP, las extensiones (`mysqli`, `json`,
`fileinfo`), el juego de caracteres `utf8mb4` y si la base ya está instalada.
Todo en verde significa que puedes seguir; si algo está en rojo, ahí mismo dice
qué corregir. Está escrita con sintaxis muy antigua a propósito: abre incluso
cuando el resto del sitio no puede cargar por la versión de PHP.

## Paso 1 · Copiar el proyecto a XAMPP

Copia la carpeta completa del proyecto dentro de la carpeta `htdocs` de XAMPP:

```
De:  <donde tengas la carpeta>\computlalte
A:   C:\xampp\htdocs\computlalte
```

> 💡 Si XAMPP está en otra unidad (por ejemplo `D:`), la ruta sería `D:\xampp\htdocs\computlalte`.

## Paso 2 · Encender Apache y MySQL

1. Abre el **Panel de Control de XAMPP**.
2. Pulsa **Start** en **Apache**.
3. Pulsa **Start** en **MySQL**.

Ambos deben quedar en verde. Si MySQL no enciende, ve a la sección de
problemas al final de esta guía.

## Paso 3 · Instalar la base de datos (automático) ✨

1. Abre el navegador y entra a:

   ```
   http://localhost/computlalte/instalacion/instalador.php
   ```

2. Pulsa el botón **«Instalar ahora»**.

3. Espera unos segundos: verás una lista con pasos en verde ✔ y los enlaces
   finales. **Listo, eso es todo.** El instalador crea la base de datos
   `computlalte_db` con 11 tablas y el catálogo completo: **160 productos**
   (60 computadoras y 100 accesorios), **2 130 especificaciones**, **953 imágenes
   de producto**, tres cuentas de prueba, una venta de demostración y las rutas
   predeterminadas de portada, accesorios y ofertas. El dump incluye todo el
   catálogo; no necesita archivos de importación adicionales.

   Catálogo que queda instalado (20 productos exactos por categoría):

   | Categoría | Productos |
   |---|---|
   | Computadoras · Juegos | 20 |
   | Computadoras · Desarrollo | 20 |
   | Computadoras · Uso Diario | 20 |
   | Mouse | 20 |
   | Audio | 20 |
   | Energía y Cables | 20 |
   | Teclados | 20 |
   | Monitores | 20 |

   > Las imágenes se sirven desde la carpeta `imagenes/` del proyecto, así que
   > copia la carpeta completa (no solo los archivos `.php` y `.html`).

### Alternativa manual (si prefieres phpMyAdmin)

1. Entra a `http://localhost/phpmyadmin`.
2. Pestaña **Importar** → botón **Seleccionar archivo** → elige
   `computlalte/instalacion/computlalte_db.sql`.
3. Botón **Continuar** (abajo). Al terminar verás la base `computlalte_db` en el menú izquierdo.

> ⚠️ El SQL completo elimina y vuelve a crear `computlalte_db`. Úsalo solo en
> una computadora nueva o después de respaldar la base existente. Si la tienda
> ya tiene datos, usa el instalador: este bloquea la reinstalación salvo que
> un administrador la confirme explícitamente.

## Paso 4 · Verificar que todo funciona

Abre en el navegador:

```
http://localhost/computlalte/prueba-conexion.php
```

Debe decir: **«Conexión exitosa»** con la versión de MariaDB y el nombre de la base.

Después entra a la tienda:

```
http://localhost/computlalte/
```

---

## 🔑 Cuentas de prueba (modo desarrollo)

| Rol | Correo | Contraseña |
|---|---|---|
| **Administrador** | `admin@computlalte.com` | `Admin123$` |
| **Gerente** | `gerente@computlalte.com` | `Gerente123$` |
| **Cliente** | `cliente@computlalte.com` | `Cliente123$` |

- El **administrador** controla todo: productos, precios, márgenes, ofertas,
  cuentas y reportes (`panel.html`).
- El **gerente** propone cambios, pero el administrador los aprueba.
- El **cliente** compra en la tienda.

También hay botones de acceso rápido en la propia página de login.

---

## 🛠️ Problemas comunes

| Problema | Solución |
|---|---|
| MySQL no enciende en XAMPP | Otro programa usa el puerto 3306 (o el 80). Cierra Skype/IIS u otra instancia de MySQL y vuelve a pulsar Start. |
| «No pude conectarme a MySQL» en el instalador | MySQL está apagado: enciéndelo en el Panel de XAMPP y recarga. |
| La página carga en blanco o da 404 | El proyecto no está dentro de `htdocs`, o la carpeta tiene otro nombre. La ruta debe ser `htdocs\computlalte`. |
| Error «Access denied» | Las credenciales de `conexion.php` deben ser: servidor `localhost`, usuario `root`, contraseña vacía (valores por defecto de XAMPP). |
| Ya tenía la base instalada y quiero empezar de cero | Abre el instalador y pulsa **«Reinstalar desde cero»**. |

---

## 📦 Contenido de esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `requisitos.php` | Diagnóstico: versión de PHP, extensiones, utf8mb4 y estado de la base. |
| `instalador.php` | Instalación automática con un clic (recomendada). |
| `computlalte_db.sql` | La base de datos completa (estructura + datos) lista para importar. |
| `README.md` | Esta guía. |

Las credenciales están en `conexion.php` y la prueba rápida en
`prueba-conexion.php`, los dos en la raíz del proyecto (no en esta carpeta).
