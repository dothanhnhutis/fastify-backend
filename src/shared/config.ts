import dotenv from "dotenv";
import z from "zod";

dotenv.config({});

const envSchema = z.object({
  // server
  NODE_ENV: z.string(),
  PORT: z.number(),
  DEBUG: z.boolean(),
  CLIENT_URL: z.string(),
  SERVER_URL: z.string(),
  // cache
  REDIS_URL: z.string(),
  CACHE_TTL: z.number(),
  // jwt
  JWT_SECRET: z.string(),
  // session
  SESSION_KEY_NAME: z.string(),
  SESSION_MAX_AGE: z.number(),
  SESSION_SECRET_KEY: z.string(),
  // google
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REFRESH_TOKEN: z.string(),
  // mail
  APP_ICON: z.string(),
  SENDER_EMAIL: z.string(),
  // message broker
  RABBITMQ_URL: z.string(),
  DATABASE_URL: z.string(),
});

const configParser = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV || "development",
  DEBUG: process.env.APP_DEBUG === "true",
  PORT: parseInt(process.env.PORT || "4000"),
  CLIENT_URL: process.env.CLIENT_URL,
  SERVER_URL: process.env.SERVER_URL,

  REDIS_URL: process.env.REDIS_URL,
  CACHE_TTL: parseInt(process.env.CACHE_TTL || "300"),

  JWT_SECRET: process.env.JWT_SECRET,

  SESSION_KEY_NAME: process.env.SESSION_KEY_NAME,
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || "2592000000"),
  SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,

  APP_ICON: process.env.APP_ICON,
  SENDER_EMAIL: process.env.SENDER_EMAIL,

  RABBITMQ_URL: process.env.RABBITMQ_URL,
  DATABASE_URL: process.env.DATABASE_URL,

  // CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  // CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
  // CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
});

if (!configParser.success) {
  console.error(configParser.error.issues);
  throw new Error("The values in the env file are invalid");
}

export default configParser.data;
