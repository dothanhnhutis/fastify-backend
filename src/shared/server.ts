import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyCompress from "@fastify/compress";
import appRoutes from "@/modules";
import config from "./config";
import { loggerPlugin } from "./plugins/logger";

declare module "fastify" {
  export interface FastifyInstance {}
  export interface FastifyRequest {}
}

async function aaa(server: FastifyInstance) {
  server.addHook(
    "onRequest",
    async (req: FastifyRequest, reply: FastifyReply, done: Fastify) => {
      console.log("first");
    }
  );
}

export function buildServer() {
  const server = fastify({
    logger: false,
    trustProxy: true,
  });

  server.register(fastifyHelmet);
  server.register(fastifyCors, {
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
  server.register(fastifyCompress);
  // server.register(loggerPlugin);
  server.register(aaa);

  // server.addHook("onRequest", async (request, reply) => {
  //   request.log.info(
  //     {
  //       method: request.method,
  //       url: request.url,
  //       userAgent: request.headers["user-agent"],
  //       ip: request.ip,
  //     },
  //     "Incoming request"
  //   );
  // });

  // Routes
  server.register(appRoutes, { prefix: "/api" });

  // Error handling
  server.setErrorHandler((error, request, reply) => {
    console.log("Application error", {
      error: error.message,
      stack: error.stack,
    });
    reply.status(500).send({ error: "Internal Server Error" });
  });

  return server;
}
