import { registerAs } from '@nestjs/config';

// ── Database config ──────────────────────────────────────────────────────────
// Mirrors application.properties DB settings
export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? 'rootpassword',
  database: process.env.DB_DATABASE ?? 'db_save_money',
}));

// ── JWT config ───────────────────────────────────────────────────────────────
// Mirrors TokenJwtConfig constants
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'change_this_secret_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
}));
