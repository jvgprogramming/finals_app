-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: nikayPastry
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

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
-- Table structure for table `cake_customizations`
--

DROP TABLE IF EXISTS `cake_customizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cake_customizations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_item_id` bigint(20) unsigned NOT NULL,
  `dedication_message` text DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `flavor` varchar(255) DEFAULT NULL,
  `color_theme` varchar(255) DEFAULT NULL,
  `custom_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cake_customizations_order_item_id_foreign` (`order_item_id`),
  CONSTRAINT `cake_customizations_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cake_customizations`
--

LOCK TABLES `cake_customizations` WRITE;
/*!40000 ALTER TABLE `cake_customizations` DISABLE KEYS */;
INSERT INTO `cake_customizations` VALUES (1,1,NULL,'6\" Personal','Classic Vanilla',NULL,NULL,'2026-06-03 05:49:49','2026-06-03 05:49:49'),(2,2,NULL,'6\" Personal','Classic Vanilla',NULL,NULL,'2026-06-04 04:54:24','2026-06-04 04:54:24'),(3,3,'Tite','8\" Celebration',NULL,NULL,NULL,'2026-06-04 05:42:07','2026-06-04 05:42:07'),(4,4,NULL,'6\" Personal',NULL,NULL,NULL,'2026-06-04 05:42:07','2026-06-04 05:42:07'),(5,5,'Happy Gender Reveal!','8\" Celebration',NULL,NULL,NULL,'2026-06-04 05:46:02','2026-06-04 05:46:02');
/*!40000 ALTER TABLE `cake_customizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Celebration Cakes','Custom cakes for birthdays, weddings, and special events.','2026-06-01 06:55:51','2026-06-01 06:55:51'),(2,'Pastries','French pastries, tarts, and gourmet sweets.','2026-06-01 06:55:51','2026-06-01 06:55:51'),(3,'Breads','Artisan breads and rolls baked daily.','2026-06-01 06:55:51','2026-06-01 06:55:51');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (10,'2026_05_30_142021_create_users_table',1),(11,'2026_05_31_000001_create_personal_access_tokens_table',1),(12,'2026_06_01_000001_create_categories_table',1),(13,'2026_06_01_000002_create_products_table',1),(14,'2026_06_01_000003_create_orders_table',1),(15,'2026_06_01_000004_create_order_items_table',1),(16,'2026_06_01_000005_create_cake_customizations_table',1),(17,'2026_06_01_000006_create_notifications_table',1),(18,'2026_06_01_000007_add_role_to_users_table',1),(19,'2026_06_01_000008_drop_birth_date_from_users_table',2),(20,'2026_06_01_000009_add_payment_method_to_orders_table',3),(21,'2026_06_01_000010_add_fulfillment_fields_to_orders_table',4),(22,'2026_06_04_000001_remove_stock_from_products_table',5);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  KEY `notifications_order_id_foreign` (`order_id`),
  CONSTRAINT `notifications_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,1,'New Order','New order ORD-EI4FYGFX from adasdas',1,'2026-06-03 05:49:49','2026-06-04 05:43:44'),(2,6,1,'Order Received','Your order ORD-EI4FYGFX was submitted and is pending approval.',1,'2026-06-03 05:49:49','2026-06-04 07:23:07'),(3,6,1,'Order Accepted','Your order ORD-EI4FYGFX has been accepted and is being prepared.',1,'2026-06-03 05:51:04','2026-06-04 07:23:07'),(4,6,1,'Order Preparing','Your order ORD-EI4FYGFX is now being prepared.',1,'2026-06-03 05:51:37','2026-06-04 07:23:07'),(5,6,1,'Order Ready','Your order ORD-EI4FYGFX is ready for pickup/delivery.',1,'2026-06-03 05:51:48','2026-06-04 07:23:07'),(6,6,1,'Order Completed','Your order ORD-EI4FYGFX has been completed. Thank you!',1,'2026-06-03 05:52:02','2026-06-04 07:23:07'),(7,1,2,'New Order','New order ORD-BBEMAGWP from asdad',1,'2026-06-04 04:54:24','2026-06-04 05:43:44'),(8,6,2,'Order Received','Your order ORD-BBEMAGWP was submitted and is pending approval.',1,'2026-06-04 04:54:24','2026-06-04 07:23:07'),(9,6,2,'Order Declined','Your order ORD-BBEMAGWP has been declined. Reason: No Stock',1,'2026-06-04 04:54:44','2026-06-04 07:23:07'),(10,1,3,'New Order','New order ORD-PKLTTJIV from Philip John Arroza',1,'2026-06-04 05:42:07','2026-06-04 05:43:44'),(11,6,3,'Order Received','Your order ORD-PKLTTJIV was submitted and is pending approval.',1,'2026-06-04 05:42:07','2026-06-04 07:23:07'),(12,6,3,'Order Accepted','Your order ORD-PKLTTJIV has been accepted and is being prepared.',1,'2026-06-04 05:42:37','2026-06-04 07:23:07'),(13,6,3,'Order Preparing','Your order ORD-PKLTTJIV is now being prepared.',1,'2026-06-04 05:42:47','2026-06-04 07:23:07'),(14,6,3,'Order Ready','Your order ORD-PKLTTJIV is ready for pickup/delivery.',1,'2026-06-04 05:42:54','2026-06-04 07:23:07'),(15,6,3,'Order Completed','Your order ORD-PKLTTJIV has been completed. Thank you!',1,'2026-06-04 05:42:57','2026-06-04 07:23:07'),(16,1,4,'New Order','New order ORD-SAGONSJ1 from Joshua Quitoy',0,'2026-06-04 05:46:02','2026-06-04 05:46:02'),(17,6,4,'Order Received','Your order ORD-SAGONSJ1 was submitted and is pending approval.',1,'2026-06-04 05:46:02','2026-06-04 07:23:07');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `product_name_snapshot` varchar(255) NOT NULL,
  `product_price_snapshot` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,6,'Garlic Herb Focaccia',195.00,1,'2026-06-03 05:49:49','2026-06-03 05:49:49'),(2,2,7,'Ultra Mega Chocolate Cake',500.00,1,'2026-06-04 04:54:24','2026-06-04 04:54:24'),(3,3,7,'Ultra Mega Chocolate Cake',675.00,1,'2026-06-04 05:42:07','2026-06-04 05:42:07'),(4,3,6,'Garlic Herb Focaccia',195.00,1,'2026-06-04 05:42:07','2026-06-04 05:42:07'),(5,4,7,'Ultra Mega Chocolate Cake',675.00,1,'2026-06-04 05:46:02','2026-06-04 05:46:02');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(30) DEFAULT NULL,
  `fulfillment_type` varchar(20) NOT NULL DEFAULT 'pickup',
  `delivery_address` text DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','accepted','preparing','ready','completed','declined') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `delivery_date` datetime DEFAULT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash on Delivery',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_user_id_foreign` (`user_id`),
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,6,'adasdas','342432424242','pickup',NULL,'ORD-EI4FYGFX',195.00,0.00,'completed','Payment: COD','2026-06-03 12:00:00','Cash on Delivery','2026-06-03 05:49:49','2026-06-03 05:52:02'),(2,6,'asdad','2313123131','pickup',NULL,'ORD-BBEMAGWP',500.00,0.00,'declined','Payment: COD\nDeclined: No Stock','2026-06-04 12:00:00','Cash on Delivery','2026-06-04 04:54:24','2026-06-04 04:54:44'),(3,6,'Philip John Arroza','09924942986','delivery','Bliss Cagay, Roxas City','ORD-PKLTTJIV',920.00,50.00,'completed','Payment: COD','2026-06-05 18:00:00','Cash on Delivery','2026-06-04 05:42:07','2026-06-04 05:42:57'),(4,6,'Joshua Quitoy','09123133','pickup',NULL,'ORD-SAGONSJ1',675.00,0.00,'pending','Payment: COD','2026-06-18 12:00:00','Cash on Delivery','2026-06-04 05:46:02','2026-06-04 05:46:02');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (9,'App\\Models\\User',1,'auth_token','77c99c5d4b589b67aaacec7a77c8c9b85a17e804540e90fcdd2dd50b811622a8','[\"*\"]','2026-06-04 07:29:30',NULL,'2026-06-04 05:20:20','2026-06-04 07:29:30'),(10,'App\\Models\\User',6,'auth_token','8c9e1c426f7b577da8a964f95f30425eef1a018727975ec6ff08af877b61276e','[\"*\"]','2026-06-04 07:29:39',NULL,'2026-06-04 05:41:15','2026-06-04 07:29:39'),(11,'App\\Models\\User',1,'test','772bf287babade6a317abe0f95b4b031a0f105606369d3e82938fdf18b8dbfcd','[\"*\"]','2026-06-04 06:30:13',NULL,'2026-06-04 06:28:41','2026-06-04 06:30:13');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_category_id_foreign` (`category_id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Strawberry Velvet Gateau','Layers of moist red velvet sponge with fresh strawberries and cream cheese frosting.',1250.00,NULL,1,'2026-06-01 06:55:51','2026-06-04 06:31:18','2026-06-04 06:31:18'),(2,1,'Chocolate Truffle Delight','Rich dark chocolate cake with truffle ganache and gold-dusted finish.',1450.00,NULL,1,'2026-06-01 06:55:51','2026-06-04 06:31:21','2026-06-04 06:31:21'),(3,2,'Salted Caramel Éclair','Choux pastry filled with salted caramel cream and dark chocolate glaze.',185.00,NULL,1,'2026-06-01 06:55:51','2026-06-04 06:31:23','2026-06-04 06:31:23'),(4,2,'Mango Passion Tart','Buttery tart shell with mango-passion fruit curd and torched meringue.',220.00,NULL,1,'2026-06-01 06:55:51','2026-06-04 06:31:25','2026-06-04 06:31:25'),(5,3,'Honey Oat Loaf','Soft artisan loaf with local honey, rolled oats, and sunflower seeds.',165.00,NULL,1,'2026-06-01 06:55:51','2026-06-04 06:31:27','2026-06-04 06:31:27'),(6,3,'Garlic Herb Focaccia','Olive oil focaccia topped with roasted garlic, rosemary, and sea salt.',195.00,NULL,1,'2026-06-01 06:55:51','2026-06-04 06:31:29','2026-06-04 06:31:29'),(7,1,'Ultra Mega Chocolate Cake','Rich chocolate layer cake with chocolate buttercream and chocolate shavings. No chocolate vegan',500.00,'1780496083_Chocolate Dedication Cake.webp',1,'2026-06-03 06:01:28','2026-06-04 05:37:00',NULL),(8,1,'Test Product 2','A nice pastry',100.00,NULL,1,'2026-06-04 06:29:05','2026-06-04 06:32:06','2026-06-04 06:32:06'),(9,2,'Test Product 4','Short',50.00,NULL,0,'2026-06-04 06:29:34','2026-06-04 06:32:04','2026-06-04 06:32:04'),(10,3,'Test No Desc','',25.00,NULL,1,'2026-06-04 06:30:13','2026-06-04 06:32:02','2026-06-04 06:32:02'),(11,1,'Ube Overload Cake','Layers of purple yam chiffon cake with ube cream and ube halaya filling',250.00,'1780583470_Ube-Overload-Cake.webp',1,'2026-06-04 06:31:10','2026-06-04 06:31:10',NULL),(12,1,'Mango Supreme Cake','Chiffon cake with fresh mango slices, mango cream, and caramelized pecans',300.00,'1780584356_goldilocks-mango-delight-cake.jpg',1,'2026-06-04 06:45:56','2026-06-04 06:45:56',NULL),(13,1,'Chiffon Cake','An ultra-light, airy, and moist sponge cake that blends the qualities of traditional foam cakes and batter cake',250.00,'1780584445_Chiffon-Cake-Recipe-Card.jpg',1,'2026-06-04 06:47:25','2026-06-04 06:47:25',NULL),(14,1,'Yema Cake','Fluffy Sponge cake with a creamy egg custard frosting and grated cheese topping.',270.00,'1780584503_20204721.webp',1,'2026-06-04 06:48:23','2026-06-04 06:48:23',NULL),(15,3,'Pandesal','A beloved Filipino yeast-raised bread roll, its signature pillowy, airy interior and a golden-brown crust dusted with fine breadcrumbs.',60.00,'1780584653_Pandesal-1.webp',1,'2026-06-04 06:50:53','2026-06-04 06:50:53',NULL),(16,3,'Spanish Bread','Consists of a soft, fluffy, yeasted dough rolled around a sweet, buttery, and caramelized brown sugar filling, finished with a golden-brown, breadcrumb-dusted exterior.',80.00,'1780584809_spanish.jpg',1,'2026-06-04 06:53:29','2026-06-04 06:53:29',NULL),(17,3,'Butter Puto','A soft, moist, and fluffy Filipino steamed cake. Infused with rich, creamy butter, it offers a perfect balance of sweet and buttery flavors,',127.00,'1780584923_Butter Puto.webp',1,'2026-06-04 06:55:23','2026-06-04 06:55:23',NULL),(18,3,'Banana Bread Loaf','Classic Banana Bread baked fresh daily using perfectly ripe, sweet bananas to guarantee a super moist and fluffy texture.',220.00,'1780585085_BANANAWALNUTRAISINcopy_900x.webp',1,'2026-06-04 06:58:05','2026-06-04 06:58:05',NULL),(19,3,'Cheese Roll','Super soft and fluffy bread glistening with melted butter and granulated sugar on top with melty and gooey cheese inside.',210.00,'1780585279_cheese-rolls.jpg',1,'2026-06-04 07:01:19','2026-06-04 07:01:19',NULL),(20,2,'Cheesy Ensaymada','Generously brushed with sweet butter and blanketed with a generous layer of grated cheese.',240.00,'1780585678_images (1).jpg',1,'2026-06-04 07:07:58','2026-06-04 07:07:58',NULL),(21,2,'Hopia','A traditional Filipino flaky pastry filled with sweet mung bean paste and savory pork fat, giving it a rich and delicious flavor loved as a snack or dessert.',110.00,'1780585799_hopia-recipe-1-1-500x500.jpg',1,'2026-06-04 07:09:59','2026-06-04 07:09:59',NULL),(22,2,'Mamon','Mamon is a rich, soft, buttery, and baked to perfection delight',250.00,'1780586026_mamon-640.jpg',1,'2026-06-04 07:13:46','2026-06-04 07:13:46',NULL),(23,2,'Coconut Macaroons','Featuring a golden-brown, lightly toasted top and a moist, chewy center.',268.00,'1780586178_macaroon.jpg',1,'2026-06-04 07:16:18','2026-06-04 07:16:18',NULL),(24,2,'Napoleones','Bite-sized, square or rectangular pastries consisting of thin, golden-brown puff pastry layers that sandwich a creamy custard filling.',240.00,'1780586573_images (2).jpg',1,'2026-06-04 07:22:53','2026-06-04 07:22:53',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `suffix_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','customer') NOT NULL DEFAULT 'customer',
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'John','Michael','Doe',NULL,'johndoe','$2y$12$aWF3T68Sv5CfJBn.JHOVQuADdrIhREbP9dUCgSzRZDRvsDWWRz88S','admin',NULL,'2026-06-01 06:55:51','2026-06-01 06:55:51',NULL),(2,'Jane','Marie','Smith',NULL,'janesmith','$2y$12$3zysTmKLPsSQI36nCfDi1uJsskG4Y5m38c4Tgyrg3Fp5okKt40pTm','customer',NULL,'2026-06-01 06:55:51','2026-06-01 06:55:51',NULL),(3,'Robert',NULL,'Johnson','Jr.','rjohnson','$2y$12$2jm5bqF5HUGBmfzETBWhg.kmhjRVU0WsLSSr7zHyT8MpDICkIQTkq','customer',NULL,'2026-06-01 06:55:51','2026-06-01 06:55:51',NULL),(4,'Emily','Rose','Brown',NULL,'ebrown123','$2y$12$tBkHzY70z6OslANBYZynAeQ/ABbcqbIukFDwaD8qLDzvFi87jt4Mu','customer',NULL,'2026-06-01 06:55:51','2026-06-01 06:55:51',NULL),(5,'Michael','David','Wilson',NULL,'mwilson','$2y$12$XeJ2yHa4QI8gQFNXw/1skOKEZ5ZIRIqzC5P.xLH1qezsPV/EaGrUe','customer',NULL,'2026-06-01 06:55:52','2026-06-01 06:55:52',NULL),(6,'Philip',NULL,'Arroza',NULL,'pjarroza','$2y$12$7TFLMIIi0MJ08YCSsiPireFktqraL0Ko2afBbEd9mDKZQrxRrLU4e','customer',NULL,'2026-06-01 07:43:17','2026-06-01 07:43:17',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-04 23:29:41
