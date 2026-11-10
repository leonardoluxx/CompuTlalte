/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: computlalte_db
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `computlalte_db`
--

/*!40000 DROP DATABASE IF EXISTS `computlalte_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `computlalte_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `computlalte_db`;

--
-- Table structure for table `bitacora`
--

DROP TABLE IF EXISTS `bitacora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `autor` varchar(120) NOT NULL DEFAULT 'Sistema',
  `rol` varchar(20) NOT NULL DEFAULT 'sistema',
  `accion` varchar(30) NOT NULL,
  `detalle` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora`
--

LOCK TABLES `bitacora` WRITE;
/*!40000 ALTER TABLE `bitacora` DISABLE KEYS */;
/*!40000 ALTER TABLE `bitacora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categorias_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES
(2,'Desarrollo'),
(1,'Juegos'),
(4,'Mouse'),
(3,'Uso Diario');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `clave` varchar(40) NOT NULL,
  `valor` varchar(255) NOT NULL,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES
('hero_imagen','imagenes/anuncios/imagen-procesador-add.jpg'),
('imagen_accesorios','imagenes/anuncios/imagen-mouse-accesorios-add.jpg'),
('imagen_ofertas','imagenes/anuncios/imagen-ofertas-add.jpg'),
('margen_global','35');
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupones`
--

DROP TABLE IF EXISTS `cupones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(40) NOT NULL,
  `descuento_porcentaje` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cupones_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupones`
--

LOCK TABLES `cupones` WRITE;
/*!40000 ALTER TABLE `cupones` DISABLE KEYS */;
INSERT INTO `cupones` VALUES
(1,'COMPU10',10,1),
(2,'BIENVENIDA15',15,1),
(3,'VENCIDO20',20,0);
/*!40000 ALTER TABLE `cupones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ventas`
--

DROP TABLE IF EXISTS `detalle_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ventas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `venta_id` int(10) unsigned NOT NULL,
  `producto_id` int(10) unsigned DEFAULT NULL,
  `nombre_producto` varchar(180) NOT NULL,
  `cantidad` smallint(5) unsigned NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_detalle_venta` (`venta_id`),
  KEY `idx_detalle_producto` (`producto_id`),
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
INSERT INTO `detalle_ventas` VALUES
(1,1,2,'ATTACK SHARK R3 Magnesium Alloy Gaming Mouse 8K',1,3888.00),
(2,1,1,'PC para juegos VENGEANCE a7500 — 1 TB, 32 GB, Negro Espacial',1,44500.00);
/*!40000 ALTER TABLE `detalle_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especificaciones`
--

DROP TABLE IF EXISTS `especificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `especificaciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `producto_id` int(10) unsigned NOT NULL,
  `tipo` enum('clave','tecnica') NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_especificaciones_producto` (`producto_id`),
  CONSTRAINT `fk_especificaciones_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especificaciones`
--

LOCK TABLES `especificaciones` WRITE;
/*!40000 ALTER TABLE `especificaciones` DISABLE KEYS */;
INSERT INTO `especificaciones` VALUES
(1,1,'clave','Gabinete semitorre 3500X ARGB con un atractivo diseño envolvente de vidrio'),
(2,1,'clave','Refrigeración líquida H100x para mejorar el rendimiento y la refrigeración'),
(3,1,'clave','Seis ventiladores RS120 ARGB con tecnología AirGuide para dirigir el flujo de aire'),
(4,1,'tecnica','32 GB (2 x 16 GB) DDR5-5200'),
(5,1,'tecnica','SSD NVMe de 1 TB'),
(6,1,'tecnica','AMD Ryzen 7 9700X'),
(7,1,'tecnica','NVIDIA GeForce RTX 4070 Ti SUPER'),
(8,1,'tecnica','Windows 11 Home'),
(9,1,'tecnica','Garantía de dos años'),
(10,3,'clave','Pantalla OLED táctil de 14 pulgadas con resolución WUXGA'),
(11,3,'clave','Procesador Intel Core Ultra 5 225H de última generación'),
(12,3,'clave','16 GB de memoria LPDDR5X y SSD NVMe de 1 TB'),
(13,3,'clave','Conectividad Wi-Fi 7 y teclado retroiluminado'),
(14,3,'clave','Diseño ultraligero ideal para programar y multitarea'),
(15,3,'tecnica','Windows 11 Home'),
(16,3,'tecnica','Intel Core Ultra 5 225H'),
(17,3,'tecnica','14\" OLED WUXGA Táctil'),
(18,3,'tecnica','16 GB RAM LPDDR5X'),
(19,3,'tecnica','1 TB SSD NVMe'),
(20,3,'tecnica','Wi-Fi 7'),
(21,3,'tecnica','Teclado retroiluminado'),
(22,4,'clave','Chip M5 Max con CPU de 18 núcleos y GPU de 40 núcleos'),
(23,4,'clave','128 GB de memoria unificada para flujos de trabajo extremos'),
(24,4,'clave','8 TB de almacenamiento SSD de alta velocidad'),
(25,4,'clave','Pantalla de 16 pulgadas con acabado nanotexturizado'),
(26,4,'clave','Teclado en español y chasis de aluminio'),
(27,4,'tecnica','Chip M5 Max (CPU 18 núcleos, GPU 40 núcleos)'),
(28,4,'tecnica','128 GB Memoria Unificada'),
(29,4,'tecnica','8 TB Almacenamiento'),
(30,4,'tecnica','Pantalla 16\" Nanotexturizada'),
(31,4,'tecnica','Teclado Español'),
(32,2,'clave','46g Ultra-light'),
(33,2,'clave','Magnesium Alloy'),
(34,2,'clave','PAW3395 Gaming Sensor'),
(35,2,'clave','Tri-modes Connection (BT / 2.4G / Wired)'),
(36,2,'clave','80 Million Clicks'),
(37,2,'clave','TTC Encoder'),
(38,2,'clave','Self-developed Driver'),
(39,2,'clave','Smart Sleep'),
(40,2,'clave','Ergonomic Design'),
(41,2,'clave','6 Adjustable DPI up to 26000'),
(42,2,'clave','8000Hz Wireless Polling Rate'),
(43,2,'tecnica','Sensor óptico PixArt PAW3395'),
(44,2,'tecnica','DPI: 200 - 26000 (6 niveles ajustables)'),
(45,2,'tecnica','Conectividad triple: BT / 2.4G / USB-C'),
(46,2,'tecnica','Tasa de sondeo: 8000 Hz'),
(47,2,'tecnica','Durabilidad: 80 millones de clics'),
(48,2,'tecnica','Encoder: TTC'),
(49,2,'tecnica','Garantía: Un año');
/*!40000 ALTER TABLE `especificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagenes_producto`
--

DROP TABLE IF EXISTS `imagenes_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagenes_producto` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `producto_id` int(10) unsigned NOT NULL,
  `url` varchar(255) NOT NULL,
  `posicion` smallint(5) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_imagenes_producto` (`producto_id`),
  CONSTRAINT `fk_imagenes_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenes_producto`
--

LOCK TABLES `imagenes_producto` WRITE;
/*!40000 ALTER TABLE `imagenes_producto` DISABLE KEYS */;
INSERT INTO `imagenes_producto` VALUES
(1,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-01.avif',1),
(2,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-02.avif',2),
(3,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-03.avif',3),
(4,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-04.avif',4),
(5,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-05.avif',5),
(6,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-06.avif',6),
(7,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-07.avif',7),
(8,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-08.avif',8),
(9,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-09.avif',9),
(10,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-10.avif',10),
(11,1,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-11.avif',11),
(12,3,'imagenes/computadoras-uso-diario/asus-zeenbok-14/asus-zenbook-1.jpg',1),
(13,3,'imagenes/computadoras-uso-diario/asus-zeenbok-14/asus-zenbook-2.jpg',2),
(14,3,'imagenes/computadoras-uso-diario/asus-zeenbok-14/asus-zenbook-3.jpg',3),
(15,3,'imagenes/computadoras-uso-diario/asus-zeenbok-14/asus-zenbook-4.jpg',4),
(16,3,'imagenes/computadoras-uso-diario/asus-zeenbok-14/asus-zenbook-5.jpg',5),
(17,4,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-finish-select-202610-16inch-spaceblack.webp',1),
(18,4,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-finish-select-202610-16inch-spaceblack_AV1.webp',2),
(19,4,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-finish-select-202610-16inch-spaceblack_AV2.webp',3),
(20,4,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-finish-select-202610-16inch-spaceblack_AV3.webp',4),
(21,4,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-size-select-202610-16inch.webp',5),
(22,4,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-size-select-202610-16inch_AV1_GEO_MX.webp',6),
(23,4,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-size-select-202610-16inch_AV2.webp',7),
(24,4,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-chip-select-202610-16inch.webp',8),
(25,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-resumen.webp',1),
(26,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-aleacion-magnesio.webp',2),
(27,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-sensor-paw3395.webp',3),
(28,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-conectividad.webp',4),
(29,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-dimensiones.webp',5),
(30,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-ultraligero.webp',6),
(31,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-software.webp',7),
(32,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-switch-tcc.webp',8),
(33,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-vista-superior.webp',9),
(34,2,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-vista-lateral.webp',10);
/*!40000 ALTER TABLE `imagenes_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(180) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `descripcion_corta` varchar(255) DEFAULT NULL,
  `categoria_id` int(10) unsigned DEFAULT NULL,
  `costo_base` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_final` decimal(10,2) NOT NULL DEFAULT 0.00,
  `margen_propio` decimal(5,2) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `estado` enum('activo','agotado','eliminado') NOT NULL DEFAULT 'activo',
  `marca` varchar(80) DEFAULT NULL,
  `tipo` enum('computadora','accesorio') NOT NULL DEFAULT 'computadora',
  `etiqueta` varchar(60) DEFAULT NULL,
  `destacado` tinyint(1) NOT NULL DEFAULT 0,
  `en_oferta` tinyint(1) NOT NULL DEFAULT 0,
  `descuento` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `resenas` int(10) unsigned NOT NULL DEFAULT 0,
  `vendidos` int(10) unsigned NOT NULL DEFAULT 0,
  `fecha_alta` date DEFAULT NULL,
  `terminos_busqueda` text DEFAULT NULL,
  `personalizacion` text DEFAULT NULL,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_productos_categoria` (`categoria_id`),
  CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES
(1,'PC para juegos VENGEANCE a7500','Lleva tu experiencia de juego al siguiente nivel con una PC CORSAIR VENGEANCE serie a7500, ensamblada con componentes CORSAIR reconocidos y equipada con un procesador AMD Ryzen serie 9000 y gráficos NVIDIA GeForce RTX serie 40.','AMD Ryzen 7 9700X, GeForce RTX 4070 Ti SUPER, 32 GB DDR5, SSD M.2 de 1 TB y Windows 11 Home',1,30000.00,40500.00,NULL,'imagenes/computadoras-gaming/pc-vengeance/pc-juego-corsair-vengeance-a7500-01.avif',NULL,7,'activo','CORSAIR','computadora','',0,0,0,0,0,NULL,'[\"ben\",\"ven\",\"corsair\",\"computadora gaming\",\"pc gamer\"]','[{\"grupo\":\"almacenamiento\",\"grupoEtiqueta\":\"Almacenamiento\",\"opciones\":[{\"valor\":\"1-tb\",\"etiqueta\":\"1 TB\",\"extra\":0},{\"valor\":\"2-tb\",\"etiqueta\":\"2 TB\",\"extra\":2000}]},{\"grupo\":\"memoria\",\"grupoEtiqueta\":\"Memoria RAM\",\"opciones\":[{\"valor\":\"16-gb\",\"etiqueta\":\"16 GB\",\"extra\":0},{\"valor\":\"32-gb\",\"etiqueta\":\"32 GB\",\"extra\":3500}]},{\"grupo\":\"color\",\"grupoEtiqueta\":\"Color\",\"opciones\":[{\"valor\":\"plata\",\"etiqueta\":\"Plata\",\"extra\":0},{\"valor\":\"negro-espacial\",\"etiqueta\":\"Negro Espacial\",\"extra\":500}]}]','2026-11-04 18:09:39','2026-11-04 18:09:40'),
(2,'ATTACK SHARK R3 Magnesium Alloy Gaming Mouse 8K','El ATTACK SHARK R3 redefine la velocidad y precisión con un cuerpo de aleación de magnesio de 46 g, sensor óptico PixArt PAW3395, tasa de sondeo de 8000 Hz y modos de conexión triple (BT / 2.4 G / cable). Incluye 207 reseñas verificadas y está respaldado por 80 millones de clics en sus switches TTC, con un encoder TTC y un driver autodesarrollado para personalización avanzada. Diseño ergonómico con modo de suspensión inteligente.','46g Magnesium Alloy SUPERLIGHT Mouse, 8000Hz Wireless Polling Rate, 6 Adjustable DPI up to 26000, PixArt PAW3395 Gaming Sensor, BT/2.4G Wireless/Wired.',4,3200.00,4320.00,NULL,'imagenes/imagenes-accesorios/raton-attack-shark/raton-attack-shark-r3-resumen.webp',NULL,24,'activo','ATTACK SHARK','accesorio','En existencia',1,1,10,207,340,'2026-09-12','[\"raton\",\"ratones\",\"mouse\",\"attack shark\",\"gaming\",\"r3\",\"magnesio\",\"8k\",\"magnesium\"]',NULL,'2026-11-04 18:09:39','2026-11-04 18:09:40'),
(3,'ASUS Zenbook 14 OLED','Laptop ultraligera con pantalla táctil OLED y procesador Intel de última generación. Ideal para programar y multitarea.','Intel Core Ultra 5 225H, pantalla de 14\" OLED WUXGA táctil, 16 GB LPDDR5X, SSD de 1 TB, Wi-Fi 7 y Windows 11 Home.',2,23500.00,31725.00,NULL,'imagenes/computadoras-uso-diario/asus-zeenbok-14/asus-zenbook-3.jpg',NULL,6,'activo','ASUS','computadora','',0,0,0,0,0,NULL,'[\"asus\",\"zenbook\",\"zenbook 14\",\"oled\",\"laptop\",\"portatil\",\"desarrollo\",\"programacion\",\"intel\",\"core ultra\",\"ultra 5\"]','[{\"grupo\":\"almacenamiento\",\"grupoEtiqueta\":\"Almacenamiento\",\"opciones\":[{\"valor\":\"1-tb\",\"etiqueta\":\"1 TB\",\"extra\":0},{\"valor\":\"2-tb\",\"etiqueta\":\"2 TB\",\"extra\":2000}]},{\"grupo\":\"memoria\",\"grupoEtiqueta\":\"Memoria RAM\",\"opciones\":[{\"valor\":\"16-gb\",\"etiqueta\":\"16 GB\",\"extra\":0},{\"valor\":\"32-gb\",\"etiqueta\":\"32 GB\",\"extra\":3500}]},{\"grupo\":\"color\",\"grupoEtiqueta\":\"Color\",\"opciones\":[{\"valor\":\"plata\",\"etiqueta\":\"Plata\",\"extra\":0},{\"valor\":\"negro-espacial\",\"etiqueta\":\"Negro Espacial\",\"extra\":500}]}]','2026-11-04 18:09:39','2026-11-04 18:09:39'),
(4,'MacBook Pro 16\" M5 Max','La bestia definitiva de Apple para creadores. Pantalla increíble y el nuevo chip M5 Max.','Chip M5 Max de 18 núcleos de CPU y 40 de GPU, 128 GB de memoria unificada, 8 TB de almacenamiento y pantalla de 16\" nanotexturizada.',3,95000.00,128250.00,NULL,'imagenes/computadoras-desarrollo/mac-macbook-pro-16/mac-macbook-pro-finish-select-202610-16inch-spaceblack.webp',NULL,3,'activo','APPLE','computadora','',0,0,0,0,0,NULL,'[\"apple\",\"mac\",\"macbook\",\"macbook pro\",\"m5\",\"m5 max\",\"creadores\",\"uso diario\",\"16 pulgadas\"]','[{\"grupo\":\"almacenamiento\",\"grupoEtiqueta\":\"Almacenamiento\",\"opciones\":[{\"valor\":\"1-tb\",\"etiqueta\":\"1 TB\",\"extra\":0},{\"valor\":\"2-tb\",\"etiqueta\":\"2 TB\",\"extra\":2000}]},{\"grupo\":\"memoria\",\"grupoEtiqueta\":\"Memoria RAM\",\"opciones\":[{\"valor\":\"16-gb\",\"etiqueta\":\"16 GB\",\"extra\":0},{\"valor\":\"32-gb\",\"etiqueta\":\"32 GB\",\"extra\":3500}]},{\"grupo\":\"color\",\"grupoEtiqueta\":\"Color\",\"opciones\":[{\"valor\":\"plata\",\"etiqueta\":\"Plata\",\"extra\":0},{\"valor\":\"negro-espacial\",\"etiqueta\":\"Negro Espacial\",\"extra\":500}]}]','2026-11-04 18:09:39','2026-11-04 18:09:39');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes`
--

DROP TABLE IF EXISTS `solicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned DEFAULT NULL,
  `producto_id` int(10) unsigned DEFAULT NULL,
  `producto_nombre` varchar(180) DEFAULT NULL,
  `cambios` longtext NOT NULL,
  `resumen` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `resuelto_por` varchar(120) DEFAULT NULL,
  `fecha_resolucion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_solicitudes_estado` (`estado`),
  KEY `fk_solicitudes_usuario` (`usuario_id`),
  KEY `fk_solicitudes_producto` (`producto_id`),
  CONSTRAINT `fk_solicitudes_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_solicitudes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes`
--

LOCK TABLES `solicitudes` WRITE;
/*!40000 ALTER TABLE `solicitudes` DISABLE KEYS */;
INSERT INTO `solicitudes` VALUES
(1,2,3,'ASUS Zenbook 14 OLED','{\"diff\":{\"costoBase\":{\"antes\":23500,\"despues\":24000}}}','cambio con imagenes ajenas','rechazada','2026-11-04 18:24:22','Administrador','2026-11-04 18:25:08');
/*!40000 ALTER TABLE `solicitudes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','gerente','cliente') NOT NULL DEFAULT 'cliente',
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `rfc` varchar(13) DEFAULT NULL,
  `metodo_pago` enum('transferencia','tarjeta') DEFAULT NULL,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
(1,'Administrador','admin@computlalte.com','$2y$10$kLFvpji2WNJu4L8OYC1jNON94paROdOpRLKWSwxSukzod.ZG5lXk6','admin','Av. Tecnología 123, Col. Centro, CDMX','55 1234 5678',NULL,NULL,'2026-11-04 18:09:39'),
(2,'Gerente','gerente@computlalte.com','$2y$10$3W6IZb3nw3pN1zGWZl1FBeNFqq0rObKwoIXV7lEYFyWOOWvQ7BrdS','gerente','Av. Tecnología 123, Col. Centro, CDMX','55 8765 4321',NULL,NULL,'2026-11-04 18:09:40'),
(3,'Cliente','cliente@computlalte.com','$2y$10$M6lDaOcEqPvuz3lI3VmMZ.3N6Jq3jlrycQs98d8QlhcuOMZ60lDTO','cliente','Calle Jacarandas 45, CDMX','55 5555 1111','','tarjeta','2026-11-04 18:09:40');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `folio` varchar(24) NOT NULL,
  `usuario_id` int(10) unsigned DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `metodo_pago` enum('transferencia','tarjeta') NOT NULL,
  `referencia_pago` varchar(120) DEFAULT NULL,
  `rfc_factura` varchar(13) DEFAULT NULL,
  `direccion_envio` varchar(255) DEFAULT NULL,
  `cupon` varchar(40) DEFAULT NULL,
  `estado_pedido` enum('pendiente','pagado','enviado','entregado','cancelado') NOT NULL DEFAULT 'pagado',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ventas_folio` (`folio`),
  KEY `idx_ventas_usuario` (`usuario_id`),
  CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES
(1,'CTL-20261105-30A0',3,'2026-11-04 18:09:40',48388.00,'tarjeta','','','',NULL,'pagado');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

-- Catalogo completo de computadoras importadas (IDs 5-44), exportado desde MySQL.
INSERT INTO `productos` VALUES (5,'Laptop Aspire Lite 16 15.6 Fhd Amd Ryzen 5 40 16gb 512gb Plateado','Laptop Aspire Lite 16 15.6 Fhd Amd Ryzen 5 40 16gb 512gb Plateado es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 5, Gráfica AMD Radeon Graphics, 16 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 5, Gráfica AMD Radeon Graphics, 16 GB de memoria RAM, Almacenamiento 512 GB SSD',2,9268.17,12512.03,NULL,'imagenes/computadoras-desarrollo/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16-01.png',NULL,8,'activo','ACER','computadora','',0,0,0,2,0,'2026-11-10','[\"laptop\",\"aspire\",\"lite\",\"fhd\",\"amd\",\"ryzen\",\"16gb\",\"512gb\",\"plateado\",\"acer\",\"desarrollo\"]','[{\"grupo\": \"equipo-5-rendimiento\", \"grupoEtiqueta\": \"Perfil profesional\", \"opciones\": [{\"valor\": \"base-5-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-5-rendimiento\", \"etiqueta\": \"Perfil de máxima potencia\", \"extra\": 5935}]}, {\"grupo\": \"equipo-5-memoria\", \"grupoEtiqueta\": \"Memoria de trabajo\", \"opciones\": [{\"valor\": \"base-5-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-5-memoria\", \"etiqueta\": \"Kit RAM de gran capacidad\", \"extra\": 3965}]}, {\"grupo\": \"equipo-5-experiencia\", \"grupoEtiqueta\": \"Cobertura y soporte\", \"opciones\": [{\"valor\": \"base-5-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-5-experiencia\", \"etiqueta\": \"Soporte premium de cinco años\", \"extra\": 2855}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (6,'Laptop Gamer 15.6\" Acemagic AMD Ryzen 5 7430U 16GB Ram 512GB SSD Win11 Pro Laptops','Laptop Gamer 15.6\" Acemagic AMD Ryzen 5 7430U 16GB Ram 512GB SSD Win11 Pro Laptops es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 5 7430U, Gráfica AMD Radeon RX Vega 7, 16 GB de memoria RAM, Almacenamiento 512 GB, Pantalla 15.6 pulgadas. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 5 7430U, Gráfica AMD Radeon RX Vega 7, 16 GB de memoria RAM, Almacenamiento 512 GB',2,7532.00,10168.20,NULL,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-01.png',NULL,8,'activo','ACEMAGIC','computadora','',0,0,0,10,0,'2026-11-10','[\"laptop\",\"gamer\",\"acemagic\",\"amd\",\"ryzen\",\"7430u\",\"16gb\",\"ram\",\"512gb\",\"ssd\",\"win11\",\"pro\",\"laptops\",\"desarrollo\"]','[{\"grupo\": \"equipo-6-rendimiento\", \"grupoEtiqueta\": \"Aceleración gráfica\", \"opciones\": [{\"valor\": \"base-6-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-6-rendimiento\", \"etiqueta\": \"Overclock de estudio\", \"extra\": 6882}]}, {\"grupo\": \"equipo-6-memoria\", \"grupoEtiqueta\": \"Almacenamiento ultrarrápido\", \"opciones\": [{\"valor\": \"base-6-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-6-memoria\", \"etiqueta\": \"SSD NVMe de expansión\", \"extra\": 4578}]}, {\"grupo\": \"equipo-6-experiencia\", \"grupoEtiqueta\": \"Refrigeración y silencio\", \"opciones\": [{\"valor\": \"base-6-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-6-experiencia\", \"etiqueta\": \"Lazo líquido silencioso\", \"extra\": 3286}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (7,'Laptop Hp Probook 445 G7 Ryzen 5 Económica 8gb Ram 256gb Ssd (Reacondicionado)','Laptop Hp Probook 445 G7 Ryzen 5 Económica 8gb Ram 256gb Ssd (Reacondicionado) es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 5 4500U, 8 GB de memoria RAM, Almacenamiento 256 GB SSD, Pantalla 1920x1080 Full HD, Windows 11 Pro. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 5 4500U, 8 GB de memoria RAM, Almacenamiento 256 GB SSD, Pantalla 1920x1080 Full HD',2,3951.91,5335.08,NULL,'imagenes/computadoras-desarrollo/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r-01.png',NULL,8,'activo','HP','computadora','',0,0,0,0,0,'2026-11-10','[\"laptop\",\"probook\",\"445\",\"ryzen\",\"económica\",\"8gb\",\"ram\",\"256gb\",\"ssd\",\"reacondicionado\",\"desarrollo\"]','[{\"grupo\": \"equipo-7-rendimiento\", \"grupoEtiqueta\": \"Potencia de procesamiento\", \"opciones\": [{\"valor\": \"base-7-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-7-rendimiento\", \"etiqueta\": \"Turbo multinúcleo\", \"extra\": 7829}]}, {\"grupo\": \"equipo-7-memoria\", \"grupoEtiqueta\": \"Memoria para proyectos\", \"opciones\": [{\"valor\": \"base-7-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-7-memoria\", \"etiqueta\": \"Memoria para multitarea extrema\", \"extra\": 5191}]}, {\"grupo\": \"equipo-7-experiencia\", \"grupoEtiqueta\": \"Movilidad extendida\", \"opciones\": [{\"valor\": \"base-7-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-7-experiencia\", \"etiqueta\": \"Batería de autonomía extendida\", \"extra\": 3717}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (8,'Laptop Dell 15 Dc15255 15.6 Ryzen 5 8gb, 512gb Full Hd Ssd Plateado','Laptop Dell 15 Dc15255 15.6 Ryzen 5 8gb, 512gb Full Hd Ssd Plateado es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 5 7520U, 8 GB de memoria RAM, Almacenamiento 512 GB, Windows 11 Home, Color Plateado. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 5 7520U, 8 GB de memoria RAM, Almacenamiento 512 GB, Windows 11 Home',2,7406.67,9999.00,NULL,'imagenes/computadoras-desarrollo/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu-01.png',NULL,8,'activo','DELL','computadora','',0,0,0,15,0,'2026-11-10','[\"laptop\",\"dell\",\"dc15255\",\"ryzen\",\"8gb\",\"512gb\",\"full\",\"ssd\",\"plateado\",\"desarrollo\"]','[{\"grupo\": \"equipo-8-rendimiento\", \"grupoEtiqueta\": \"Perfil de creación\", \"opciones\": [{\"valor\": \"base-8-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-8-rendimiento\", \"etiqueta\": \"Aceleración de IA\", \"extra\": 8776}]}, {\"grupo\": \"equipo-8-memoria\", \"grupoEtiqueta\": \"Capacidad de biblioteca\", \"opciones\": [{\"valor\": \"base-8-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-8-memoria\", \"etiqueta\": \"Archivo local de 16 TB\", \"extra\": 5804}]}, {\"grupo\": \"equipo-8-experiencia\", \"grupoEtiqueta\": \"Pantalla de referencia\", \"opciones\": [{\"valor\": \"base-8-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-8-experiencia\", \"etiqueta\": \"Panel calibrado de color\", \"extra\": 4148}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (9,'Laptop Lenovo Thinkpad X13g1 Amd Ryzen 5 4650 32gb 256gb Ssd (Reacondicionado)','Laptop Lenovo Thinkpad X13g1 Amd Ryzen 5 4650 32gb 256gb Ssd (Reacondicionado) es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 5 4650, 32 GB de memoria RAM, Almacenamiento 256 GB SSD, Pantalla 1920px x1080px, Windows 11 Pro. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 5 4650, 32 GB de memoria RAM, Almacenamiento 256 GB SSD, Pantalla 1920px x1080px',2,5628.89,7599.00,NULL,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32-01.png',NULL,1,'activo','LENOVO','computadora','',0,0,0,20,0,'2026-11-10','[\"laptop\",\"lenovo\",\"thinkpad\",\"x13g1\",\"amd\",\"ryzen\",\"4650\",\"32gb\",\"256gb\",\"ssd\",\"reacondicionado\",\"desarrollo\"]','[{\"grupo\": \"equipo-9-rendimiento\", \"grupoEtiqueta\": \"Modo de juego\", \"opciones\": [{\"valor\": \"base-9-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-9-rendimiento\", \"etiqueta\": \"Modo competitivo\", \"extra\": 9723}]}, {\"grupo\": \"equipo-9-memoria\", \"grupoEtiqueta\": \"Memoria de alto ancho de banda\", \"opciones\": [{\"valor\": \"base-9-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-9-memoria\", \"etiqueta\": \"Memoria de latencia ultrabaja\", \"extra\": 6417}]}, {\"grupo\": \"equipo-9-experiencia\", \"grupoEtiqueta\": \"Conectividad avanzada\", \"opciones\": [{\"valor\": \"base-9-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-9-experiencia\", \"etiqueta\": \"Dock Thunderbolt de expansión\", \"extra\": 4579}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (10,'Laptop Gaming 15.6 Loq15arp10 Amd Ryzen 7 16gb 512gb Lenovo','Laptop Gaming 15.6 Loq15arp10 Amd Ryzen 7 16gb 512gb Lenovo es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 7 7735HS, Gráfica RTX 4050, 16 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 7 7735HS, Gráfica RTX 4050, 16 GB de memoria RAM, Almacenamiento 512 GB SSD',2,17663.56,23845.81,NULL,'imagenes/computadoras-desarrollo/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,20,0,'2026-11-10','[\"laptop\",\"gaming\",\"loq15arp10\",\"amd\",\"ryzen\",\"16gb\",\"512gb\",\"lenovo\",\"desarrollo\"]','[{\"grupo\": \"equipo-10-rendimiento\", \"grupoEtiqueta\": \"Cómputo avanzado\", \"opciones\": [{\"valor\": \"base-10-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-10-rendimiento\", \"etiqueta\": \"Render sin límites\", \"extra\": 10670}]}, {\"grupo\": \"equipo-10-memoria\", \"grupoEtiqueta\": \"Memoria de trabajo\", \"opciones\": [{\"valor\": \"base-10-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-10-memoria\", \"etiqueta\": \"Kit RAM de gran capacidad\", \"extra\": 7030}]}, {\"grupo\": \"equipo-10-experiencia\", \"grupoEtiqueta\": \"Estación de trabajo\", \"opciones\": [{\"valor\": \"base-10-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-10-experiencia\", \"etiqueta\": \"Kit de captura y streaming\", \"extra\": 5010}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (11,'Laptop 15.6\'\' Games Amd Ryzen 5 7430u 16(8+8)gb 512gb Win11 Gris','Laptop 15.6\'\' Games Amd Ryzen 5 7430u 16(8+8)gb 512gb Win11 Gris es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 5 7430u, Gráfica AMD Radeon Graphics, 16 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 5 7430u, Gráfica AMD Radeon Graphics, 16 GB de memoria RAM, Almacenamiento 512 GB SSD',2,7694.81,10388.00,NULL,'imagenes/computadoras-desarrollo/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,31,0,'2026-11-10','[\"laptop\",\"games\",\"amd\",\"ryzen\",\"7430u\",\"512gb\",\"win11\",\"gris\",\"computlalte\",\"desarrollo\"]','[{\"grupo\": \"equipo-11-rendimiento\", \"grupoEtiqueta\": \"Perfil profesional\", \"opciones\": [{\"valor\": \"base-11-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-11-rendimiento\", \"etiqueta\": \"Perfil de máxima potencia\", \"extra\": 11617}]}, {\"grupo\": \"equipo-11-memoria\", \"grupoEtiqueta\": \"Almacenamiento ultrarrápido\", \"opciones\": [{\"valor\": \"base-11-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-11-memoria\", \"etiqueta\": \"SSD NVMe de expansión\", \"extra\": 7643}]}, {\"grupo\": \"equipo-11-experiencia\", \"grupoEtiqueta\": \"Cobertura y soporte\", \"opciones\": [{\"valor\": \"base-11-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-11-experiencia\", \"etiqueta\": \"Soporte premium de cinco años\", \"extra\": 5441}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (12,'Notebook Acer Aspire A325-42 Ryzen 7 7730u 16gb Ram 512gb Ssd Pantalla 15.6 Full Hd Windows 11 Home Color Plateado','Notebook Acer Aspire A325-42 Ryzen 7 7730u 16gb Ram 512gb Ssd Pantalla 15.6 Full Hd Windows 11 Home Color Plateado es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 7 7730u, 16 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px, Windows 11 Home. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 7 7730u, 16 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px',2,9628.89,12999.00,NULL,'imagenes/computadoras-desarrollo/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb-01.png',NULL,8,'activo','ACER','computadora','',0,0,0,1386,0,'2026-11-10','[\"notebook\",\"acer\",\"aspire\",\"a325\",\"ryzen\",\"7730u\",\"16gb\",\"ram\",\"512gb\",\"ssd\",\"pantalla\",\"full\",\"windows\",\"home\",\"color\",\"plateado\",\"desarrollo\"]','[{\"grupo\": \"equipo-12-rendimiento\", \"grupoEtiqueta\": \"Aceleración gráfica\", \"opciones\": [{\"valor\": \"base-12-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-12-rendimiento\", \"etiqueta\": \"Overclock de estudio\", \"extra\": 12564}]}, {\"grupo\": \"equipo-12-memoria\", \"grupoEtiqueta\": \"Memoria para proyectos\", \"opciones\": [{\"valor\": \"base-12-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-12-memoria\", \"etiqueta\": \"Memoria para multitarea extrema\", \"extra\": 8256}]}, {\"grupo\": \"equipo-12-experiencia\", \"grupoEtiqueta\": \"Refrigeración y silencio\", \"opciones\": [{\"valor\": \"base-12-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-12-experiencia\", \"etiqueta\": \"Lazo líquido silencioso\", \"extra\": 5872}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (13,'Laptop Games 15.6\'\' Amd Ryzen 7 7730u 16gb Ram 512gb Ssd Fhd Windows 11 Pro','Laptop Games 15.6\'\' Amd Ryzen 7 7730u 16gb Ram 512gb Ssd Fhd Windows 11 Pro es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 7 7730U, Gráfica AMD Radeon Graphics, 16 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 7 7730U, Gráfica AMD Radeon Graphics, 16 GB de memoria RAM, Almacenamiento 512 GB SSD',2,8657.78,11688.00,NULL,'imagenes/computadoras-desarrollo/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,150,0,'2026-11-10','[\"laptop\",\"games\",\"amd\",\"ryzen\",\"7730u\",\"16gb\",\"ram\",\"512gb\",\"ssd\",\"fhd\",\"windows\",\"pro\",\"computlalte\",\"desarrollo\"]','[{\"grupo\": \"equipo-13-rendimiento\", \"grupoEtiqueta\": \"Potencia de procesamiento\", \"opciones\": [{\"valor\": \"base-13-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-13-rendimiento\", \"etiqueta\": \"Turbo multinúcleo\", \"extra\": 13511}]}, {\"grupo\": \"equipo-13-memoria\", \"grupoEtiqueta\": \"Capacidad de biblioteca\", \"opciones\": [{\"valor\": \"base-13-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-13-memoria\", \"etiqueta\": \"Archivo local de 16 TB\", \"extra\": 8869}]}, {\"grupo\": \"equipo-13-experiencia\", \"grupoEtiqueta\": \"Movilidad extendida\", \"opciones\": [{\"valor\": \"base-13-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-13-experiencia\", \"etiqueta\": \"Batería de autonomía extendida\", \"extra\": 6303}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (14,'Laptop Gamer 15.6\" Acemagic AMD Ryzen 5 7430U 16GB Ram 512GB SSD Win11 Pro Laptops','Laptop Gamer 15.6\" Acemagic AMD Ryzen 5 7430U 16GB Ram 512GB SSD Win11 Pro Laptops es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 5 7430U, Gráfica AMD Radeon RX Vega 7, 16 GB de memoria RAM, Almacenamiento 512 GB, Pantalla 15.6 pulgadas. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 5 7430U, Gráfica AMD Radeon RX Vega 7, 16 GB de memoria RAM, Almacenamiento 512 GB',2,7532.00,10168.20,NULL,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2-01.png',NULL,8,'activo','ACEMAGIC','computadora','',0,0,0,10,0,'2026-11-10','[\"laptop\",\"gamer\",\"acemagic\",\"amd\",\"ryzen\",\"7430u\",\"16gb\",\"ram\",\"512gb\",\"ssd\",\"win11\",\"pro\",\"laptops\",\"desarrollo\"]','[{\"grupo\": \"equipo-14-rendimiento\", \"grupoEtiqueta\": \"Perfil de creación\", \"opciones\": [{\"valor\": \"base-14-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-14-rendimiento\", \"etiqueta\": \"Aceleración de IA\", \"extra\": 1658}]}, {\"grupo\": \"equipo-14-memoria\", \"grupoEtiqueta\": \"Memoria de alto ancho de banda\", \"opciones\": [{\"valor\": \"base-14-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-14-memoria\", \"etiqueta\": \"Memoria de latencia ultrabaja\", \"extra\": 9482}]}, {\"grupo\": \"equipo-14-experiencia\", \"grupoEtiqueta\": \"Pantalla de referencia\", \"opciones\": [{\"valor\": \"base-14-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-14-experiencia\", \"etiqueta\": \"Panel calibrado de color\", \"extra\": 6734}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (15,'Notebook Acer Gadget Erbook Ryzen 5 8gb 512gb Gris Fhd','Notebook Acer Gadget Erbook Ryzen 5 8gb 512gb Gris Fhd es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 5 7430U, Gráfica AMD Radeon Graphics, 8 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 5 7430U, Gráfica AMD Radeon Graphics, 8 GB de memoria RAM, Almacenamiento 512 GB SSD',2,7057.04,9527.01,NULL,'imagenes/computadoras-desarrollo/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr-01.png',NULL,8,'activo','ACER','computadora','',0,0,0,13,0,'2026-11-10','[\"notebook\",\"acer\",\"gadget\",\"erbook\",\"ryzen\",\"8gb\",\"512gb\",\"gris\",\"fhd\",\"desarrollo\"]','[{\"grupo\": \"equipo-15-rendimiento\", \"grupoEtiqueta\": \"Modo de juego\", \"opciones\": [{\"valor\": \"base-15-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-15-rendimiento\", \"etiqueta\": \"Modo competitivo\", \"extra\": 2605}]}, {\"grupo\": \"equipo-15-memoria\", \"grupoEtiqueta\": \"Memoria de trabajo\", \"opciones\": [{\"valor\": \"base-15-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-15-memoria\", \"etiqueta\": \"Kit RAM de gran capacidad\", \"extra\": 10095}]}, {\"grupo\": \"equipo-15-experiencia\", \"grupoEtiqueta\": \"Conectividad avanzada\", \"opciones\": [{\"valor\": \"base-15-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-15-experiencia\", \"etiqueta\": \"Dock Thunderbolt de expansión\", \"extra\": 7165}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (16,'Laptop Gamer LOQ 32gb Ram 512gb Ssd Rtx 5050 Gris Lenovo','Laptop Gamer LOQ 32gb Ram 512gb Ssd Rtx 5050 Gris Lenovo es un equipo de la categoría Desarrollo. Incluye Procesador Intel Core i5 13450Hx, Gráfica RTX 5050, 32 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador Intel Core i5 13450Hx, Gráfica RTX 5050, 32 GB de memoria RAM, Almacenamiento 512 GB SSD',2,22188.53,29954.52,NULL,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,40,0,'2026-11-10','[\"laptop\",\"gamer\",\"loq\",\"32gb\",\"ram\",\"512gb\",\"ssd\",\"rtx\",\"5050\",\"gris\",\"lenovo\",\"desarrollo\"]','[{\"grupo\": \"equipo-16-rendimiento\", \"grupoEtiqueta\": \"Cómputo avanzado\", \"opciones\": [{\"valor\": \"base-16-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-16-rendimiento\", \"etiqueta\": \"Render sin límites\", \"extra\": 3552}]}, {\"grupo\": \"equipo-16-memoria\", \"grupoEtiqueta\": \"Almacenamiento ultrarrápido\", \"opciones\": [{\"valor\": \"base-16-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-16-memoria\", \"etiqueta\": \"SSD NVMe de expansión\", \"extra\": 908}]}, {\"grupo\": \"equipo-16-experiencia\", \"grupoEtiqueta\": \"Estación de trabajo\", \"opciones\": [{\"valor\": \"base-16-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-16-experiencia\", \"etiqueta\": \"Kit de captura y streaming\", \"extra\": 7596}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (17,'Laptop Lenovo Ideapad Slim3 Core Ultra7 Serie 3 24gb 1tb Ssd Gris','Laptop Lenovo Ideapad Slim3 Core Ultra7 Serie 3 24gb 1tb Ssd Gris es un equipo de la categoría Desarrollo. Incluye Procesador Intel Core Ultra 7, Gráfica Integrados Intel UHD, 24 GB de memoria RAM, Almacenamiento 1 TB SSD, Pantalla 1920 px x 1200 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador Intel Core Ultra 7, Gráfica Integrados Intel UHD, 24 GB de memoria RAM, Almacenamiento 1 TB SSD',2,17237.40,23270.49,NULL,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,8,0,'2026-11-10','[\"laptop\",\"lenovo\",\"ideapad\",\"slim3\",\"core\",\"ultra7\",\"serie\",\"24gb\",\"1tb\",\"ssd\",\"gris\",\"desarrollo\"]','[{\"grupo\": \"equipo-17-rendimiento\", \"grupoEtiqueta\": \"Perfil profesional\", \"opciones\": [{\"valor\": \"base-17-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-17-rendimiento\", \"etiqueta\": \"Perfil de máxima potencia\", \"extra\": 4499}]}, {\"grupo\": \"equipo-17-memoria\", \"grupoEtiqueta\": \"Memoria para proyectos\", \"opciones\": [{\"valor\": \"base-17-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-17-memoria\", \"etiqueta\": \"Memoria para multitarea extrema\", \"extra\": 1521}]}, {\"grupo\": \"equipo-17-experiencia\", \"grupoEtiqueta\": \"Cobertura y soporte\", \"opciones\": [{\"valor\": \"base-17-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-17-experiencia\", \"etiqueta\": \"Soporte premium de cinco años\", \"extra\": 8027}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (18,'Laptop Lenovo Ideapad Slim 3 Intel Core 3 Gen 11 8gb 512gb','Laptop Lenovo Ideapad Slim 3 Intel Core 3 Gen 11 8gb 512gb es un equipo de la categoría Desarrollo. Incluye Procesador Intel Core 3 Series 304, 8 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920x1200, Windows 11 Home. Ideal para desarrollo, estudio y trabajo diario.','Procesador Intel Core 3 Series 304, 8 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920x1200',2,11110.37,14999.00,NULL,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,0,0,'2026-11-10','[\"laptop\",\"lenovo\",\"ideapad\",\"slim\",\"intel\",\"core\",\"gen\",\"8gb\",\"512gb\",\"desarrollo\"]','[{\"grupo\": \"equipo-18-rendimiento\", \"grupoEtiqueta\": \"Aceleración gráfica\", \"opciones\": [{\"valor\": \"base-18-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-18-rendimiento\", \"etiqueta\": \"Overclock de estudio\", \"extra\": 5446}]}, {\"grupo\": \"equipo-18-memoria\", \"grupoEtiqueta\": \"Capacidad de biblioteca\", \"opciones\": [{\"valor\": \"base-18-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-18-memoria\", \"etiqueta\": \"Archivo local de 16 TB\", \"extra\": 2134}]}, {\"grupo\": \"equipo-18-experiencia\", \"grupoEtiqueta\": \"Refrigeración y silencio\", \"opciones\": [{\"valor\": \"base-18-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-18-experiencia\", \"etiqueta\": \"Lazo líquido silencioso\", \"extra\": 858}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (19,'Laptop Lenovo Thinkpad T14 I5 16gb 256gb Win11 Pro','Laptop Lenovo Thinkpad T14 I5 16gb 256gb Win11 Pro es un equipo de la categoría Desarrollo. Incluye Procesador Intel Core i5, 16 GB de memoria RAM, Almacenamiento 256 GB SSD. Ideal para desarrollo, estudio y trabajo diario.','Procesador Intel Core i5, 16 GB de memoria RAM, Almacenamiento 256 GB SSD',2,4796.96,6475.90,NULL,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,36,0,'2026-11-10','[\"laptop\",\"lenovo\",\"thinkpad\",\"t14\",\"16gb\",\"256gb\",\"win11\",\"pro\",\"desarrollo\"]','[{\"grupo\": \"equipo-19-rendimiento\", \"grupoEtiqueta\": \"Potencia de procesamiento\", \"opciones\": [{\"valor\": \"base-19-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-19-rendimiento\", \"etiqueta\": \"Turbo multinúcleo\", \"extra\": 6393}]}, {\"grupo\": \"equipo-19-memoria\", \"grupoEtiqueta\": \"Memoria de alto ancho de banda\", \"opciones\": [{\"valor\": \"base-19-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-19-memoria\", \"etiqueta\": \"Memoria de latencia ultrabaja\", \"extra\": 2747}]}, {\"grupo\": \"equipo-19-experiencia\", \"grupoEtiqueta\": \"Movilidad extendida\", \"opciones\": [{\"valor\": \"base-19-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-19-experiencia\", \"etiqueta\": \"Batería de autonomía extendida\", \"extra\": 1289}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (20,'Lenovo ThinkPad T14 Gen 3 Pantalla táctil portátil Intel Core i5-1245U Iris Xe Gráficos 16GB RAM 256GB SSD Windows 11 Pro Notabook PC para juegos, Estudios y Negocios','Lenovo ThinkPad T14 Gen 3 Pantalla táctil portátil Intel Core i5-1245U Iris Xe Gráficos 16GB RAM 256GB SSD Windows 11 Pro Notabook PC para juegos, Estudios y Negocios es un equipo de la categoría Desarrollo. Incluye Procesador Intel Core i5 1245U, Gráfica Intel Iris Xe Graphics, 16 GB de memoria RAM, Almacenamiento 256 GB SSD, Pantalla 1920 px x 1200 px táctil. Ideal para desarrollo, estudio y trabajo diario.','Procesador Intel Core i5 1245U, Gráfica Intel Iris Xe Graphics, 16 GB de memoria RAM, Almacenamiento 256 GB SSD',2,6375.33,8606.70,NULL,'imagenes/computadoras-desarrollo/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,0,0,'2026-11-10','[\"lenovo\",\"thinkpad\",\"t14\",\"gen\",\"pantalla\",\"táctil\",\"portátil\",\"intel\",\"core\",\"1245u\",\"iris\",\"gráficos\",\"16gb\",\"ram\",\"256gb\",\"ssd\",\"windows\",\"pro\",\"notabook\",\"para\",\"juegos\",\"estudios\",\"negocios\",\"desarrollo\"]','[{\"grupo\": \"equipo-20-rendimiento\", \"grupoEtiqueta\": \"Perfil de creación\", \"opciones\": [{\"valor\": \"base-20-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-20-rendimiento\", \"etiqueta\": \"Aceleración de IA\", \"extra\": 7340}]}, {\"grupo\": \"equipo-20-memoria\", \"grupoEtiqueta\": \"Memoria de trabajo\", \"opciones\": [{\"valor\": \"base-20-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-20-memoria\", \"etiqueta\": \"Kit RAM de gran capacidad\", \"extra\": 3360}]}, {\"grupo\": \"equipo-20-experiencia\", \"grupoEtiqueta\": \"Pantalla de referencia\", \"opciones\": [{\"valor\": \"base-20-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-20-experiencia\", \"etiqueta\": \"Panel calibrado de color\", \"extra\": 1720}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (21,'Laptop Acemagic 15.6\'\' Intel I5 12600h 24gb Ram 512gb Ssd','Laptop Acemagic 15.6\'\' Intel I5 12600h 24gb Ram 512gb Ssd es un equipo de la categoría Desarrollo. Incluye Procesador Intel Core i5 12600h, 24 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 15.6 pulgadas. Ideal para desarrollo, estudio y trabajo diario.','Procesador Intel Core i5 12600h, 24 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 15.6 pulgadas',2,8628.53,11648.52,NULL,'imagenes/computadoras-desarrollo/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51-01.png',NULL,5,'activo','ACEMAGIC','computadora','',0,0,0,26,0,'2026-11-10','[\"laptop\",\"acemagic\",\"intel\",\"12600h\",\"24gb\",\"ram\",\"512gb\",\"ssd\",\"desarrollo\"]','[{\"grupo\": \"equipo-21-rendimiento\", \"grupoEtiqueta\": \"Modo de juego\", \"opciones\": [{\"valor\": \"base-21-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-21-rendimiento\", \"etiqueta\": \"Modo competitivo\", \"extra\": 8287}]}, {\"grupo\": \"equipo-21-memoria\", \"grupoEtiqueta\": \"Almacenamiento ultrarrápido\", \"opciones\": [{\"valor\": \"base-21-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-21-memoria\", \"etiqueta\": \"SSD NVMe de expansión\", \"extra\": 3973}]}, {\"grupo\": \"equipo-21-experiencia\", \"grupoEtiqueta\": \"Conectividad avanzada\", \"opciones\": [{\"valor\": \"base-21-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-21-experiencia\", \"etiqueta\": \"Dock Thunderbolt de expansión\", \"extra\": 2151}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (22,'Laptop Lenovo Ideapad 15,3 Snapdragon X 24gb + 512gb Con IA','Laptop Lenovo Ideapad 15,3 Snapdragon X 24gb + 512gb Con IA es un equipo de la categoría Desarrollo. Incluye Procesador Qualcomm Snapdragon X X1-26-100, Gráfica Qualcomm Adreno, 24 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1200 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador Qualcomm Snapdragon X X1-26-100, Gráfica Qualcomm Adreno, 24 GB de memoria RAM, Almacenamiento 512 GB SSD',2,14814.07,19999.00,NULL,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,92,0,'2026-11-10','[\"laptop\",\"lenovo\",\"ideapad\",\"snapdragon\",\"24gb\",\"512gb\",\"con\",\"desarrollo\"]','[{\"grupo\": \"equipo-22-rendimiento\", \"grupoEtiqueta\": \"Cómputo avanzado\", \"opciones\": [{\"valor\": \"base-22-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-22-rendimiento\", \"etiqueta\": \"Render sin límites\", \"extra\": 9234}]}, {\"grupo\": \"equipo-22-memoria\", \"grupoEtiqueta\": \"Memoria para proyectos\", \"opciones\": [{\"valor\": \"base-22-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-22-memoria\", \"etiqueta\": \"Memoria para multitarea extrema\", \"extra\": 4586}]}, {\"grupo\": \"equipo-22-experiencia\", \"grupoEtiqueta\": \"Estación de trabajo\", \"opciones\": [{\"valor\": \"base-22-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-22-experiencia\", \"etiqueta\": \"Kit de captura y streaming\", \"extra\": 2582}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (23,'Laptop Lenovo Ideapad Slim 3 Touch Ryzen 7 16gb 512gb Ssd','Laptop Lenovo Ideapad Slim 3 Touch Ryzen 7 16gb 512gb Ssd es un equipo de la categoría Desarrollo. Incluye Procesador AMD Ryzen 7 8840HS, Gráfica Radeon 780M, 16 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920x1200. Ideal para desarrollo, estudio y trabajo diario.','Procesador AMD Ryzen 7 8840HS, Gráfica Radeon 780M, 16 GB de memoria RAM, Almacenamiento 512 GB SSD',2,12962.22,17499.00,NULL,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,10,0,'2026-11-10','[\"laptop\",\"lenovo\",\"ideapad\",\"slim\",\"touch\",\"ryzen\",\"16gb\",\"512gb\",\"ssd\",\"desarrollo\"]','[{\"grupo\": \"equipo-23-rendimiento\", \"grupoEtiqueta\": \"Perfil profesional\", \"opciones\": [{\"valor\": \"base-23-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-23-rendimiento\", \"etiqueta\": \"Perfil de máxima potencia\", \"extra\": 10181}]}, {\"grupo\": \"equipo-23-memoria\", \"grupoEtiqueta\": \"Capacidad de biblioteca\", \"opciones\": [{\"valor\": \"base-23-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-23-memoria\", \"etiqueta\": \"Archivo local de 16 TB\", \"extra\": 5199}]}, {\"grupo\": \"equipo-23-experiencia\", \"grupoEtiqueta\": \"Cobertura y soporte\", \"opciones\": [{\"valor\": \"base-23-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-23-experiencia\", \"etiqueta\": \"Soporte premium de cinco años\", \"extra\": 3013}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (24,'Laptop Gamer LOQ 32gb Ram 512gb Ssd Rtx 5050 Gris Lenovo','Laptop Gamer LOQ 32gb Ram 512gb Ssd Rtx 5050 Gris Lenovo es un equipo de la categoría Desarrollo. Incluye Procesador Intel Core i5 13450Hx, Gráfica RTX 5050, 32 GB de memoria RAM, Almacenamiento 512 GB SSD, Pantalla 1920 px x 1080 px. Ideal para desarrollo, estudio y trabajo diario.','Procesador Intel Core i5 13450Hx, Gráfica RTX 5050, 32 GB de memoria RAM, Almacenamiento 512 GB SSD',2,22188.53,29954.52,NULL,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2-01.png',NULL,8,'activo','LENOVO','computadora','',0,0,0,40,0,'2026-11-10','[\"laptop\",\"gamer\",\"loq\",\"32gb\",\"ram\",\"512gb\",\"ssd\",\"rtx\",\"5050\",\"gris\",\"lenovo\",\"desarrollo\"]','[{\"grupo\": \"equipo-24-rendimiento\", \"grupoEtiqueta\": \"Aceleración gráfica\", \"opciones\": [{\"valor\": \"base-24-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-24-rendimiento\", \"etiqueta\": \"Overclock de estudio\", \"extra\": 11128}]}, {\"grupo\": \"equipo-24-memoria\", \"grupoEtiqueta\": \"Memoria de alto ancho de banda\", \"opciones\": [{\"valor\": \"base-24-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-24-memoria\", \"etiqueta\": \"Memoria de latencia ultrabaja\", \"extra\": 5812}]}, {\"grupo\": \"equipo-24-experiencia\", \"grupoEtiqueta\": \"Refrigeración y silencio\", \"opciones\": [{\"valor\": \"base-24-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-24-experiencia\", \"etiqueta\": \"Lazo líquido silencioso\", \"extra\": 3444}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (25,'Pc Gamer Rtx 4070 Super Ryzen 9 Torre Cooler 32gb 1tb Ir02','Pc Gamer Rtx 4070 Super Ryzen 9 Torre Cooler 32gb 1tb Ir02 es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 9 5900X, Gráfica RTX 5070 12GB, 32 GB de memoria RAM, Almacenamiento 1 TB SSD. Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 9 5900X, Gráfica RTX 5070 12GB, 32 GB de memoria RAM, Almacenamiento 1 TB SSD',1,35480.74,47899.00,NULL,'imagenes/computadoras-gaming/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,0,0,'2026-11-10','[\"gamer\",\"rtx\",\"4070\",\"super\",\"ryzen\",\"torre\",\"cooler\",\"32gb\",\"1tb\",\"ir02\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-25-rendimiento\", \"grupoEtiqueta\": \"Potencia de procesamiento\", \"opciones\": [{\"valor\": \"base-25-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-25-rendimiento\", \"etiqueta\": \"Turbo multinúcleo\", \"extra\": 12075}]}, {\"grupo\": \"equipo-25-memoria\", \"grupoEtiqueta\": \"Memoria de trabajo\", \"opciones\": [{\"valor\": \"base-25-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-25-memoria\", \"etiqueta\": \"Kit RAM de gran capacidad\", \"extra\": 6425}]}, {\"grupo\": \"equipo-25-experiencia\", \"grupoEtiqueta\": \"Movilidad extendida\", \"opciones\": [{\"valor\": \"base-25-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-25-experiencia\", \"etiqueta\": \"Batería de autonomía extendida\", \"extra\": 3875}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (26,'Pc Gamer Rgb Amd Ryzen 9700x 32gb Ddr5 1tb Ssd Rtx 5060 Msi','Pc Gamer Rgb Amd Ryzen 9700x 32gb Ddr5 1tb Ssd Rtx 5060 Msi es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 7 9700X, Gráfica GeForce RTX 5060, 32 GB de memoria RAM, Almacenamiento 1 TB. Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 7 9700X, Gráfica GeForce RTX 5060, 32 GB de memoria RAM, Almacenamiento 1 TB',1,28988.64,39134.67,NULL,'imagenes/computadoras-gaming/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r-01.png',NULL,8,'activo','MSI','computadora','',0,0,0,5,0,'2026-11-10','[\"gamer\",\"rgb\",\"amd\",\"ryzen\",\"9700x\",\"32gb\",\"ddr5\",\"1tb\",\"ssd\",\"rtx\",\"5060\",\"msi\",\"juegos\"]','[{\"grupo\": \"equipo-26-rendimiento\", \"grupoEtiqueta\": \"Perfil de creación\", \"opciones\": [{\"valor\": \"base-26-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-26-rendimiento\", \"etiqueta\": \"Aceleración de IA\", \"extra\": 13022}]}, {\"grupo\": \"equipo-26-memoria\", \"grupoEtiqueta\": \"Almacenamiento ultrarrápido\", \"opciones\": [{\"valor\": \"base-26-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-26-memoria\", \"etiqueta\": \"SSD NVMe de expansión\", \"extra\": 7038}]}, {\"grupo\": \"equipo-26-experiencia\", \"grupoEtiqueta\": \"Pantalla de referencia\", \"opciones\": [{\"valor\": \"base-26-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-26-experiencia\", \"etiqueta\": \"Panel calibrado de color\", \"extra\": 4306}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (27,'Pc Gamer Rtx 5060 Ryzen 9 5900x Ram 32gb 1tb Tcu Liquido 360','Pc Gamer Rtx 5060 Ryzen 9 5900x Ram 32gb 1tb Tcu Liquido 360 es un equipo de la categoría Juegos. Incluye Procesador Ryzen 9 5900x, Gráfica RTX 5060 8GB, 32 GB de memoria RAM, Almacenamiento 1 TB. Ideal para gaming, estudio y multitarea.','Procesador Ryzen 9 5900x, Gráfica RTX 5060 8GB, 32 GB de memoria RAM, Almacenamiento 1 TB',1,28443.70,38399.00,NULL,'imagenes/computadoras-gaming/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,0,0,'2026-11-10','[\"gamer\",\"rtx\",\"5060\",\"ryzen\",\"5900x\",\"ram\",\"32gb\",\"1tb\",\"tcu\",\"liquido\",\"360\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-27-rendimiento\", \"grupoEtiqueta\": \"Modo de juego\", \"opciones\": [{\"valor\": \"base-27-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-27-rendimiento\", \"etiqueta\": \"Modo competitivo\", \"extra\": 13969}]}, {\"grupo\": \"equipo-27-memoria\", \"grupoEtiqueta\": \"Memoria para proyectos\", \"opciones\": [{\"valor\": \"base-27-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-27-memoria\", \"etiqueta\": \"Memoria para multitarea extrema\", \"extra\": 7651}]}, {\"grupo\": \"equipo-27-experiencia\", \"grupoEtiqueta\": \"Conectividad avanzada\", \"opciones\": [{\"valor\": \"base-27-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-27-experiencia\", \"etiqueta\": \"Dock Thunderbolt de expansión\", \"extra\": 4737}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (28,'Pc Powerbit Vortex: R7, 16gb, M.2 512gb, Rx7600, Wi-fi','Pc Powerbit Vortex: R7, 16gb, M.2 512gb, Rx7600, Wi-fi es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 7 5700X, Gráfica AMD Radeon RX 7600, 16 GB de memoria RAM, Almacenamiento 512 GB, Windows 11 Home (Versión de Prueba). Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 7 5700X, Gráfica AMD Radeon RX 7600, 16 GB de memoria RAM, Almacenamiento 512 GB',1,11851.11,15999.00,NULL,'imagenes/computadoras-gaming/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f-01.png',NULL,8,'activo','POWERBIT','computadora','',0,0,0,0,0,'2026-11-10','[\"powerbit\",\"vortex\",\"16gb\",\"512gb\",\"rx7600\",\"juegos\"]','[{\"grupo\": \"equipo-28-rendimiento\", \"grupoEtiqueta\": \"Cómputo avanzado\", \"opciones\": [{\"valor\": \"base-28-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-28-rendimiento\", \"etiqueta\": \"Render sin límites\", \"extra\": 2116}]}, {\"grupo\": \"equipo-28-memoria\", \"grupoEtiqueta\": \"Capacidad de biblioteca\", \"opciones\": [{\"valor\": \"base-28-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-28-memoria\", \"etiqueta\": \"Archivo local de 16 TB\", \"extra\": 8264}]}, {\"grupo\": \"equipo-28-experiencia\", \"grupoEtiqueta\": \"Estación de trabajo\", \"opciones\": [{\"valor\": \"base-28-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-28-experiencia\", \"etiqueta\": \"Kit de captura y streaming\", \"extra\": 5168}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (29,'Pc Gamer Powerbit Phantom: R7, 16gb, M.2 512gb, Rtx 5050','Pc Gamer Powerbit Phantom: R7, 16gb, M.2 512gb, Rtx 5050 es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 7 5700X, Gráfica NVIDIA GeForce RTX 5050, 16 GB de memoria RAM, Almacenamiento 512 GB, Windows 11 Home (Versión de Prueba). Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 7 5700X, Gráfica NVIDIA GeForce RTX 5050, 16 GB de memoria RAM, Almacenamiento 512 GB',1,13110.37,17699.00,NULL,'imagenes/computadoras-gaming/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx-01.png',NULL,8,'activo','POWERBIT','computadora','',0,0,0,0,0,'2026-11-10','[\"gamer\",\"powerbit\",\"phantom\",\"16gb\",\"512gb\",\"rtx\",\"5050\",\"juegos\"]','[{\"grupo\": \"equipo-29-rendimiento\", \"grupoEtiqueta\": \"Perfil profesional\", \"opciones\": [{\"valor\": \"base-29-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-29-rendimiento\", \"etiqueta\": \"Perfil de máxima potencia\", \"extra\": 3063}]}, {\"grupo\": \"equipo-29-memoria\", \"grupoEtiqueta\": \"Memoria de alto ancho de banda\", \"opciones\": [{\"valor\": \"base-29-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-29-memoria\", \"etiqueta\": \"Memoria de latencia ultrabaja\", \"extra\": 8877}]}, {\"grupo\": \"equipo-29-experiencia\", \"grupoEtiqueta\": \"Cobertura y soporte\", \"opciones\": [{\"valor\": \"base-29-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-29-experiencia\", \"etiqueta\": \"Soporte premium de cinco años\", \"extra\": 5599}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (30,'PC Gamer Xtreme PC Gaming ASUS TUF NVIDIA GeForce RTX 5060 AMD Ryzen 5 5500 16GB SSD 1TB WIFI White gaming 1080p, estudios y multitarea','PC Gamer Xtreme PC Gaming ASUS TUF NVIDIA GeForce RTX 5060 AMD Ryzen 5 5500 16GB SSD 1TB WIFI White gaming 1080p, estudios y multitarea es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 5 5500, Gráfica RTX 5060, 16 GB de memoria RAM, Almacenamiento 1 TB SSD. Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 5 5500, Gráfica RTX 5060, 16 GB de memoria RAM, Almacenamiento 1 TB SSD',1,16962.22,22899.00,NULL,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-01.png',NULL,1,'activo','ASUS','computadora','',0,0,0,3,0,'2026-11-10','[\"gamer\",\"xtreme\",\"gaming\",\"asus\",\"tuf\",\"nvidia\",\"geforce\",\"rtx\",\"5060\",\"amd\",\"ryzen\",\"5500\",\"16gb\",\"ssd\",\"1tb\",\"wifi\",\"white\",\"1080p\",\"estudios\",\"multitarea\",\"juegos\"]','[{\"grupo\": \"equipo-30-rendimiento\", \"grupoEtiqueta\": \"Aceleración gráfica\", \"opciones\": [{\"valor\": \"base-30-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-30-rendimiento\", \"etiqueta\": \"Overclock de estudio\", \"extra\": 4010}]}, {\"grupo\": \"equipo-30-memoria\", \"grupoEtiqueta\": \"Memoria de trabajo\", \"opciones\": [{\"valor\": \"base-30-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-30-memoria\", \"etiqueta\": \"Kit RAM de gran capacidad\", \"extra\": 9490}]}, {\"grupo\": \"equipo-30-experiencia\", \"grupoEtiqueta\": \"Refrigeración y silencio\", \"opciones\": [{\"valor\": \"base-30-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-30-experiencia\", \"etiqueta\": \"Lazo líquido silencioso\", \"extra\": 6030}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (31,'PC Gamer Xtreme PC Gaming NVIDIA GeForce RTX 5060 Intel Core i5 12400F 16GB SSD 1TB WIFI White gaming 1080p, estudios y multitarea','PC Gamer Xtreme PC Gaming NVIDIA GeForce RTX 5060 Intel Core i5 12400F 16GB SSD 1TB WIFI White gaming 1080p, estudios y multitarea es un equipo de la categoría Juegos. Incluye Procesador Intel Core i5 12400F, Gráfica NVIDIA GeForce RTX 5060, 16 GB de memoria RAM, Almacenamiento 1 TB. Ideal para gaming, estudio y multitarea.','Procesador Intel Core i5 12400F, Gráfica NVIDIA GeForce RTX 5060, 16 GB de memoria RAM, Almacenamiento 1 TB',1,17184.44,23199.00,NULL,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506-01.png',NULL,1,'activo','COMPUTLALTE','computadora','',0,0,0,23,0,'2026-11-10','[\"gamer\",\"xtreme\",\"gaming\",\"nvidia\",\"geforce\",\"rtx\",\"5060\",\"intel\",\"core\",\"12400f\",\"16gb\",\"ssd\",\"1tb\",\"wifi\",\"white\",\"1080p\",\"estudios\",\"multitarea\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-31-rendimiento\", \"grupoEtiqueta\": \"Potencia de procesamiento\", \"opciones\": [{\"valor\": \"base-31-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-31-rendimiento\", \"etiqueta\": \"Turbo multinúcleo\", \"extra\": 4957}]}, {\"grupo\": \"equipo-31-memoria\", \"grupoEtiqueta\": \"Almacenamiento ultrarrápido\", \"opciones\": [{\"valor\": \"base-31-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-31-memoria\", \"etiqueta\": \"SSD NVMe de expansión\", \"extra\": 10103}]}, {\"grupo\": \"equipo-31-experiencia\", \"grupoEtiqueta\": \"Movilidad extendida\", \"opciones\": [{\"valor\": \"base-31-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-31-experiencia\", \"etiqueta\": \"Batería de autonomía extendida\", \"extra\": 6461}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (32,'PC Gamer Xtreme PC Gaming ASUS TUF NVIDIA GeForce RTX 5060 Intel Core i5 12400F 16GB SSD 1TB WIFI Black gaming 1080p, estudios y multitarea','PC Gamer Xtreme PC Gaming ASUS TUF NVIDIA GeForce RTX 5060 Intel Core i5 12400F 16GB SSD 1TB WIFI Black gaming 1080p, estudios y multitarea es un equipo de la categoría Juegos. Incluye Procesador Intel Core i5 12400F, Gráfica NVIDIA GeForce RTX 5060, 16 GB de memoria RAM, Almacenamiento 1 TB SSD. Ideal para gaming, estudio y multitarea.','Procesador Intel Core i5 12400F, Gráfica NVIDIA GeForce RTX 5060, 16 GB de memoria RAM, Almacenamiento 1 TB SSD',1,18369.63,24799.00,NULL,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2-01.png',NULL,2,'activo','ASUS','computadora','',0,0,0,11,0,'2026-11-10','[\"gamer\",\"xtreme\",\"gaming\",\"asus\",\"tuf\",\"nvidia\",\"geforce\",\"rtx\",\"5060\",\"intel\",\"core\",\"12400f\",\"16gb\",\"ssd\",\"1tb\",\"wifi\",\"black\",\"1080p\",\"estudios\",\"multitarea\",\"juegos\"]','[{\"grupo\": \"equipo-32-rendimiento\", \"grupoEtiqueta\": \"Perfil de creación\", \"opciones\": [{\"valor\": \"base-32-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-32-rendimiento\", \"etiqueta\": \"Aceleración de IA\", \"extra\": 5904}]}, {\"grupo\": \"equipo-32-memoria\", \"grupoEtiqueta\": \"Memoria para proyectos\", \"opciones\": [{\"valor\": \"base-32-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-32-memoria\", \"etiqueta\": \"Memoria para multitarea extrema\", \"extra\": 916}]}, {\"grupo\": \"equipo-32-experiencia\", \"grupoEtiqueta\": \"Pantalla de referencia\", \"opciones\": [{\"valor\": \"base-32-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-32-experiencia\", \"etiqueta\": \"Panel calibrado de color\", \"extra\": 6892}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (33,'PC Gamer IA Entry Xtreme PC Gaming ASUS NVIDIA GeForce RTX 5060 Ti Intel Core Ultra 7 16GB DDR5 SSD 1TB WIFI White PBA Productividad Versátil Acelerada con IA','PC Gamer IA Entry Xtreme PC Gaming ASUS NVIDIA GeForce RTX 5060 Ti Intel Core Ultra 7 16GB DDR5 SSD 1TB WIFI White PBA Productividad Versátil Acelerada con IA es un equipo de la categoría Juegos. Incluye Procesador Intel Core Ultra 7, Gráfica RTX 5060 Ti, 16 GB de memoria RAM, Almacenamiento 1 TB SSD. Ideal para gaming, estudio y multitarea.','Procesador Intel Core Ultra 7, Gráfica RTX 5060 Ti, 16 GB de memoria RAM, Almacenamiento 1 TB SSD',1,25110.37,33899.00,NULL,'imagenes/computadoras-gaming/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g-01.png',NULL,1,'activo','ASUS','computadora','',0,0,0,6,0,'2026-11-10','[\"gamer\",\"entry\",\"xtreme\",\"gaming\",\"asus\",\"nvidia\",\"geforce\",\"rtx\",\"5060\",\"intel\",\"core\",\"ultra\",\"16gb\",\"ddr5\",\"ssd\",\"1tb\",\"wifi\",\"white\",\"pba\",\"productividad\",\"versátil\",\"acelerada\",\"con\",\"juegos\"]','[{\"grupo\": \"equipo-33-rendimiento\", \"grupoEtiqueta\": \"Modo de juego\", \"opciones\": [{\"valor\": \"base-33-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-33-rendimiento\", \"etiqueta\": \"Modo competitivo\", \"extra\": 6851}]}, {\"grupo\": \"equipo-33-memoria\", \"grupoEtiqueta\": \"Capacidad de biblioteca\", \"opciones\": [{\"valor\": \"base-33-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-33-memoria\", \"etiqueta\": \"Archivo local de 16 TB\", \"extra\": 1529}]}, {\"grupo\": \"equipo-33-experiencia\", \"grupoEtiqueta\": \"Conectividad avanzada\", \"opciones\": [{\"valor\": \"base-33-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-33-experiencia\", \"etiqueta\": \"Dock Thunderbolt de expansión\", \"extra\": 7323}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (34,'Pc Gamer Blanca Enfriamiento Líquido Corei7 Rtx 4060 Ti 64gb','Pc Gamer Blanca Enfriamiento Líquido Corei7 Rtx 4060 Ti 64gb es un equipo de la categoría Juegos. Incluye Procesador Intel Core i7, Gráfica NVIDIA GeForce RTX 4060 Ti ó RTX 5060, 64 GB de memoria RAM, Almacenamiento 1 TB. Ideal para gaming, estudio y multitarea.','Procesador Intel Core i7, Gráfica NVIDIA GeForce RTX 4060 Ti ó RTX 5060, 64 GB de memoria RAM, Almacenamiento 1 TB',1,34725.93,46880.00,NULL,'imagenes/computadoras-gaming/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,1,0,'2026-11-10','[\"gamer\",\"blanca\",\"enfriamiento\",\"líquido\",\"corei7\",\"rtx\",\"4060\",\"64gb\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-34-rendimiento\", \"grupoEtiqueta\": \"Cómputo avanzado\", \"opciones\": [{\"valor\": \"base-34-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-34-rendimiento\", \"etiqueta\": \"Render sin límites\", \"extra\": 7798}]}, {\"grupo\": \"equipo-34-memoria\", \"grupoEtiqueta\": \"Memoria de alto ancho de banda\", \"opciones\": [{\"valor\": \"base-34-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-34-memoria\", \"etiqueta\": \"Memoria de latencia ultrabaja\", \"extra\": 2142}]}, {\"grupo\": \"equipo-34-experiencia\", \"grupoEtiqueta\": \"Estación de trabajo\", \"opciones\": [{\"valor\": \"base-34-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-34-experiencia\", \"etiqueta\": \"Kit de captura y streaming\", \"extra\": 7754}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (35,'Pc Gamer Blanca 12 Gb Vram Intel I9 Rtx 5070 32gb Ddr5 Ssd','Pc Gamer Blanca 12 Gb Vram Intel I9 Rtx 5070 32gb Ddr5 Ssd es un equipo de la categoría Juegos. Incluye Procesador Intel Core i9 14900KF, Gráfica NVIDIA GeForce RTX 5070, 32 GB de memoria RAM, Almacenamiento 1 TB, Windows 10 Pro. Ideal para gaming, estudio y multitarea.','Procesador Intel Core i9 14900KF, Gráfica NVIDIA GeForce RTX 5070, 32 GB de memoria RAM, Almacenamiento 1 TB',1,47022.22,63480.00,NULL,'imagenes/computadoras-gaming/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,0,0,'2026-11-10','[\"gamer\",\"blanca\",\"vram\",\"intel\",\"rtx\",\"5070\",\"32gb\",\"ddr5\",\"ssd\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-35-rendimiento\", \"grupoEtiqueta\": \"Perfil profesional\", \"opciones\": [{\"valor\": \"base-35-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-35-rendimiento\", \"etiqueta\": \"Perfil de máxima potencia\", \"extra\": 8745}]}, {\"grupo\": \"equipo-35-memoria\", \"grupoEtiqueta\": \"Memoria de trabajo\", \"opciones\": [{\"valor\": \"base-35-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-35-memoria\", \"etiqueta\": \"Kit RAM de gran capacidad\", \"extra\": 2755}]}, {\"grupo\": \"equipo-35-experiencia\", \"grupoEtiqueta\": \"Cobertura y soporte\", \"opciones\": [{\"valor\": \"base-35-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-35-experiencia\", \"etiqueta\": \"Soporte premium de cinco años\", \"extra\": 8185}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (36,'Pc Gamer Grizzly Intel I9 12900f Rtx5070 Ram 32 Gb Ssd 2 Tb','Pc Gamer Grizzly Intel I9 12900f Rtx5070 Ram 32 Gb Ssd 2 Tb es un equipo de la categoría Juegos. Incluye Procesador Intel Core i9 12900F, Gráfica Nvidia RTX 5070, 32 GB de memoria RAM, Almacenamiento 2 TB, Windows 11 Pro. Ideal para gaming, estudio y multitarea.','Procesador Intel Core i9 12900F, Gráfica Nvidia RTX 5070, 32 GB de memoria RAM, Almacenamiento 2 TB',1,40665.93,54899.00,NULL,'imagenes/computadoras-gaming/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,0,0,'2026-11-10','[\"gamer\",\"grizzly\",\"intel\",\"12900f\",\"rtx5070\",\"ram\",\"ssd\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-36-rendimiento\", \"grupoEtiqueta\": \"Aceleración gráfica\", \"opciones\": [{\"valor\": \"base-36-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-36-rendimiento\", \"etiqueta\": \"Overclock de estudio\", \"extra\": 9692}]}, {\"grupo\": \"equipo-36-memoria\", \"grupoEtiqueta\": \"Almacenamiento ultrarrápido\", \"opciones\": [{\"valor\": \"base-36-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-36-memoria\", \"etiqueta\": \"SSD NVMe de expansión\", \"extra\": 3368}]}, {\"grupo\": \"equipo-36-experiencia\", \"grupoEtiqueta\": \"Refrigeración y silencio\", \"opciones\": [{\"valor\": \"base-36-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-36-experiencia\", \"etiqueta\": \"Lazo líquido silencioso\", \"extra\": 1016}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (37,'Pc Gamer Grizzly Amd Ryzen 9 Rtx5060 Ram 32 Gb Ssd 2tb','Pc Gamer Grizzly Amd Ryzen 9 Rtx5060 Ram 32 Gb Ssd 2tb es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 9 5900XT, Gráfica RTX 5060, 32 GB de memoria RAM, Almacenamiento 2 TB. Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 9 5900XT, Gráfica RTX 5060, 32 GB de memoria RAM, Almacenamiento 2 TB',1,30517.78,41199.00,NULL,'imagenes/computadoras-gaming/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s-01.png',NULL,3,'activo','COMPUTLALTE','computadora','',0,0,0,1,0,'2026-11-10','[\"gamer\",\"grizzly\",\"amd\",\"ryzen\",\"rtx5060\",\"ram\",\"ssd\",\"2tb\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-37-rendimiento\", \"grupoEtiqueta\": \"Potencia de procesamiento\", \"opciones\": [{\"valor\": \"base-37-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-37-rendimiento\", \"etiqueta\": \"Turbo multinúcleo\", \"extra\": 10639}]}, {\"grupo\": \"equipo-37-memoria\", \"grupoEtiqueta\": \"Memoria para proyectos\", \"opciones\": [{\"valor\": \"base-37-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-37-memoria\", \"etiqueta\": \"Memoria para multitarea extrema\", \"extra\": 3981}]}, {\"grupo\": \"equipo-37-experiencia\", \"grupoEtiqueta\": \"Movilidad extendida\", \"opciones\": [{\"valor\": \"base-37-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-37-experiencia\", \"etiqueta\": \"Batería de autonomía extendida\", \"extra\": 1447}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (38,'Pc Gamer Blanca Ryzen 7 5700 Enf Líquido Rtx 4060/5050 32gb','Pc Gamer Blanca Ryzen 7 5700 Enf Líquido Rtx 4060/5050 32gb es un equipo de la categoría Juegos. Incluye Procesador Ryzen 7 5700, Gráfica RTX 5050, 32 GB de memoria RAM, Almacenamiento 1 TB. Ideal para gaming, estudio y multitarea.','Procesador Ryzen 7 5700, Gráfica RTX 5050, 32 GB de memoria RAM, Almacenamiento 1 TB',1,20725.93,27980.00,NULL,'imagenes/computadoras-gaming/pc-gamer-blanca-ryzen-7-5700-enf-liquido-rtx-406/pc-gamer-blanca-ryzen-7-5700-enf-liquido-rtx-406-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,0,0,'2026-11-10','[\"gamer\",\"blanca\",\"ryzen\",\"5700\",\"enf\",\"líquido\",\"rtx\",\"4060\",\"5050\",\"32gb\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-38-rendimiento\", \"grupoEtiqueta\": \"Perfil de creación\", \"opciones\": [{\"valor\": \"base-38-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-38-rendimiento\", \"etiqueta\": \"Aceleración de IA\", \"extra\": 11586}]}, {\"grupo\": \"equipo-38-memoria\", \"grupoEtiqueta\": \"Capacidad de biblioteca\", \"opciones\": [{\"valor\": \"base-38-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-38-memoria\", \"etiqueta\": \"Archivo local de 16 TB\", \"extra\": 4594}]}, {\"grupo\": \"equipo-38-experiencia\", \"grupoEtiqueta\": \"Pantalla de referencia\", \"opciones\": [{\"valor\": \"base-38-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-38-experiencia\", \"etiqueta\": \"Panel calibrado de color\", \"extra\": 1878}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (39,'Pc Gaming Amd Ryzen 7 Rx 9060 Xt 16gb 1tb Ssd 80+','Pc Gaming Amd Ryzen 7 Rx 9060 Xt 16gb 1tb Ssd 80+ es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 7 5700, Gráfica Radeon Rx 9060 Xt, 16 GB de memoria RAM, Almacenamiento 1 TB, Windows 11 Pro. Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 7 5700, Gráfica Radeon Rx 9060 Xt, 16 GB de memoria RAM, Almacenamiento 1 TB',1,15347.30,20718.86,NULL,'imagenes/computadoras-gaming/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,0,0,'2026-11-10','[\"gaming\",\"amd\",\"ryzen\",\"9060\",\"16gb\",\"1tb\",\"ssd\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-39-rendimiento\", \"grupoEtiqueta\": \"Modo de juego\", \"opciones\": [{\"valor\": \"base-39-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-39-rendimiento\", \"etiqueta\": \"Modo competitivo\", \"extra\": 12533}]}, {\"grupo\": \"equipo-39-memoria\", \"grupoEtiqueta\": \"Memoria de alto ancho de banda\", \"opciones\": [{\"valor\": \"base-39-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-39-memoria\", \"etiqueta\": \"Memoria de latencia ultrabaja\", \"extra\": 5207}]}, {\"grupo\": \"equipo-39-experiencia\", \"grupoEtiqueta\": \"Conectividad avanzada\", \"opciones\": [{\"valor\": \"base-39-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-39-experiencia\", \"etiqueta\": \"Dock Thunderbolt de expansión\", \"extra\": 2309}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (40,'Pc Amd Gaming Ryzen 5 Ddr5 Rx 9060 Xt 16gb 1tb 650w Gold','Pc Amd Gaming Ryzen 5 Ddr5 Rx 9060 Xt 16gb 1tb 650w Gold es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 5 8400F, Gráfica AMD RX 9060 XT 16GB, 16 GB de memoria RAM, Almacenamiento 1 TB, Windows 11 Pro. Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 5 8400F, Gráfica AMD RX 9060 XT 16GB, 16 GB de memoria RAM, Almacenamiento 1 TB',1,23826.67,32166.00,NULL,'imagenes/computadoras-gaming/pc-amd-gaming-ryzen-5-ddr5-rx-9060-xt-16gb-1tb-6/pc-amd-gaming-ryzen-5-ddr5-rx-9060-xt-16gb-1tb-6-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,0,0,'2026-11-10','[\"amd\",\"gaming\",\"ryzen\",\"ddr5\",\"9060\",\"16gb\",\"1tb\",\"650w\",\"gold\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-40-rendimiento\", \"grupoEtiqueta\": \"Cómputo avanzado\", \"opciones\": [{\"valor\": \"base-40-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-40-rendimiento\", \"etiqueta\": \"Render sin límites\", \"extra\": 13480}]}, {\"grupo\": \"equipo-40-memoria\", \"grupoEtiqueta\": \"Memoria de trabajo\", \"opciones\": [{\"valor\": \"base-40-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-40-memoria\", \"etiqueta\": \"Kit RAM de gran capacidad\", \"extra\": 5820}]}, {\"grupo\": \"equipo-40-experiencia\", \"grupoEtiqueta\": \"Estación de trabajo\", \"opciones\": [{\"valor\": \"base-40-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-40-experiencia\", \"etiqueta\": \"Kit de captura y streaming\", \"extra\": 2740}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (41,'Pc Gamer Ryzen 7 5700x Rtx 5060 Ram 32gb Rtx 5060 1tb Ssd','Pc Gamer Ryzen 7 5700x Rtx 5060 Ram 32gb Rtx 5060 1tb Ssd es un equipo de la categoría Juegos. Incluye Procesador AMD Ryzen 7 5700X, Gráfica RTX 5060, 32 GB de memoria RAM, Almacenamiento 1 TB. Ideal para gaming, estudio y multitarea.','Procesador AMD Ryzen 7 5700X, Gráfica RTX 5060, 32 GB de memoria RAM, Almacenamiento 1 TB',1,18369.63,24799.00,NULL,'imagenes/computadoras-gaming/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506-01.png',NULL,8,'activo','COMPUTLALTE','computadora','',0,0,0,0,0,'2026-11-10','[\"gamer\",\"ryzen\",\"5700x\",\"rtx\",\"5060\",\"ram\",\"32gb\",\"1tb\",\"ssd\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-41-rendimiento\", \"grupoEtiqueta\": \"Perfil profesional\", \"opciones\": [{\"valor\": \"base-41-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-41-rendimiento\", \"etiqueta\": \"Perfil de máxima potencia\", \"extra\": 1627}]}, {\"grupo\": \"equipo-41-memoria\", \"grupoEtiqueta\": \"Almacenamiento ultrarrápido\", \"opciones\": [{\"valor\": \"base-41-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-41-memoria\", \"etiqueta\": \"SSD NVMe de expansión\", \"extra\": 6433}]}, {\"grupo\": \"equipo-41-experiencia\", \"grupoEtiqueta\": \"Cobertura y soporte\", \"opciones\": [{\"valor\": \"base-41-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-41-experiencia\", \"etiqueta\": \"Soporte premium de cinco años\", \"extra\": 3171}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (42,'PC Gamer AI Xtreme PC Gaming MSI NVIDIA GeForce RTX 5080 Intel Core i9 32GB DDR5 SSD 1TB Sistema Liquido WIFI Black Productividad Profesional impulsada por IA Avanzada','PC Gamer AI Xtreme PC Gaming MSI NVIDIA GeForce RTX 5080 Intel Core i9 32GB DDR5 SSD 1TB Sistema Liquido WIFI Black Productividad Profesional impulsada por IA Avanzada es un equipo de la categoría Juegos. Incluye Procesador Intel Core i9 14900KF, Gráfica RTX 5080, 32 GB de memoria RAM, Almacenamiento 1 TB SSD. Ideal para gaming, estudio y multitarea.','Procesador Intel Core i9 14900KF, Gráfica RTX 5080, 32 GB de memoria RAM, Almacenamiento 1 TB SSD',1,54740.00,73899.00,NULL,'imagenes/computadoras-gaming/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce-01.png',NULL,2,'activo','MSI','computadora','',0,0,0,1,0,'2026-11-10','[\"gamer\",\"xtreme\",\"gaming\",\"msi\",\"nvidia\",\"geforce\",\"rtx\",\"5080\",\"intel\",\"core\",\"32gb\",\"ddr5\",\"ssd\",\"1tb\",\"sistema\",\"liquido\",\"wifi\",\"black\",\"productividad\",\"profesional\",\"impulsada\",\"por\",\"avanzada\",\"juegos\"]','[{\"grupo\": \"equipo-42-rendimiento\", \"grupoEtiqueta\": \"Aceleración gráfica\", \"opciones\": [{\"valor\": \"base-42-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-42-rendimiento\", \"etiqueta\": \"Overclock de estudio\", \"extra\": 2574}]}, {\"grupo\": \"equipo-42-memoria\", \"grupoEtiqueta\": \"Memoria para proyectos\", \"opciones\": [{\"valor\": \"base-42-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-42-memoria\", \"etiqueta\": \"Memoria para multitarea extrema\", \"extra\": 7046}]}, {\"grupo\": \"equipo-42-experiencia\", \"grupoEtiqueta\": \"Refrigeración y silencio\", \"opciones\": [{\"valor\": \"base-42-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-42-experiencia\", \"etiqueta\": \"Lazo líquido silencioso\", \"extra\": 3602}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (43,'Pc Gamer 2024 Rtx 4060 Ti Core I9 14900k Ram 128gb Ddr5 1tb','Pc Gamer 2024 Rtx 4060 Ti Core I9 14900k Ram 128gb Ddr5 1tb es un equipo de la categoría Juegos. Incluye Procesador Intel Core i9 14900KF, Gráfica RTX 4060 TI 8 GB, 128 GB de memoria RAM, Almacenamiento 1 TB SSD. Ideal para gaming, estudio y multitarea.','Procesador Intel Core i9 14900KF, Gráfica RTX 4060 TI 8 GB, 128 GB de memoria RAM, Almacenamiento 1 TB SSD',1,87654.82,118334.01,NULL,'imagenes/computadoras-gaming/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128-01.png',NULL,1,'activo','COMPUTLALTE','computadora','',0,0,0,1,0,'2026-11-10','[\"gamer\",\"2024\",\"rtx\",\"4060\",\"core\",\"14900k\",\"ram\",\"128gb\",\"ddr5\",\"1tb\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-43-rendimiento\", \"grupoEtiqueta\": \"Potencia de procesamiento\", \"opciones\": [{\"valor\": \"base-43-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-43-rendimiento\", \"etiqueta\": \"Turbo multinúcleo\", \"extra\": 3521}]}, {\"grupo\": \"equipo-43-memoria\", \"grupoEtiqueta\": \"Capacidad de biblioteca\", \"opciones\": [{\"valor\": \"base-43-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-43-memoria\", \"etiqueta\": \"Archivo local de 16 TB\", \"extra\": 7659}]}, {\"grupo\": \"equipo-43-experiencia\", \"grupoEtiqueta\": \"Movilidad extendida\", \"opciones\": [{\"valor\": \"base-43-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-43-experiencia\", \"etiqueta\": \"Batería de autonomía extendida\", \"extra\": 4033}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `productos` VALUES (44,'Pc Gamer Moderna Rtx 4060intel Core I9 Ram 32 Gb 1 Tb Nzxt','Pc Gamer Moderna Rtx 4060intel Core I9 Ram 32 Gb 1 Tb Nzxt es un equipo de la categoría Juegos. Incluye Procesador Intel Core i7 12900KF, Gráfica RTX 5060 8GB, 32 GB de memoria RAM, Almacenamiento 1 TB SSD. Ideal para gaming, estudio y multitarea.','Procesador Intel Core i7 12900KF, Gráfica RTX 5060 8GB, 32 GB de memoria RAM, Almacenamiento 1 TB SSD',1,33777.04,45599.00,NULL,'imagenes/computadoras-gaming/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb-01.png',NULL,3,'activo','COMPUTLALTE','computadora','',0,0,0,5,0,'2026-11-10','[\"gamer\",\"moderna\",\"rtx\",\"4060intel\",\"core\",\"ram\",\"nzxt\",\"computlalte\",\"juegos\"]','[{\"grupo\": \"equipo-44-rendimiento\", \"grupoEtiqueta\": \"Perfil de creación\", \"opciones\": [{\"valor\": \"base-44-rendimiento\", \"etiqueta\": \"Rendimiento de fábrica\", \"extra\": 0}, {\"valor\": \"plus-44-rendimiento\", \"etiqueta\": \"Aceleración de IA\", \"extra\": 4468}]}, {\"grupo\": \"equipo-44-memoria\", \"grupoEtiqueta\": \"Memoria de alto ancho de banda\", \"opciones\": [{\"valor\": \"base-44-memoria\", \"etiqueta\": \"Configuración incluida\", \"extra\": 0}, {\"valor\": \"plus-44-memoria\", \"etiqueta\": \"Memoria de latencia ultrabaja\", \"extra\": 8272}]}, {\"grupo\": \"equipo-44-experiencia\", \"grupoEtiqueta\": \"Pantalla de referencia\", \"opciones\": [{\"valor\": \"base-44-experiencia\", \"etiqueta\": \"Configuración estándar\", \"extra\": 0}, {\"valor\": \"plus-44-experiencia\", \"etiqueta\": \"Panel calibrado de color\", \"extra\": 4464}]}]','2026-11-09 17:54:21','2026-11-09 19:39:32');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'clave','Procesador AMD Ryzen 5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'clave','Gráfica AMD Radeon Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'clave','Pantalla 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Color: Plateado');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Modelo de la tarjeta gráfica integrada: AMD Radeon Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Linea de la tarjeta gráfica integrada: Radeon');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Modelo del procesador: 40');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Línea del procesador: Ryzen 5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (5,'tecnica','Resolución de pantalla: 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'clave','Procesador AMD Ryzen 5 7430U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'clave','Gráfica AMD Radeon RX Vega 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'clave','Almacenamiento 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'clave','Pantalla 15.6 pulgadas');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'clave','Color Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'tecnica','Color: Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'tecnica','Modelo de la tarjeta gráfica integrada: AMD Radeon RX Vega 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'tecnica','Modelo del procesador: AMD Ryzen™ 5 7430U Processor');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'tecnica','Línea del procesador: Ryzen');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'tecnica','Capacidad del disco duro: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (6,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'clave','Procesador AMD Ryzen 5 4500U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'clave','8 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'clave','Almacenamiento 256 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'clave','Pantalla 1920x1080 Full HD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'clave','Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'clave','Color Plateado');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Color: Plateado');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Estado del reacondicionado: Excelente');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Edición del sistema operativo: Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Modelo del procesador: 4500U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Línea del procesador: Ryzen 5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Capacidad de disco SSD: 256 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Memoria RAM: 8 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Resolución de pantalla: 1920x1080 Full HD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (7,'tecnica','Estado: Reacondicionado excelente');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'clave','Procesador AMD Ryzen 5 7520U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'clave','8 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'clave','Almacenamiento 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'clave','Color Plateado');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Color: Plateado');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Modelo del procesador: 7520U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Línea del procesador: Ryzen 5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Capacidad del disco duro: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Memoria RAM: 8 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (8,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'clave','Procesador AMD Ryzen 5 4650');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'clave','Almacenamiento 256 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'clave','Pantalla 1920px x1080px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'clave','Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'clave','Color Negro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Color: Negro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Estado del reacondicionado: Excelente');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Linea de la tarjeta gráfica integrada: AMD Radeon RX Vega 6');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Edición del sistema operativo: Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Modelo del procesador: 4650');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Línea del procesador: Ryzen 5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Capacidad de disco SSD: 256 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Resolución de pantalla: 1920px x1080px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (9,'tecnica','Estado: Reacondicionado excelente');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'clave','Procesador AMD Ryzen 7 7735HS');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'clave','Gráfica RTX 4050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'clave','Pantalla 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Color: Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Modelo de la tarjeta gráfica dedicada: RTX 4050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Línea de la tarjeta gráfica dedicada: GeForce');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Marca de la tarjeta gráfica dedicada: NVIDIA');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Modelo de la tarjeta gráfica integrada: Radeon');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Linea de la tarjeta gráfica integrada: Graficos integrados');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Marca de la tarjeta gráfica integrada: AMD Integrados');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Modelo del procesador: 7735HS');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Línea del procesador: Ryzen 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Frecuencia de actualización de la pantalla: 144 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (10,'tecnica','Resolución de pantalla: 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'clave','Procesador AMD Ryzen 5 7430u');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'clave','Gráfica AMD Radeon Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'clave','Pantalla 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'clave','Windows 11 Pro Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Color: Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Modelo de la tarjeta gráfica integrada: AMD Radeon Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Edición del sistema operativo: Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Versión del sistema operativo: 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Modelo del procesador: Ryzen 5 7430u');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Línea del procesador: Ryzen 5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (11,'tecnica','Resolución de pantalla: 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'clave','Procesador AMD Ryzen 7 7730u');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'clave','Pantalla 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'clave','Color Plateado');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Color: Plateado');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Resolución de pantalla: 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Modelo del procesador: 7730u');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Línea del procesador: Ryzen 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (12,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'clave','Procesador AMD Ryzen 7 7730U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'clave','Gráfica AMD Radeon Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'clave','Pantalla 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'tecnica','Modelo de la tarjeta gráfica integrada: AMD Radeon Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'tecnica','Modelo del procesador: Ryzen 7 7730U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'tecnica','Línea del procesador: Ryzen 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (13,'tecnica','Resolución de pantalla: 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'clave','Procesador AMD Ryzen 5 7430U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'clave','Gráfica AMD Radeon RX Vega 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'clave','Almacenamiento 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'clave','Pantalla 15.6 pulgadas');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'clave','Color Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'tecnica','Color: Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'tecnica','Modelo de la tarjeta gráfica integrada: AMD Radeon RX Vega 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'tecnica','Modelo del procesador: AMD Ryzen™ 5 7430U Processor');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'tecnica','Línea del procesador: Ryzen');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'tecnica','Capacidad del disco duro: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (14,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'clave','Procesador AMD Ryzen 5 7430U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'clave','Gráfica AMD Radeon Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'clave','8 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'clave','Pantalla 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Color: Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Modelo de la tarjeta gráfica integrada: AMD Radeon Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Modelo del procesador: 7430U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Línea del procesador: Ryzen 5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Memoria RAM: 8 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (15,'tecnica','Resolución de pantalla: 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'clave','Procesador Intel Core i5 13450Hx');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'clave','Gráfica RTX 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'clave','Pantalla 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Color: Gris Luna');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Modelo de la tarjeta gráfica dedicada: RTX 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Línea de la tarjeta gráfica dedicada: GeForce');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Marca de la tarjeta gráfica dedicada: NVIDIA');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Modelo de la tarjeta gráfica integrada: Inegrados Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Linea de la tarjeta gráfica integrada: Gráficos Intel®');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Marca de la tarjeta gráfica integrada: Integrados INTEL');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Modelo del procesador: 13450Hx');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Línea del procesador: Core i5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Frecuencia de actualización de la pantalla: 144 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (16,'tecnica','Resolución de pantalla: 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'clave','Procesador Intel Core Ultra 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'clave','Gráfica Integrados Intel UHD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'clave','24 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'clave','Almacenamiento 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'clave','Pantalla 1920 px x 1200 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Color: Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Modelo de la tarjeta gráfica dedicada: Integrados Intel UHD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Línea de la tarjeta gráfica dedicada: UHD GRAPHICS');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Marca de la tarjeta gráfica dedicada: UHD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Modelo de la tarjeta gráfica integrada: Graficos integrados');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Linea de la tarjeta gráfica integrada: Integrados');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Marca de la tarjeta gráfica integrada: Graphic Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Modelo del procesador: 355');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Línea del procesador: Core Ultra 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Capacidad de disco SSD: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Memoria RAM: 24 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (17,'tecnica','Resolución de pantalla: 1920 px x 1200 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'clave','Procesador Intel Core 3 Series 304');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'clave','8 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'clave','Pantalla 1920x1200');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'clave','Color Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Color: Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Modelo del procesador: Series 304');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Línea del procesador: CORE 3');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Memoria RAM: 8 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (18,'tecnica','Resolución de pantalla: 1920x1200');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (19,'clave','Procesador Intel Core i5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (19,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (19,'clave','Almacenamiento 256 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (19,'tecnica','Procesador: Intel Core i5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (19,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (19,'tecnica','Almacenamiento: 256 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'clave','Procesador Intel Core i5 1245U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'clave','Gráfica Intel Iris Xe Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'clave','Almacenamiento 256 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'clave','Pantalla 1920 px x 1200 px táctil');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'clave','Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Color: Negro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Modelo de la tarjeta gráfica integrada: Intel Iris Xe Graphics');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Edición del sistema operativo: Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Modelo del procesador: 1245U');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Línea del procesador: Core i5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Capacidad de disco SSD: 256 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Con pantalla táctil: Sí');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (20,'tecnica','Resolución de pantalla: 1920 px x 1200 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (21,'clave','Procesador Intel Core i5 12600h');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (21,'clave','24 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (21,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (21,'clave','Pantalla 15.6 pulgadas');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (21,'tecnica','Procesador: Intel Core i5 12600h');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (21,'tecnica','Memoria RAM: 24 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (21,'tecnica','Almacenamiento: 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (21,'tecnica','Pantalla: 15.6 pulgadas');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'clave','Procesador Qualcomm Snapdragon X X1-26-100');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'clave','Gráfica Qualcomm Adreno');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'clave','24 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'clave','Pantalla 1920 px x 1200 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Color: Gris Luna');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Modelo de la tarjeta gráfica dedicada: Adreno Qualcomm Adreno Int');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Línea de la tarjeta gráfica dedicada: Qualcomm integrada');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Marca de la tarjeta gráfica dedicada: Integrados GPU');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Modelo de la tarjeta gráfica integrada: Qualcomm Adreno');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Linea de la tarjeta gráfica integrada: Graficos integrados');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Marca de la tarjeta gráfica integrada: GPU');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Modelo del procesador: X1-26-100');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Línea del procesador: Snapdragon X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Marca del procesador: Qualcomm');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Memoria RAM: 24 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (22,'tecnica','Resolución de pantalla: 1920 px x 1200 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'clave','Procesador AMD Ryzen 7 8840HS');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'clave','Gráfica Radeon 780M');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'clave','Pantalla 1920x1200');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Color: Gris');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Modelo de la tarjeta gráfica integrada: Radeon 780M');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Linea de la tarjeta gráfica integrada: Radeon');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Modelo del procesador: 8840HS');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Línea del procesador: Ryzen 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Frecuencia de actualización de la pantalla: 60 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (23,'tecnica','Resolución de pantalla: 1920x1200');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'clave','Procesador Intel Core i5 13450Hx');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'clave','Gráfica RTX 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'clave','Almacenamiento 512 GB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'clave','Pantalla 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'clave','Windows 11 Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Color: Gris Luna');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Modelo de la tarjeta gráfica dedicada: RTX 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Línea de la tarjeta gráfica dedicada: GeForce');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Marca de la tarjeta gráfica dedicada: NVIDIA');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Modelo de la tarjeta gráfica integrada: Inegrados Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Linea de la tarjeta gráfica integrada: Gráficos Intel®');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Marca de la tarjeta gráfica integrada: Integrados INTEL');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Edición del sistema operativo: Home');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Versión del sistema operativo: 11');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Nombre del sistema operativo: Windows');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Modelo del procesador: 13450Hx');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Línea del procesador: Core i5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Frecuencia de actualización de la pantalla: 144 Hz');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Capacidad de disco SSD: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Con pantalla táctil: No');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (24,'tecnica','Resolución de pantalla: 1920 px x 1080 px');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'clave','Procesador AMD Ryzen 9 5900X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'clave','Gráfica RTX 5070 12GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'clave','Almacenamiento 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'tecnica','Tarjeta gráfica: RTX 5070 12GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'tecnica','Modelo del procesador: 5900X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'tecnica','Línea del procesador: Ryzen 9');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (25,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'clave','Procesador AMD Ryzen 7 9700X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'clave','Gráfica GeForce RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'tecnica','Tarjeta gráfica: GeForce RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'tecnica','Modelo del procesador: Ryzen 7 9700X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (26,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'clave','Procesador Ryzen 9 5900x');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'clave','Gráfica RTX 5060 8GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'tecnica','Tarjeta gráfica: RTX 5060 8GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'tecnica','Modelo del procesador: 5900X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (27,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'clave','Procesador AMD Ryzen 7 5700X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'clave','Gráfica AMD Radeon RX 7600');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'clave','Almacenamiento 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'clave','Windows 11 Home (Versión de Prueba)');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'tecnica','Pc Powerbit Vortex: R7, 16gb, M.2 512gb, Rx7600, Wi-fi');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'tecnica','Tarjeta gráfica: AMD Radeon RX 7600');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'tecnica','Capacidad del disco: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'tecnica','Modelo del procesador: Ryzen 7 5700X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (28,'tecnica','Sistema operativo: Windows 11 Home (Versión de Prueba)');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'clave','Procesador AMD Ryzen 7 5700X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'clave','Gráfica NVIDIA GeForce RTX 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'clave','Almacenamiento 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'clave','Windows 11 Home (Versión de Prueba)');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'tecnica','Pc Gamer Powerbit Phantom: R7, 16gb, M.2 512gb, Rtx 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'tecnica','Tarjeta gráfica: NVIDIA® GeForce RTX™ 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'tecnica','Capacidad del disco: 512 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'tecnica','Modelo del procesador: Ryzen 7 5700X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (29,'tecnica','Sistema operativo: Windows 11 Home (Versión de Prueba)');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'clave','Procesador AMD Ryzen 5 5500');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'clave','Gráfica RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'clave','Almacenamiento 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'tecnica','Modelo del procesador: 5500');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'tecnica','Línea del procesador: Ryzen 5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (30,'tecnica','Incluye: sistema operativo instalado, no activado Windows 11 Home Trial');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'clave','Procesador Intel Core i5 12400F');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'clave','Gráfica NVIDIA GeForce RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'tecnica','Tarjeta gráfica: NVIDIA GeForce RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'tecnica','Modelo del procesador: 12400F');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'tecnica','Línea del procesador: Core i5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (31,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'clave','Procesador Intel Core i5 12400F');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'clave','Gráfica NVIDIA GeForce RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'clave','Almacenamiento 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'tecnica','Tarjeta gráfica: NVIDIA GeForce RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'tecnica','Modelo del procesador: 12400F');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'tecnica','Línea del procesador: Core i5');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (32,'tecnica','Incluye: sistema operativo instalado, no activado Windows 11 Home Trial');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'clave','Procesador Intel Core Ultra 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'clave','Gráfica RTX 5060 Ti');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'clave','Almacenamiento 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'tecnica','Incluye: sistema operativo instalado, no activado Windows 11 Home Trial');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'tecnica','Procesador: Intel Core Ultra 7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'tecnica','Gráfica: RTX 5060 Ti');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (33,'tecnica','Almacenamiento: 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'clave','Procesador Intel Core i7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'clave','Gráfica NVIDIA GeForce RTX 4060 Ti ó RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'clave','64 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'tecnica','Memoria RAM: 64 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'tecnica','Tarjeta gráfica: NVIDIA GeForce RTX 4060 Ti ó RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'tecnica','Modelo del procesador: Intel Core i7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'tecnica','Línea del procesador: i7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (34,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'clave','Procesador Intel Core i9 14900KF');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'clave','Gráfica NVIDIA GeForce RTX 5070');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'clave','Windows 10 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'tecnica','Tarjeta gráfica: NVIDIA GeForce RTX 5070');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'tecnica','Modelo del procesador: 14900KF');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (35,'tecnica','Sistema operativo: Windows 10 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'clave','Procesador Intel Core i9 12900F');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'clave','Gráfica Nvidia RTX 5070');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'clave','Almacenamiento 2 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'clave','Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'tecnica','Tarjeta gráfica: Nvidia RTX 5070');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'tecnica','Capacidad del disco: 2 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'tecnica','Modelo del procesador: Core i9 12900F');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (36,'tecnica','Sistema operativo: Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'clave','Procesador AMD Ryzen 9 5900XT');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'clave','Gráfica RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'clave','Almacenamiento 2 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'tecnica','Tarjeta gráfica: RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'tecnica','Capacidad del disco: 2 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'tecnica','Modelo del procesador: Ryzen 9 5900XT');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (37,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'clave','Procesador Ryzen 7 5700');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'clave','Gráfica RTX 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'tecnica','Tarjeta gráfica: RTX 5050');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'tecnica','Modelo del procesador: 5700');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (38,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'clave','Procesador AMD Ryzen 7 5700');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'clave','Gráfica Radeon Rx 9060 Xt');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'clave','Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'tecnica','Tarjeta gráfica: Radeon Rx 9060 Xt');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'tecnica','Modelo del procesador: Ryzen 7 5700');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (39,'tecnica','Sistema operativo: Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'clave','Procesador AMD Ryzen 5 8400F');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'clave','Gráfica AMD RX 9060 XT 16GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'clave','16 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'clave','Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'tecnica','Tarjeta gráfica: AMD RX 9060 XT 16GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'tecnica','Memoria RAM: 16 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'tecnica','Modelo del procesador: Ryzen 5 8400F');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (40,'tecnica','Sistema operativo: Windows 11 Pro');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'clave','Procesador AMD Ryzen 7 5700X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'clave','Gráfica RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'clave','Almacenamiento 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'tecnica','Tarjeta gráfica: RTX 5060');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'tecnica','Capacidad del disco: 1 TB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'tecnica','Modelo del procesador: Ryzen 7 5700X');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (41,'tecnica','Marca del procesador: AMD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (42,'clave','Procesador Intel Core i9 14900KF');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (42,'clave','Gráfica RTX 5080');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (42,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (42,'clave','Almacenamiento 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (42,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (42,'tecnica','Modelo del procesador: 14900KF');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (42,'tecnica','Línea del procesador: Core i9');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (42,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'clave','Procesador Intel Core i9 14900KF');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'clave','Gráfica RTX 4060 TI 8 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'clave','128 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'clave','Almacenamiento 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'tecnica','Tarjeta gráfica: RTX 4060 TI 8 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'tecnica','Memoria RAM: 128 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'tecnica','Modelo del procesador: 14900KF');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'tecnica','Línea del procesador: Core i9');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (43,'tecnica','Marca del procesador: Intel');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'clave','Procesador Intel Core i7 12900KF');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'clave','Gráfica RTX 5060 8GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'clave','32 GB de memoria RAM');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'clave','Almacenamiento 1 TB SSD');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'tecnica','Tarjeta gráfica: RTX 5060 8GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'tecnica','Memoria RAM: 32 GB');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'tecnica','Modelo del procesador: 12900KF');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'tecnica','Línea del procesador: Core i7');
INSERT INTO `especificaciones` (`producto_id`,`tipo`,`descripcion`) VALUES (44,'tecnica','Marca del procesador: Intel');
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (5,'imagenes/computadoras-desarrollo/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (5,'imagenes/computadoras-desarrollo/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (5,'imagenes/computadoras-desarrollo/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (5,'imagenes/computadoras-desarrollo/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (5,'imagenes/computadoras-desarrollo/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (5,'imagenes/computadoras-desarrollo/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16/laptop-aspire-lite-16-15-6-fhd-amd-ryzen-5-40-16-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (6,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (6,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (6,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (6,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (6,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (6,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (6,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-07.png',7);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (7,'imagenes/computadoras-desarrollo/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (7,'imagenes/computadoras-desarrollo/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (7,'imagenes/computadoras-desarrollo/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (7,'imagenes/computadoras-desarrollo/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (7,'imagenes/computadoras-desarrollo/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (7,'imagenes/computadoras-desarrollo/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r/laptop-hp-probook-445-g7-ryzen-5-economica-8gb-r-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (8,'imagenes/computadoras-desarrollo/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (8,'imagenes/computadoras-desarrollo/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (8,'imagenes/computadoras-desarrollo/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (8,'imagenes/computadoras-desarrollo/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (8,'imagenes/computadoras-desarrollo/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (8,'imagenes/computadoras-desarrollo/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu/laptop-dell-15-dc15255-15-6-ryzen-5-8gb-512gb-fu-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (9,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (9,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (9,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (9,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32/laptop-lenovo-thinkpad-x13g1-amd-ryzen-5-4650-32-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (10,'imagenes/computadoras-desarrollo/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (10,'imagenes/computadoras-desarrollo/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (10,'imagenes/computadoras-desarrollo/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (10,'imagenes/computadoras-desarrollo/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (10,'imagenes/computadoras-desarrollo/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5/laptop-gaming-15-6-loq15arp10-amd-ryzen-7-16gb-5-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (11,'imagenes/computadoras-desarrollo/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (11,'imagenes/computadoras-desarrollo/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (11,'imagenes/computadoras-desarrollo/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (11,'imagenes/computadoras-desarrollo/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (11,'imagenes/computadoras-desarrollo/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (11,'imagenes/computadoras-desarrollo/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51/laptop-15-6-games-amd-ryzen-5-7430u-16-8-8-gb-51-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (12,'imagenes/computadoras-desarrollo/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (12,'imagenes/computadoras-desarrollo/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (12,'imagenes/computadoras-desarrollo/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (12,'imagenes/computadoras-desarrollo/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (12,'imagenes/computadoras-desarrollo/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (12,'imagenes/computadoras-desarrollo/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (12,'imagenes/computadoras-desarrollo/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb/notebook-acer-aspire-a325-42-ryzen-7-7730u-16gb-07.png',7);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (13,'imagenes/computadoras-desarrollo/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (13,'imagenes/computadoras-desarrollo/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (13,'imagenes/computadoras-desarrollo/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (13,'imagenes/computadoras-desarrollo/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (13,'imagenes/computadoras-desarrollo/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (13,'imagenes/computadoras-desarrollo/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512/laptop-games-15-6-amd-ryzen-7-7730u-16gb-ram-512-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (14,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (14,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (14,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (14,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (14,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (14,'imagenes/computadoras-desarrollo/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2/laptop-gamer-15-6-acemagic-amd-ryzen-5-7430u-16g-2-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (15,'imagenes/computadoras-desarrollo/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (15,'imagenes/computadoras-desarrollo/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (15,'imagenes/computadoras-desarrollo/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (15,'imagenes/computadoras-desarrollo/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (15,'imagenes/computadoras-desarrollo/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (15,'imagenes/computadoras-desarrollo/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (15,'imagenes/computadoras-desarrollo/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr/notebook-acer-gadget-erbook-ryzen-5-8gb-512gb-gr-07.png',7);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (16,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (16,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (16,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (16,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (17,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (17,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (17,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (17,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (17,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3/laptop-lenovo-ideapad-slim3-core-ultra7-serie-3-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (18,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (18,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (18,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (18,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (18,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (18,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11/laptop-lenovo-ideapad-slim-3-intel-core-3-gen-11-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (19,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (19,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (19,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (19,'imagenes/computadoras-desarrollo/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p/laptop-lenovo-thinkpad-t14-i5-16gb-256gb-win11-p-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (20,'imagenes/computadoras-desarrollo/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (20,'imagenes/computadoras-desarrollo/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (20,'imagenes/computadoras-desarrollo/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (20,'imagenes/computadoras-desarrollo/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (20,'imagenes/computadoras-desarrollo/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat/lenovo-thinkpad-t14-gen-3-pantalla-tactil-portat-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (21,'imagenes/computadoras-desarrollo/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (21,'imagenes/computadoras-desarrollo/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (21,'imagenes/computadoras-desarrollo/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (21,'imagenes/computadoras-desarrollo/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51/laptop-acemagic-15-6-intel-i5-12600h-24gb-ram-51-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (22,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (22,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (22,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (22,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (22,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512/laptop-lenovo-ideapad-15-3-snapdragon-x-24gb-512-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (23,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (23,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (23,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (23,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (23,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (23,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (23,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-07.png',7);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (23,'imagenes/computadoras-desarrollo/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb/laptop-lenovo-ideapad-slim-3-touch-ryzen-7-16gb-08.png',8);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (24,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (24,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (24,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (24,'imagenes/computadoras-desarrollo/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2/laptop-gamer-loq-32gb-ram-512gb-ssd-rtx-5050-gri-2-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (25,'imagenes/computadoras-gaming/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (25,'imagenes/computadoras-gaming/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (25,'imagenes/computadoras-gaming/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (25,'imagenes/computadoras-gaming/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (25,'imagenes/computadoras-gaming/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g/pc-gamer-rtx-4070-super-ryzen-9-torre-cooler-32g-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (26,'imagenes/computadoras-gaming/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (26,'imagenes/computadoras-gaming/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (26,'imagenes/computadoras-gaming/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (26,'imagenes/computadoras-gaming/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (26,'imagenes/computadoras-gaming/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (26,'imagenes/computadoras-gaming/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (26,'imagenes/computadoras-gaming/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r/pc-gamer-rgb-amd-ryzen-9700x-32gb-ddr5-1tb-ssd-r-07.png',7);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (27,'imagenes/computadoras-gaming/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (27,'imagenes/computadoras-gaming/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (27,'imagenes/computadoras-gaming/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (27,'imagenes/computadoras-gaming/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (27,'imagenes/computadoras-gaming/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (27,'imagenes/computadoras-gaming/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (27,'imagenes/computadoras-gaming/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu/pc-gamer-rtx-5060-ryzen-9-5900x-ram-32gb-1tb-tcu-07.png',7);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (28,'imagenes/computadoras-gaming/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (28,'imagenes/computadoras-gaming/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (28,'imagenes/computadoras-gaming/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (28,'imagenes/computadoras-gaming/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f/pc-powerbit-vortex-r7-16gb-m-2-512gb-rx7600-wi-f-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (29,'imagenes/computadoras-gaming/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (29,'imagenes/computadoras-gaming/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (29,'imagenes/computadoras-gaming/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (29,'imagenes/computadoras-gaming/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx/pc-gamer-powerbit-phantom-r7-16gb-m-2-512gb-rtx-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (30,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (30,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (30,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (30,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (30,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (30,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (31,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (31,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (31,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (31,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (31,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (31,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506/pc-gamer-xtreme-pc-gaming-nvidia-geforce-rtx-506-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (32,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (32,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (32,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (32,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (32,'imagenes/computadoras-gaming/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2/pc-gamer-xtreme-pc-gaming-asus-tuf-nvidia-geforc-2-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (33,'imagenes/computadoras-gaming/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (33,'imagenes/computadoras-gaming/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (33,'imagenes/computadoras-gaming/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (33,'imagenes/computadoras-gaming/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (33,'imagenes/computadoras-gaming/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g/pc-gamer-ia-entry-xtreme-pc-gaming-asus-nvidia-g-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (34,'imagenes/computadoras-gaming/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (34,'imagenes/computadoras-gaming/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (34,'imagenes/computadoras-gaming/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (34,'imagenes/computadoras-gaming/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (34,'imagenes/computadoras-gaming/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (34,'imagenes/computadoras-gaming/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx/pc-gamer-blanca-enfriamiento-liquido-corei7-rtx-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (35,'imagenes/computadoras-gaming/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (35,'imagenes/computadoras-gaming/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (35,'imagenes/computadoras-gaming/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (35,'imagenes/computadoras-gaming/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g/pc-gamer-blanca-12-gb-vram-intel-i9-rtx-5070-32g-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (36,'imagenes/computadoras-gaming/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (36,'imagenes/computadoras-gaming/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (36,'imagenes/computadoras-gaming/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (36,'imagenes/computadoras-gaming/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32/pc-gamer-grizzly-intel-i9-12900f-rtx5070-ram-32-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (37,'imagenes/computadoras-gaming/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (37,'imagenes/computadoras-gaming/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (37,'imagenes/computadoras-gaming/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (37,'imagenes/computadoras-gaming/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (37,'imagenes/computadoras-gaming/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (37,'imagenes/computadoras-gaming/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s/pc-gamer-grizzly-amd-ryzen-9-rtx5060-ram-32-gb-s-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (38,'imagenes/computadoras-gaming/pc-gamer-blanca-ryzen-7-5700-enf-liquido-rtx-406/pc-gamer-blanca-ryzen-7-5700-enf-liquido-rtx-406-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (38,'imagenes/computadoras-gaming/pc-gamer-blanca-ryzen-7-5700-enf-liquido-rtx-406/pc-gamer-blanca-ryzen-7-5700-enf-liquido-rtx-406-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (38,'imagenes/computadoras-gaming/pc-gamer-blanca-ryzen-7-5700-enf-liquido-rtx-406/pc-gamer-blanca-ryzen-7-5700-enf-liquido-rtx-406-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (39,'imagenes/computadoras-gaming/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (39,'imagenes/computadoras-gaming/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (39,'imagenes/computadoras-gaming/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (39,'imagenes/computadoras-gaming/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80/pc-gaming-amd-ryzen-7-rx-9060-xt-16gb-1tb-ssd-80-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (40,'imagenes/computadoras-gaming/pc-amd-gaming-ryzen-5-ddr5-rx-9060-xt-16gb-1tb-6/pc-amd-gaming-ryzen-5-ddr5-rx-9060-xt-16gb-1tb-6-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (40,'imagenes/computadoras-gaming/pc-amd-gaming-ryzen-5-ddr5-rx-9060-xt-16gb-1tb-6/pc-amd-gaming-ryzen-5-ddr5-rx-9060-xt-16gb-1tb-6-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (40,'imagenes/computadoras-gaming/pc-amd-gaming-ryzen-5-ddr5-rx-9060-xt-16gb-1tb-6/pc-amd-gaming-ryzen-5-ddr5-rx-9060-xt-16gb-1tb-6-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (41,'imagenes/computadoras-gaming/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (41,'imagenes/computadoras-gaming/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (41,'imagenes/computadoras-gaming/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (41,'imagenes/computadoras-gaming/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (41,'imagenes/computadoras-gaming/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506/pc-gamer-ryzen-7-5700x-rtx-5060-ram-32gb-rtx-506-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (42,'imagenes/computadoras-gaming/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (42,'imagenes/computadoras-gaming/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (42,'imagenes/computadoras-gaming/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (42,'imagenes/computadoras-gaming/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (42,'imagenes/computadoras-gaming/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (42,'imagenes/computadoras-gaming/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce/pc-gamer-ai-xtreme-pc-gaming-msi-nvidia-geforce-06.png',6);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (43,'imagenes/computadoras-gaming/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (43,'imagenes/computadoras-gaming/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (43,'imagenes/computadoras-gaming/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (43,'imagenes/computadoras-gaming/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (43,'imagenes/computadoras-gaming/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128/pc-gamer-2024-rtx-4060-ti-core-i9-14900k-ram-128-05.png',5);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (44,'imagenes/computadoras-gaming/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb-01.png',1);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (44,'imagenes/computadoras-gaming/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb-02.png',2);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (44,'imagenes/computadoras-gaming/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb-03.png',3);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (44,'imagenes/computadoras-gaming/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb-04.png',4);
INSERT INTO `imagenes_producto` (`producto_id`,`url`,`posicion`) VALUES (44,'imagenes/computadoras-gaming/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb/pc-gamer-moderna-rtx-4060intel-core-i9-ram-32-gb-05.png',5);

-- Sincronización de subcategorías de accesorios y alta del Sennheiser HE1.
INSERT INTO categorias (nombre) VALUES
  ('Audio'),
  ('Mouse'),
  ('Energía y Cables'),
  ('Teclados'),
  ('Monitores')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

SET @audio_categoria_id = (SELECT id FROM categorias WHERE nombre = 'Audio' LIMIT 1);

UPDATE productos
SET imagen_url = REPLACE(
  imagen_url,
  'imagenes/imagenes-accesorios/raton-attack-shark/',
  'imagenes/imagenes-accesorios/mouse/raton-attack-shark/'
)
WHERE imagen_url LIKE 'imagenes/imagenes-accesorios/raton-attack-shark/%';

UPDATE imagenes_producto
SET url = REPLACE(
  url,
  'imagenes/imagenes-accesorios/raton-attack-shark/',
  'imagenes/imagenes-accesorios/mouse/raton-attack-shark/'
)
WHERE url LIKE 'imagenes/imagenes-accesorios/raton-attack-shark/%';

INSERT INTO productos (
  nombre, descripcion, descripcion_corta, categoria_id, costo_base, precio_final,
  margen_propio, imagen_url, stock, estado, marca, tipo, etiqueta, destacado,
  en_oferta, descuento, terminos_busqueda
)
SELECT
  'Sennheiser HE1 Orpheus',
  'El pináculo del audio. Sistema electrostático de referencia con amplificador de alta tensión integrado, carcasa de mármol de Carrara y DACs ESS SABRE.',
  'El pináculo del audio. Primer sistema electrostático con amplificador de alta tensión integrado, mármol de Carrara y DACs ESS SABRE.',
  @audio_categoria_id, 808518.52, 1091500.00, NULL,
  'imagenes/imagenes-accesorios/audio/sennheiser-he1.jpg',
  1, 'activo', 'Sennheiser', 'accesorio', 'Audio de referencia', 1, 0, 0,
  '["sennheiser","he1","orpheus","audifonos","auriculares","electrostatico","audio premium"]'
WHERE NOT EXISTS (
  SELECT 1 FROM productos WHERE nombre = 'Sennheiser HE1 Orpheus'
);

SET @he1_id = (
  SELECT id FROM productos WHERE nombre = 'Sennheiser HE1 Orpheus' ORDER BY id LIMIT 1
);

UPDATE productos
SET descripcion = 'El pináculo del audio. Sistema electrostático de referencia con amplificador de alta tensión integrado, carcasa de mármol de Carrara y DACs ESS SABRE.',
  descripcion_corta = 'El pináculo del audio. Primer sistema electrostático con amplificador de alta tensión integrado, mármol de Carrara y DACs ESS SABRE.',
  categoria_id = @audio_categoria_id,
  costo_base = 808518.52,
  precio_final = ROUND(costo_base * 1.35, 2),
  margen_propio = NULL,
  imagen_url = 'imagenes/imagenes-accesorios/audio/sennheiser-he1.jpg',
  stock = 1,
  estado = 'activo',
  marca = 'Sennheiser',
  tipo = 'accesorio',
  etiqueta = 'Audio de referencia',
  destacado = 1,
  en_oferta = 0,
  descuento = 0,
  terminos_busqueda = '["sennheiser","he1","orpheus","audifonos","auriculares","electrostatico","audio premium"]'
WHERE id = @he1_id;

DELETE FROM imagenes_producto WHERE producto_id = @he1_id;
INSERT INTO imagenes_producto (producto_id, url, posicion) VALUES
  (@he1_id, 'imagenes/imagenes-accesorios/audio/sennheiser-he1.jpg', 1),
  (@he1_id, 'imagenes/imagenes-accesorios/audio/sennheiser-he1/sennheiser-he1-orpheus-auriculares (1).jpg', 2),
  (@he1_id, 'imagenes/imagenes-accesorios/audio/sennheiser-he1/sennheiser-he1-orpheus-auriculares (2).jpg', 3),
  (@he1_id, 'imagenes/imagenes-accesorios/audio/sennheiser-he1/sennheiser-he1-orpheus-auriculares (3).jpg', 4),
  (@he1_id, 'imagenes/imagenes-accesorios/audio/sennheiser-he1/sennheiser-he1-orpheus-auriculares (4).jpg', 5),
  (@he1_id, 'imagenes/imagenes-accesorios/audio/sennheiser-he1/sennheiser-he1-orpheus-auriculares (5).jpg', 6);

DELETE FROM especificaciones WHERE producto_id = @he1_id;
INSERT INTO especificaciones (producto_id, tipo, descripcion) VALUES
  (@he1_id, 'tecnica', 'Primer auricular electrostático con amplificador integrado'),
  (@he1_id, 'tecnica', 'Carcasa de mármol de Carrara y vidrio hecho a mano'),
  (@he1_id, 'tecnica', 'Amplificador Cool Class A MOS-FET de alta tensión'),
  (@he1_id, 'tecnica', '8 DACs internos ESS SABRE ES9018'),
  (@he1_id, 'tecnica', 'Diafragmas vaporizados de platino de 2.4 micrómetros'),
  (@he1_id, 'tecnica', 'Transductores de cerámica vaporizados en oro'),
  (@he1_id, 'tecnica', 'Cables de cobre plateado OFC al 99.9%'),
  (@he1_id, 'tecnica', 'Respuesta de frecuencia: 8 Hz a >100 kHz'),
  (@he1_id, 'tecnica', 'Distorsión ultra baja: 0.01% a 1 kHz');

SET @teclados_categoria_id = (SELECT id FROM categorias WHERE nombre = 'Teclados' LIMIT 1);
SET @monitores_categoria_id = (SELECT id FROM categorias WHERE nombre = 'Monitores' LIMIT 1);
SET @energia_categoria_id = (SELECT id FROM categorias WHERE nombre = 'Energía y Cables' LIMIT 1);

INSERT INTO productos (
  nombre, descripcion, descripcion_corta, categoria_id, costo_base, precio_final,
  margen_propio, imagen_url, stock, estado, marca, tipo, etiqueta, destacado,
  terminos_busqueda
)
SELECT
  'Teclado Magnético Cool 68',
  'Teclado magnético compacto DAREU COOL68, diseñado para juegos competitivos con actuación precisa, Rapid Trigger y sondeo de alta velocidad.',
  'Teclado magnético 65% de 68 teclas, Rapid Trigger de 0.01 mm, polling rate de 8000 Hz e iluminación RGB.',
  @teclados_categoria_id, 5135.60, 6933.06, 35,
  'imagenes/imagenes-accesorios/teclados/teclado-cool-68-1.jpg',
  5, 'activo', 'DAREU', 'accesorio', 'Teclado magnético', 1,
  '["dareu","cool 68","cool68","teclado magnetico","teclado gaming","rapid trigger"]'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Teclado Magnético Cool 68');

SET @teclado_id = (SELECT id FROM productos WHERE nombre = 'Teclado Magnético Cool 68' ORDER BY id LIMIT 1);
UPDATE productos SET categoria_id = @teclados_categoria_id, costo_base = 5135.60,
  precio_final = 6933.06, margen_propio = 35,
  imagen_url = 'imagenes/imagenes-accesorios/teclados/teclado-cool-68-1.jpg'
WHERE id = @teclado_id;
DELETE FROM imagenes_producto WHERE producto_id = @teclado_id;
INSERT INTO imagenes_producto (producto_id, url, posicion) VALUES
  (@teclado_id, 'imagenes/imagenes-accesorios/teclados/teclado-cool-68-1.jpg', 1),
  (@teclado_id, 'imagenes/imagenes-accesorios/teclados/cool-68/3-11-7cf792b0356b65b19717754851489783-1024-1024.webp', 2),
  (@teclado_id, 'imagenes/imagenes-accesorios/teclados/cool-68/5-12-cfa01d8f450c6d5f1317754851502718-1024-1024.webp', 3),
  (@teclado_id, 'imagenes/imagenes-accesorios/teclados/cool-68/6-11-d79b2d5e3ee8e8a19717754851488859-1024-1024.webp', 4),
  (@teclado_id, 'imagenes/imagenes-accesorios/teclados/cool-68/actuacion-de-efecto-hall-65-switch-magnetico-2-638fb7c4e42676ea1017754851493474-1024-1024.webp', 5);
DELETE FROM especificaciones WHERE producto_id = @teclado_id;
INSERT INTO especificaciones (producto_id, tipo, descripcion) VALUES
  (@teclado_id, 'tecnica', 'Teclado magnético 65% (68 teclas)'),
  (@teclado_id, 'tecnica', 'Switch Ice Blade Magnetic'),
  (@teclado_id, 'tecnica', 'Rapid Trigger de 0.01 mm de precisión'),
  (@teclado_id, 'tecnica', 'Polling rate de 8000 Hz'),
  (@teclado_id, 'tecnica', 'Estructura Gasket Mount'),
  (@teclado_id, 'tecnica', 'Iluminación RGB'),
  (@teclado_id, 'tecnica', 'Teclas PBT de doble inyección'),
  (@teclado_id, 'tecnica', 'Conectividad USB Type-C'),
  (@teclado_id, 'tecnica', 'Dimensiones: 329 x 111 x 44 mm'),
  (@teclado_id, 'tecnica', 'Peso: 740 g ± 50 g'),
  (@teclado_id, 'tecnica', 'Vida útil del switch: 100 millones de clics');

INSERT INTO productos (
  nombre, descripcion, descripcion_corta, categoria_id, costo_base, precio_final,
  margen_propio, imagen_url, stock, estado, marca, tipo, etiqueta, destacado,
  terminos_busqueda
)
SELECT
  'Monitor ASUS ROG Swift PG32UCDM',
  'Monitor gaming ASUS ROG Swift de 32 pulgadas con panel QD-OLED 4K UHD, frecuencia de 240 Hz y conectividad HDMI 2.1 y USB-C.',
  'QD-OLED 4K UHD de 32 pulgadas, 240 Hz, 0.03 ms, DisplayHDR 400 True Black y USB-C con entrega de energía de 90 W.',
  @monitores_categoria_id, 16449.00, 22206.15, 35,
  'imagenes/imagenes-accesorios/monitores/monitor-asus-rog-1.jpg',
  3, 'activo', 'ASUS ROG', 'accesorio', 'QD-OLED 4K 240 Hz', 1,
  '["asus","rog swift","pg32ucdm","monitor gaming","qd-oled","4k","240hz"]'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Monitor ASUS ROG Swift PG32UCDM');

SET @monitor_id = (SELECT id FROM productos WHERE nombre = 'Monitor ASUS ROG Swift PG32UCDM' ORDER BY id LIMIT 1);
UPDATE productos SET categoria_id = @monitores_categoria_id, costo_base = 16449.00,
  precio_final = 22206.15, margen_propio = 35,
  imagen_url = 'imagenes/imagenes-accesorios/monitores/monitor-asus-rog-1.jpg'
WHERE id = @monitor_id;
DELETE FROM imagenes_producto WHERE producto_id = @monitor_id;
INSERT INTO imagenes_producto (producto_id, url, posicion) VALUES
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/monitor-asus-rog-1.jpg', 1),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-02-orig.jpg', 2),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-03-orig.jpg', 3),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-04-orig.jpg', 4),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-05-orig.jpg', 5),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-06-orig.jpg', 6),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-07-orig.jpg', 7),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-08-orig.jpg', 8),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-09-orig.jpg', 9),
  (@monitor_id, 'imagenes/imagenes-accesorios/monitores/asus-rog-swift/pg32ucdm-10-orig.jpg', 10);
DELETE FROM especificaciones WHERE producto_id = @monitor_id;
INSERT INTO especificaciones (producto_id, tipo, descripcion) VALUES
  (@monitor_id, 'tecnica', 'Panel QD-OLED de 32 pulgadas'),
  (@monitor_id, 'tecnica', 'Resolución 4K UHD (3840 x 2160)'),
  (@monitor_id, 'tecnica', 'Tasa de refresco de 240 Hz'),
  (@monitor_id, 'tecnica', 'Tiempo de respuesta de 0.03 ms'),
  (@monitor_id, 'tecnica', 'Compatible con G-Sync y FreeSync'),
  (@monitor_id, 'tecnica', 'Certificación VESA DisplayHDR 400 True Black'),
  (@monitor_id, 'tecnica', 'Cobertura de color 99% DCI-P3'),
  (@monitor_id, 'tecnica', 'Disipador térmico personalizado con película de grafeno'),
  (@monitor_id, 'tecnica', 'Entradas HDMI 2.1, DisplayPort y USB-C con entrega de energía de 90 W');

INSERT INTO productos (
  nombre, descripcion, descripcion_corta, categoria_id, costo_base, precio_final,
  margen_propio, imagen_url, stock, estado, marca, tipo, etiqueta, destacado,
  terminos_busqueda
)
SELECT
  'Fuente de Poder Corsair AX1600i',
  'Fuente de poder digital Corsair AX1600i de 1600 W, certificación 80 PLUS Titanium, plataforma GaN y operación totalmente modular.',
  '1600 W continuos, 80 PLUS Titanium, totalmente modular, monitoreo digital iCUE y garantía de 10 años.',
  @energia_categoria_id, 10078.20, 13605.57, 35,
  'imagenes/imagenes-accesorios/energia-y-cables/fuente-corsair-ax1600i-1.jpg',
  2, 'activo', 'CORSAIR', 'accesorio', '1600 W Titanium', 1,
  '["corsair","ax1600i","fuente de poder","fuente 1600w","80 plus titanium","gan"]'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Fuente de Poder Corsair AX1600i');

SET @fuente_id = (SELECT id FROM productos WHERE nombre = 'Fuente de Poder Corsair AX1600i' ORDER BY id LIMIT 1);
UPDATE productos SET categoria_id = @energia_categoria_id, costo_base = 10078.20,
  precio_final = 13605.57, margen_propio = 35,
  imagen_url = 'imagenes/imagenes-accesorios/energia-y-cables/fuente-corsair-ax1600i-1.jpg'
WHERE id = @fuente_id;
DELETE FROM imagenes_producto WHERE producto_id = @fuente_id;
INSERT INTO imagenes_producto (producto_id, url, posicion) VALUES
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/fuente-corsair-ax1600i-1.jpg', 1),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_02.avif', 2),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_03.avif', 3),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_05.avif', 4),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_06.avif', 5),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_07.avif', 6),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_08.avif', 7),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_09.avif', 8),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_10.avif', 9),
  (@fuente_id, 'imagenes/imagenes-accesorios/energia-y-cables/corsair-ax1600i/AX1600i_11.avif', 10);
DELETE FROM especificaciones WHERE producto_id = @fuente_id;
INSERT INTO especificaciones (producto_id, tipo, descripcion) VALUES
  (@fuente_id, 'tecnica', 'Potencia: 1600 W continuos'),
  (@fuente_id, 'tecnica', 'Certificación 80 PLUS Titanium (más del 94% de eficiencia)'),
  (@fuente_id, 'tecnica', 'Totalmente modular'),
  (@fuente_id, 'tecnica', 'Transistores de Nitruro de Galio (GaN) Totem-pole PFC'),
  (@fuente_id, 'tecnica', 'Ventilador FDB de 140 mm con modo Zero RPM'),
  (@fuente_id, 'tecnica', 'Monitoreo digital y sincronización RGB mediante CORSAIR iCUE'),
  (@fuente_id, 'tecnica', 'Capacitores electrolíticos japoneses de 105 °C'),
  (@fuente_id, 'tecnica', 'Protecciones: OVP, UVP, SCP, OTP y OPP'),
  (@fuente_id, 'tecnica', 'Conectores: 1x ATX, 9x PATA, 16x SATA y 2x Floppy'),
  (@fuente_id, 'tecnica', 'Garantía de 10 años'),
  (@fuente_id, 'tecnica', 'Dimensiones: 150 x 86 x 200 mm');

DELETE FROM especificaciones
WHERE tipo = 'clave' AND producto_id IN (@he1_id, @teclado_id, @monitor_id, @fuente_id);
INSERT INTO especificaciones (producto_id, tipo, descripcion) VALUES
  (@he1_id, 'clave', 'Amplificador integrado en mármol'),
  (@he1_id, 'clave', 'Tubos de vacío protegidos con cuarzo'),
  (@he1_id, 'clave', '8 DACs ESS SABRE'),
  (@he1_id, 'clave', 'Cables OFC plateados'),
  (@teclado_id, 'clave', 'Switches magnéticos Ice Blade'),
  (@teclado_id, 'clave', 'Rapid Trigger 0.01 mm'),
  (@teclado_id, 'clave', 'Polling rate 8000 Hz'),
  (@teclado_id, 'clave', 'Estructura Gasket Mount'),
  (@monitor_id, 'clave', 'Panel QD-OLED 4K'),
  (@monitor_id, 'clave', '240 Hz y 0.03 ms'),
  (@monitor_id, 'clave', 'Disipador de grafeno'),
  (@monitor_id, 'clave', 'Certificación HDR 400 True Black'),
  (@fuente_id, 'clave', '1600 W Titanium'),
  (@fuente_id, 'clave', 'Transistores GaN'),
  (@fuente_id, 'clave', 'Modo Zero RPM'),
  (@fuente_id, 'clave', 'Monitoreo CORSAIR iCUE');

UPDATE especificaciones e JOIN productos p ON p.id = e.producto_id
SET e.tipo = 'clave'
WHERE p.nombre = 'Sennheiser HE1 Orpheus' AND e.tipo = 'tecnica'
  AND e.descripcion IN (
    'Amplificador Cool Class A MOS-FET de alta tensión',
    'Diafragmas vaporizados de platino de 2.4 micrómetros'
  );

UPDATE especificaciones e JOIN productos p ON p.id = e.producto_id
SET e.tipo = 'clave'
WHERE p.nombre = 'Teclado Magnético Cool 68' AND e.tipo = 'tecnica'
  AND e.descripcion IN (
    'Teclas PBT de doble inyección',
    'Conectividad USB Type-C',
    'Vida útil del switch: 100 millones de clics'
  );

UPDATE especificaciones e JOIN productos p ON p.id = e.producto_id
SET e.tipo = 'clave'
WHERE p.nombre = 'Monitor ASUS ROG Swift PG32UCDM' AND e.tipo = 'tecnica'
  AND e.descripcion IN (
    'Compatible con G-Sync y FreeSync',
    'Cobertura de color 99% DCI-P3'
  );

UPDATE especificaciones e JOIN productos p ON p.id = e.producto_id
SET e.tipo = 'clave'
WHERE p.nombre = 'Fuente de Poder Corsair AX1600i' AND e.tipo = 'tecnica'
  AND e.descripcion IN (
    'Totalmente modular',
    'Capacitores electrolíticos japoneses de 105 °C',
    'Garantía de 10 años'
  );

UPDATE productos SET en_oferta = 1, descuento = 1
WHERE nombre IN ('Monitor ASUS ROG Swift PG32UCDM', 'Teclado Magnético Cool 68');

UPDATE productos
SET personalizacion = JSON_ARRAY(
  JSON_OBJECT('grupo','refrigeracion','grupoEtiqueta','Refrigeración líquida','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','aire-incluido','etiqueta','Refrigeración incluida','extra',0),
    JSON_OBJECT('valor','custom-loop','etiqueta','Refrigeración Líquida Custom','extra',5000))),
  JSON_OBJECT('grupo','almacenamiento','grupoEtiqueta','Almacenamiento SSD','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','1tb-nvme','etiqueta','SSD NVMe 1 TB','extra',0),
    JSON_OBJECT('valor','50tb-ssd','etiqueta','50 TB SSD','extra',15000))),
  JSON_OBJECT('grupo','memoria','grupoEtiqueta','Memoria RAM','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','32gb-ddr5','etiqueta','32 GB DDR5','extra',0),
    JSON_OBJECT('valor','128gb-ddr5','etiqueta','128 GB RAM','extra',8000))),
  JSON_OBJECT('grupo','iluminacion','grupoEtiqueta','Iluminación del sistema','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','rgb-controlado','etiqueta','RGB sincronizado','extra',0),
    JSON_OBJECT('valor','rgb-extremo','etiqueta','Iluminación RGB Extrema','extra',3500)))
)
WHERE nombre = 'PC para juegos VENGEANCE a7500';

UPDATE productos
SET personalizacion = JSON_ARRAY(
  JSON_OBJECT('grupo','proteccion','grupoEtiqueta','Cobertura Apple','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','garantia-estandar','etiqueta','Garantía estándar','extra',0),
    JSON_OBJECT('valor','apple-care-plus','etiqueta','Apple Care+','extra',8000))),
  JSON_OBJECT('grupo','chip','grupoEtiqueta','Procesador','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','m5-pro','etiqueta','Chip M5 Pro','extra',0),
    JSON_OBJECT('valor','m5-max','etiqueta','Chip M5 Max','extra',25000))),
  JSON_OBJECT('grupo','memoria-unificada','grupoEtiqueta','Memoria unificada','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','36gb-unificada','etiqueta','36 GB unificada','extra',0),
    JSON_OBJECT('valor','128gb-unificada','etiqueta','Memoria Unificada 128 GB','extra',20000))),
  JSON_OBJECT('grupo','teclado','grupoEtiqueta','Teclado y acceso','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','touch-id-incluido','etiqueta','Teclado estándar','extra',0),
    JSON_OBJECT('valor','touch-id','etiqueta','Teclado con Touch ID','extra',3500)))
)
WHERE nombre = 'MacBook Pro 16" M5 Max';

UPDATE productos
SET personalizacion = JSON_ARRAY(
  JSON_OBJECT('grupo','pantalla','grupoEtiqueta','Pantalla','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','oled-wuxga','etiqueta','OLED WUXGA','extra',0),
    JSON_OBJECT('valor','oled-4k','etiqueta','Pantalla 4K OLED','extra',6000))),
  JSON_OBJECT('grupo','monitores','grupoEtiqueta','Espacio de trabajo','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','monitor-integrado','etiqueta','Pantalla integrada','extra',0),
    JSON_OBJECT('valor','doble-monitor','etiqueta','Doble Monitor Externo','extra',10000))),
  JSON_OBJECT('grupo','acoplamiento','grupoEtiqueta','Conectividad de escritorio','opciones',JSON_ARRAY(
    JSON_OBJECT('valor','adaptador-usb-c','etiqueta','Adaptador USB-C','extra',0),
    JSON_OBJECT('valor','estacion-acoplamiento','etiqueta','Estación de Acoplamiento','extra',3000)))
)
WHERE nombre = 'ASUS Zenbook 14 OLED';

UPDATE productos AS p
SET p.personalizacion = JSON_ARRAY(
  JSON_OBJECT('grupo',CONCAT('equipo-',p.id,'-rendimiento'),
    'grupoEtiqueta',CASE MOD(p.id,6) WHEN 0 THEN 'Aceleración gráfica' WHEN 1 THEN 'Potencia de procesamiento' WHEN 2 THEN 'Perfil de creación' WHEN 3 THEN 'Modo de juego' WHEN 4 THEN 'Cómputo avanzado' ELSE 'Perfil profesional' END,
    'opciones',JSON_ARRAY(
      JSON_OBJECT('valor',CONCAT('base-',p.id,'-rendimiento'),'etiqueta','Rendimiento de fábrica','extra',0),
      JSON_OBJECT('valor',CONCAT('plus-',p.id,'-rendimiento'),'etiqueta',CASE MOD(p.id,6) WHEN 0 THEN 'Overclock de estudio' WHEN 1 THEN 'Turbo multinúcleo' WHEN 2 THEN 'Aceleración de IA' WHEN 3 THEN 'Modo competitivo' WHEN 4 THEN 'Render sin límites' ELSE 'Perfil de máxima potencia' END,'extra',1200+MOD(p.id*947,12800)))),
  JSON_OBJECT('grupo',CONCAT('equipo-',p.id,'-memoria'),
    'grupoEtiqueta',CASE MOD(p.id,5) WHEN 0 THEN 'Memoria de trabajo' WHEN 1 THEN 'Almacenamiento ultrarrápido' WHEN 2 THEN 'Memoria para proyectos' WHEN 3 THEN 'Capacidad de biblioteca' ELSE 'Memoria de alto ancho de banda' END,
    'opciones',JSON_ARRAY(
      JSON_OBJECT('valor',CONCAT('base-',p.id,'-memoria'),'etiqueta','Configuración incluida','extra',0),
      JSON_OBJECT('valor',CONCAT('plus-',p.id,'-memoria'),'etiqueta',CASE MOD(p.id,5) WHEN 0 THEN 'Kit RAM de gran capacidad' WHEN 1 THEN 'SSD NVMe de expansión' WHEN 2 THEN 'Memoria para multitarea extrema' WHEN 3 THEN 'Archivo local de 16 TB' ELSE 'Memoria de latencia ultrabaja' END,'extra',900+MOD(p.id*613,9800)))),
  JSON_OBJECT('grupo',CONCAT('equipo-',p.id,'-experiencia'),
    'grupoEtiqueta',CASE MOD(p.id,6) WHEN 0 THEN 'Refrigeración y silencio' WHEN 1 THEN 'Movilidad extendida' WHEN 2 THEN 'Pantalla de referencia' WHEN 3 THEN 'Conectividad avanzada' WHEN 4 THEN 'Estación de trabajo' ELSE 'Cobertura y soporte' END,
    'opciones',JSON_ARRAY(
      JSON_OBJECT('valor',CONCAT('base-',p.id,'-experiencia'),'etiqueta','Configuración estándar','extra',0),
      JSON_OBJECT('valor',CONCAT('plus-',p.id,'-experiencia'),'etiqueta',CASE MOD(p.id,6) WHEN 0 THEN 'Lazo líquido silencioso' WHEN 1 THEN 'Batería de autonomía extendida' WHEN 2 THEN 'Panel calibrado de color' WHEN 3 THEN 'Dock Thunderbolt de expansión' WHEN 4 THEN 'Kit de captura y streaming' ELSE 'Soporte premium de cinco años' END,'extra',700+MOD(p.id*431,7600))))
)
WHERE p.tipo = 'computadora'
  AND p.nombre NOT IN ('PC para juegos VENGEANCE a7500','ASUS Zenbook 14 OLED','MacBook Pro 16" M5 Max');

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-04 18:50:30
