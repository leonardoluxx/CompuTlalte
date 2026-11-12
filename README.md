# CompuTlalte — Tienda de computadoras y accesorios

## Instalación en otra computadora

Ver la guía completa en **[`instalacion/README.md`](instalacion/README.md)**.
Resumen rápido:

1. Si lo bajas de GitHub, clona el repositorio indicando el nombre de la carpeta:
   `git clone https://github.com/leonardoluxx/CompuTlalte.git computlalte`.
2. Copiar la carpeta `computlalte` a `C:\xampp\htdocs\computlalte`.
3. Encender **Apache** y **MySQL** en el Panel de XAMPP.
4. Abrir `http://localhost/computlalte/instalacion/instalador.php` y pulsar **«Instalar ahora»**.
5. Verificar en `http://localhost/computlalte/prueba-conexion.php` → «Conexión exitosa».

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
| `css/` | Hojas de estilo del diseño oscuro (CSS puro, sin librerías). Las tipografías viajan incrustadas en `css/fuentes.css`, así no hay archivos de fuente sueltos. |
| `js/` | Lógica del frontend en JavaScript puro: tienda, panel y editor visual. |
| `imagenes/` | Imágenes de productos y anuncios; cada producto puede tener su propia subcarpeta. |
| `instalacion/` | Instalador automático, base SQL lista para importar y guía completa. |
| `*.html` | Páginas de la tienda y del panel de administración. |
| `conexion.php` | Credenciales de MySQL (valores por defecto de XAMPP). |
| `prueba-conexion.php` | Verificación rápida: debe decir «Conexión exitosa». |

Todo el contenido dinámico vive en MySQL: no hay archivos JSON de datos ni
scripts de prueba sueltos en la raíz.
