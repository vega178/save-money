-- ─────────────────────────────────────────────────────────────────────────────
-- docker/mysql/init/01_init.sql
--
-- This script runs automatically the FIRST time the MySQL container starts
-- (i.e., when the mysql_data volume is empty).
-- TypeORM with synchronize:true will create all tables automatically,
-- so this script only needs to handle one-time setup tasks.
-- ─────────────────────────────────────────────────────────────────────────────

-- Ensure the application database exists (MySQL env vars create it too,
-- but this is an explicit safety net).
CREATE DATABASE IF NOT EXISTS `db_save_money`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Grant the application user full access to its own database.
-- The user is already created by MYSQL_USER / MYSQL_PASSWORD env vars.
GRANT ALL PRIVILEGES ON `db_save_money`.* TO 'appuser'@'%';
FLUSH PRIVILEGES;
