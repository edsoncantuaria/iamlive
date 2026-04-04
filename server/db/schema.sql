-- MariaDB / MySQL — referência (o app cria a tabela em `createDb()` se não existir).
-- mysql -h HOST -u USER -p iamlive < db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(254) NULL,
  password_hash VARCHAR(255) NULL,
  google_sub VARCHAR(255) NULL,
  display_name VARCHAR(255) NULL,
  created_at BIGINT NOT NULL,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_google (google_sub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
