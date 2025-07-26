import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyCompress from "@fastify/compress";

import appRoutes from "@/modules";
import config from "./config";
import logger from "./logger";
import { Logger } from "winston";

declare module "fastify" {
  export interface FastifyInstance {}
  export interface FastifyRequest {
    // winstion: Logger;
  }
}

export function buildServer() {
  const server = fastify({
    logger: {
      level: "info",
      redact
      stream: {
        write(msg) {
          console.log(msg);
          logger.log("info", "test");
          try {
            const logObj = JSON.parse(msg) as { [index: string]: string };
            logger.log(logObj.level, logObj.msg, logObj);
          } catch (err) {
            //   logger.info(msg.trim());
          }
        },
      },
    },
  });

  // Logger
  //   server.decorate("winston", logger);
  //   server.register(async function (fastify, opts) {
  //     fastify.addHook("onRequest", async (request, reply) => {
  //       request.winstion = logger;
  //     });
  //   });

  server.register(fastifyHelmet);
  server.register(fastifyCors, {
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
  server.register(fastifyCompress);

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
