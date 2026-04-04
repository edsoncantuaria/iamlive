import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import type { Pool, PoolOptions, RowDataPacket } from 'mysql2/promise';
import { parseSyncPayload, type UserSyncPayloadV1 } from './sync/payload.js';

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
  deletePasswordResetsForUser(userId: string): Promise<void>;
  insertPasswordReset(userId: string, tokenHash: string, expiresAtMs: number): Promise<void>;
  findValidPasswordResetByTokenHash(
    tokenHash: string,
    nowMs: number,
  ): Promise<{ id: string; userId: string } | null>;
  markPasswordResetUsed(id: string, usedAtMs: number): Promise<void>;
  setUserPasswordHash(userId: string, passwordHash: string): Promise<void>;
  deleteExpiredPasswordResets(nowMs: number): Promise<void>;
  getUserSyncState(userId: string): Promise<{ payload: UserSyncPayloadV1; updatedAt: number } | null>;
  upsertUserSyncState(userId: string, payload: UserSyncPayloadV1, updatedAt: number): Promise<void>;
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at BIGINT NOT NULL,
      used_at BIGINT NULL,
      KEY idx_pr_user (user_id),
      KEY idx_pr_hash (token_hash),
      KEY idx_pr_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sync_state (
      user_id VARCHAR(36) NOT NULL PRIMARY KEY,
      payload JSON NOT NULL,
      updated_at BIGINT NOT NULL,
      KEY idx_uss_updated (updated_at)
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

    async deletePasswordResetsForUser(userId: string): Promise<void> {
      await pool.query('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL', [
        userId,
      ]);
    },

    async insertPasswordReset(
      userId: string,
      tokenHash: string,
      expiresAtMs: number,
    ): Promise<void> {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO password_resets (id, user_id, token_hash, expires_at, used_at)
         VALUES (?, ?, ?, ?, NULL)`,
        [id, userId, tokenHash, expiresAtMs],
      );
    },

    async findValidPasswordResetByTokenHash(
      tokenHash: string,
      nowMs: number,
    ): Promise<{ id: string; userId: string } | null> {
      type R = RowDataPacket & { id: string; user_id: string };
      const [rows] = await pool.query<R[]>(
        `SELECT id, user_id FROM password_resets
         WHERE token_hash = ? AND expires_at > ? AND used_at IS NULL LIMIT 1`,
        [tokenHash, nowMs],
      );
      const r = rows[0];
      return r ? { id: r.id, userId: r.user_id } : null;
    },

    async markPasswordResetUsed(id: string, usedAtMs: number): Promise<void> {
      await pool.query('UPDATE password_resets SET used_at = ? WHERE id = ?', [usedAtMs, id]);
    },

    async setUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
    },

    async deleteExpiredPasswordResets(nowMs: number): Promise<void> {
      await pool.query('DELETE FROM password_resets WHERE expires_at < ?', [nowMs]);
    },

    async getUserSyncState(
      userId: string,
    ): Promise<{ payload: UserSyncPayloadV1; updatedAt: number } | null> {
      type R = RowDataPacket & { payload: unknown; updated_at: number | string | bigint };
      const [rows] = await pool.query<R[]>(
        'SELECT payload, updated_at FROM user_sync_state WHERE user_id = ? LIMIT 1',
        [userId],
      );
      const r = rows[0];
      if (!r) return null;
      const updatedAt =
        typeof r.updated_at === 'bigint'
          ? Number(r.updated_at)
          : typeof r.updated_at === 'string'
            ? Number(r.updated_at)
            : r.updated_at;
      let payload: unknown = r.payload;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload) as unknown;
        } catch {
          return null;
        }
      }
      const parsed = parseSyncPayload(payload);
      if (!parsed) return null;
      return { payload: parsed, updatedAt };
    },

    async upsertUserSyncState(
      userId: string,
      payload: UserSyncPayloadV1,
      updatedAt: number,
    ): Promise<void> {
      const json = JSON.stringify(payload);
      await pool.query(
        `INSERT INTO user_sync_state (user_id, payload, updated_at)
         VALUES (?, CAST(? AS JSON), ?)
         ON DUPLICATE KEY UPDATE payload = CAST(? AS JSON), updated_at = ?`,
        [userId, json, updatedAt, json, updatedAt],
      );
    },

    async close(): Promise<void> {
      await pool.end();
    },
  };
}
