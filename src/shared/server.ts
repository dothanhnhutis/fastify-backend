import Fastify from "fastify";
import addErrors from "ajv-errors";
import addFormats from "ajv-formats";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyCompress from "@fastify/compress";

import config from "./config";
import appRoutes from "@/modules";
import loggerPlugin from "./plugins/logger";
import postgresDBPlugin from "./plugins/postgres";
import redisPlugin from "./plugins/redis";
import cookiePlugin from "./plugins/cookie";
import sessionPlugin from "./plugins/session";
import { errorHandler } from "./error-handler";

export async function buildServer() {
  const fastify = Fastify({
    logger: false,
    trustProxy: true,
    ajv: {
      customOptions: {
        allErrors: true,
        coerceTypes: false,
        strict: true,
      },
      plugins: [addErrors, addFormats],
    },
  });

  fastify.register(fastifyHelmet);
  fastify.register(fastifyCors, {
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
  fastify.register(fastifyCompress, {
    requestEncodings: ["gzip", "deflate"], // Bỏ brotli
    threshold: 1024,
    customTypes: /^text\/|\+json$|\+text$|\+xml$/,
    global: true,
  });

  await fastify
    .register(loggerPlugin, {
      level: "info",
      serviceName: "my-api-service",
    })
    .register(postgresDBPlugin)
    .register(redisPlugin, { url: config.REDIS_URL });

  fastify.register(cookiePlugin, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
  });

  fastify.register(sessionPlugin, {
    secret: config.SESSION_SECRET_KEY,
    cookieName: config.SESSION_KEY_NAME,
  });

  // Routes
  fastify.register(appRoutes, { prefix: "/api" });

  // Error handling
  fastify.setErrorHandler(errorHandler);

  return fastify;
}
