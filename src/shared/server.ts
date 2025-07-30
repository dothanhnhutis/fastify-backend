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
  await fastify.register(loggerPlugin, {
    level: "debug",
    serviceName: "my-api-service",
  });
  fastify.register(postgresDBPlugin);

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
  fastify.setErrorHandler((error, request, reply) => {
    console.log("Application error", {
      error: error.message,
      stack: error.stack,
    });
    reply.status(500).send({ error: "Internal Server Error" });
  });

  return fastify;
}
