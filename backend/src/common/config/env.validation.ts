import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().integer().positive().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  THROTTLE_TTL_MS: Joi.number().integer().positive().default(60_000),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(100),
  AUTH_THROTTLE_TTL_MS: Joi.number().integer().positive().default(60_000),
  AUTH_THROTTLE_LIMIT: Joi.number().integer().positive().default(10),
  UPLOAD_MAX_SIZE_BYTES: Joi.number()
    .integer()
    .positive()
    .default(5 * 1024 * 1024),
});
