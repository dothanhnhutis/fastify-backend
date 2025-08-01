import Fastify, {
  FastifyInstance,
  FastifyRegisterOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyCompress from "@fastify/compress";
import appRoutes from "@/modules";
import config from "./config";
import loggerPlugin from "./plugins/logger";
import postgresDBPlugin from "./plugins/postgres";
import redisPlugin from "./plugins/redis";
import { errorHandler } from "./error-handler";

// declare module "fastify" {
//   export interface FastifyInstance {
//     utility: () => void;
//   }
//   export interface FastifyRequest {}
// }

export async function buildServer() {
  const fastify = Fastify({
    logger: false,
    trustProxy: true,
  });
  await fastify
    .register(loggerPlugin, {
      level: "debug",
      serviceName: "my-api-service",
    })
    .register(postgresDBPlugin);
  // .register(redisPlugin, { url: config.REDIS_URL });

  fastify.register(fastifyHelmet);
  fastify.register(fastifyCors, {
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
  fastify.register(fastifyCompress);

  // Routes
  fastify.register(appRoutes, { prefix: "/api/v1" });

  // Error handling
  fastify.setErrorHandler(errorHandler);

  return fastify;
}
