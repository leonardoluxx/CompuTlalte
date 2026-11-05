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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-04 18:50:30
