-- ========================================================
-- Bozok 66 Süper Uygulama - MySQL Veritabanı ve Tablo Şeması
-- XAMPP / phpMyAdmin veya MySQL Workbench'te direkt çalıştırılabilir.
-- ========================================================

CREATE DATABASE IF NOT EXISTS `bozok66` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bozok66`;

-- 1. KULLANICILAR TABLOSU (Giriş / Kayıt Ol)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `hashed_password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Örnek Test Kullanıcısı
INSERT IGNORE INTO `users` (`id`, `full_name`, `email`, `hashed_password`) 
VALUES (1, 'Test Öğrenci', 'ogrenci@bozok.edu.tr', '123456');

-- 2. NÖBETÇİ ECZANELER TABLOSU
CREATE TABLE IF NOT EXISTS `duty_pharmacies` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `duty_date` VARCHAR(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `duty_pharmacies` (`id`, `name`, `address`, `phone`, `duty_date`) VALUES
(1, 'Bozok Eczanesi', 'Lise Caddesi No:12', '0354 111 22 33', 'Bugün'),
(2, 'Çamlık Eczanesi', 'Meydan Çarşısı No:4', '0354 222 33 44', 'Bugün');

-- 3. OTOBÜS HATLARI TABLOSU
CREATE TABLE IF NOT EXISTS `bus_routes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `route_name` VARCHAR(100) NOT NULL,
    `departure_times` TEXT NULL,
    `current_status` VARCHAR(50) DEFAULT 'Yolda'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `bus_routes` (`id`, `route_name`, `current_status`) VALUES
(1, '1 Nolu Hat: Kampüs - Merkez', 'Yolda (4 dk)'),
(2, '3 Nolu Hat: Terminal - Hastane', 'Durakta (1 dk)');
