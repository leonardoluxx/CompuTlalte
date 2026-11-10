# 💻 Computlalte — Guía de instalación para otra computadora

Esta guía es para instalar la tienda en una computadora nueva (por ejemplo, en la
escuela) en **menos de 5 minutos**. No necesitas saber de bases de datos.

---

## Lo que necesitas antes de empezar

1. **XAMPP** instalado en la computadora (descarga: <https://www.apachefriends.org>).
2. La **carpeta del proyecto** (`computlaltenango`), que ya trae todo adentro.

---

## Paso 1 · Copiar el proyecto a XAMPP

Copia la carpeta completa del proyecto dentro de la carpeta `htdocs` de XAMPP:

```
De:  <donde tengas la carpeta>\computlaltenango
A:   C:\xampp\htdocs\computlaltenango
```

> 💡 Si XAMPP está en otra unidad (por ejemplo `D:`), la ruta sería `D:\xampp\htdocs\computlaltenango`.

## Paso 2 · Encender Apache y MySQL

1. Abre el **Panel de Control de XAMPP**.
2. Pulsa **Start** en **Apache**.
3. Pulsa **Start** en **MySQL**.

Ambos deben quedar en verde. Si MySQL no enciende, ve a la sección de
problemas al final de esta guía.

## Paso 3 · Instalar la base de datos (automático) ✨

1. Abre el navegador y entra a:

   ```
   http://localhost/computlaltenango/instalacion/instalador.php
   ```

2. Pulsa el botón **«Instalar ahora»**.

3. Espera unos segundos: verás una lista con pasos en verde ✔ y los enlaces
   finales. **Listo, eso es todo.** El instalador crea la base de datos
   `computlalte_db` con 11 tablas, 48 productos, sus 661 especificaciones,
   276 imágenes de producto, tres cuentas de prueba, una venta de demostración
   y las rutas predeterminadas de portada, accesorios y ofertas. El dump incluye
   todo el catálogo; no necesita archivos de importación adicionales.

### Alternativa manual (si prefieres phpMyAdmin)

1. Entra a `http://localhost/phpmyadmin`.
2. Pestaña **Importar** → botón **Seleccionar archivo** → elige
   `computlaltenango/instalacion/computlalte_db.sql`.
3. Botón **Continuar** (abajo). Al terminar verás la base `computlalte_db` en el menú izquierdo.

> ⚠️ El SQL completo elimina y vuelve a crear `computlalte_db`. Úsalo solo en
> una computadora nueva o después de respaldar la base existente. Si la tienda
> ya tiene datos, usa el instalador: este bloquea la reinstalación salvo que
> un administrador la confirme explícitamente.

## Paso 4 · Verificar que todo funciona

Abre en el navegador:

```
http://localhost/computlaltenango/prueba-conexion.php
```

Debe decir: **«Conexión exitosa»** con la versión de MariaDB y el nombre de la base.

Después entra a la tienda:

```
http://localhost/computlaltenango/
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
| La página carga en blanco o da 404 | El proyecto no está dentro de `htdocs`, o la carpeta tiene otro nombre. La ruta debe ser `htdocs\computlaltenango`. |
| Error «Access denied» | Las credenciales de `conexion.php` deben ser: servidor `localhost`, usuario `root`, contraseña vacía (valores por defecto de XAMPP). |
| Ya tenía la base instalada y quiero empezar de cero | Abre el instalador y pulsa **«Reinstalar desde cero»**. |

---

## 📦 Contenido de esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `computlalte_db.sql` | La base de datos completa (estructura + datos) lista para importar. |
| `instalador.php` | Instalación automática con un clic (recomendada). |
| `conexion.php` | Copia de las credenciales de conexión que usa la tienda. |
| `prueba-conexion.php` | Verificación rápida: debe decir «Conexión exitosa». |
| `README.md` | Esta guía. |
