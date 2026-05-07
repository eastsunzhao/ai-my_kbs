CREATE DATABASE IF NOT EXISTS `my_kbs` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'my_kbs'@'%' IDENTIFIED WITH mysql_native_password BY 'admin123';
GRANT ALL PRIVILEGES ON `my_kbs`.* TO 'my_kbs'@'%';
FLUSH PRIVILEGES;
