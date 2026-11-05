# CompuTlalte — Tienda de computadoras y accesorios

## Instalación en otra computadora

Ver la guía completa en **[`instalacion/README.md`](instalacion/README.md)**.
Resumen rápido:

1. Copiar la carpeta del proyecto a `C:\xampp\htdocs\computlaltenango`.
2. Encender **Apache** y **MySQL** en el Panel de XAMPP.
3. Abrir `http://localhost/computlaltenango/instalacion/instalador.php` y pulsar **«Instalar ahora»**.
4. Verificar en `http://localhost/computlaltenango/prueba-conexion.php` → «Conexión exitosa».

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@computlalte.com` | `Admin123$` |
| Gerente | `gerente@computlalte.com` | `Gerente123$` |
| Cliente | `cliente@computlalte.com` | `Cliente123$` |

## Reglas de negocio

- El **precio final** se guarda en la base de datos ya calculado
  (costo base + margen de ganancia, 35 % por defecto). El frontend solo lo muestra.
- El **administrador** tiene la última palabra: aplica cambios al instante;
  el **gerente** propone y el admin aprueba o rechaza.
- El **costo base y los márgenes** solo viajan a admin/gerente: a clientes e
  invitados se les quitan del JSON de la página.
- El servidor **recalcula todos los precios** al procesar una venta y descuenta stock.

## Estructura del proyecto

| Carpeta / archivo | Contenido |
|---|---|
| `api/` | Backend PHP: sesión, productos, ventas, solicitudes, usuarios, reportes, bitácora, subida de imágenes y configuración de la tienda. |
| `css/` | Hojas de estilo del diseño oscuro (CSS puro, sin librerías). |
| `js/` | Lógica del frontend en JavaScript puro: tienda, panel y editor visual. |
| `imagenes/` | Imágenes de productos y anuncios; cada producto puede tener su propia subcarpeta. |
| `instalacion/` | Instalador automático, base SQL lista para importar y guía completa. |
| `fonts/` | Tipografías locales (el sitio funciona sin internet). |
| `*.html` | Páginas de la tienda y del panel de administración. |
| `conexion.php` | Credenciales de MySQL (valores por defecto de XAMPP). |
| `prueba-conexion.php` | Verificación rápida: debe decir «Conexión exitosa». |

Todo el contenido dinámico vive en MySQL: no hay archivos JSON de datos ni
scripts de prueba sueltos en la raíz.
