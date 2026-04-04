import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import type { Pool, PoolOptions, RowDataPacket } from 'mysql2/promise';

export type UserRow = {
  id: string;
  email: string | null;
  password_hash: string | null;
  google_sub: string | null;
  display_name: string | null;
  created_at: number;
};

type UserRowDb = RowDataPacket & {
  id: string;
  email: string | null;
  password_hash: string | null;
  google_sub: string | null;
  display_name: string | null;
  created_at: number | string | bigint;
};

export type AppDb = {
  findByEmail(email: string): Promise<UserRow | undefined>;
  findById(id: string): Promise<UserRow | undefined>;
  createWithPassword(email: string, password: string): Promise<UserRow>;
  verifyPassword(row: UserRow, password: string): Promise<boolean>;
  close(): Promise<void>;
};

function mapUserRow(r: UserRowDb): UserRow {
  const created =
    typeof r.created_at === 'bigint'
      ? Number(r.created_at)
      : typeof r.created_at === 'string'
        ? Number(r.created_at)
        : r.created_at;
  return {
    id: r.id,
    email: r.email,
    password_hash: r.password_hash,
    google_sub: r.google_sub,
    display_name: r.display_name,
    created_at: created,
  };
}

function buildPoolConfig(): PoolOptions | string {
  const url = process.env.DATABASE_URL?.trim();
  if (url && (url.startsWith('mysql://') || url.startsWith('mariadb://'))) {
    return url;
  }

  const host = process.env.MYSQL_HOST ?? process.env.MARIADB_HOST;
  const user = process.env.MYSQL_USER ?? process.env.MARIADB_USER;
  const password = process.env.MYSQL_PASSWORD ?? process.env.MARIADB_PASSWORD ?? '';
  const database = process.env.MYSQL_DATABASE ?? process.env.MARIADB_DATABASE;

  if (!host || !user || database === undefined || database === '') {
    console.error(
      'Defina DATABASE_URL (mysql://...) ou MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD e MYSQL_DATABASE.',
    );
    process.exit(1);
  }

  const useSsl =
    process.env.DATABASE_SSL === '1' || process.env.DATABASE_SSL === 'true';

  return {
    host,
    port: Number(process.env.MYSQL_PORT ?? process.env.MARIADB_PORT ?? 3306),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: Math.min(20, Math.max(2, Number(process.env.MYSQL_POOL_MAX ?? 5))),
    enableKeepAlive: true,
    ...(useSsl
      ? {
          ssl: {
            rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== '0',
          },
        }
      : {}),
  };
}

function createPoolFromConfig(cfg: PoolOptions | string): Pool {
  return typeof cfg === 'string' ? mysql.createPool(cfg) : mysql.createPool(cfg);
}

async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      email VARCHAR(254) NULL,
      password_hash VARCHAR(255) NULL,
      google_sub VARCHAR(255) NULL,
      display_name VARCHAR(255) NULL,
      created_at BIGINT NOT NULL,
      UNIQUE KEY uq_users_email (email),
      UNIQUE KEY uq_users_google (google_sub)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function createDb(): Promise<AppDb> {
  const pool = createPoolFromConfig(buildPoolConfig());

  await ensureSchema(pool);

  return {
    async findByEmail(email: string): Promise<UserRow | undefined> {
      const normalized = email.trim().toLowerCase();
      const [rows] = await pool.query<UserRowDb[]>(
        'SELECT id, email, password_hash, google_sub, display_name, created_at FROM users WHERE email = ? LIMIT 1',
        [normalized],
      );
      const r = rows[0];
      return r ? mapUserRow(r) : undefined;
    },

    async findById(id: string): Promise<UserRow | undefined> {
      const [rows] = await pool.query<UserRowDb[]>(
        'SELECT id, email, password_hash, google_sub, display_name, created_at FROM users WHERE id = ? LIMIT 1',
        [id],
      );
      const r = rows[0];
      return r ? mapUserRow(r) : undefined;
    },

    async createWithPassword(email: string, password: string): Promise<UserRow> {
      const id = randomUUID();
      const rounds = Math.min(12, Math.max(10, Number(process.env.BCRYPT_ROUNDS ?? 10)));
      const password_hash = await bcrypt.hash(password, rounds);
      const row: UserRow = {
        id,
        email: email.trim().toLowerCase(),
        password_hash,
        google_sub: null,
        display_name: null,
        created_at: Date.now(),
      };
      await pool.query(
        `INSERT INTO users (id, email, password_hash, google_sub, display_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [row.id, row.email, row.password_hash, row.google_sub, row.display_name, row.created_at],
      );
      return row;
    },

    async verifyPassword(row: UserRow, password: string): Promise<boolean> {
      if (!row.password_hash) return false;
      return bcrypt.compare(password, row.password_hash);
    },

    async close(): Promise<void> {
      await pool.end();
    },
  };
}
