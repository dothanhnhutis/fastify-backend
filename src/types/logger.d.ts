import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Logger } from "pino";

export interface CustomLogger extends Logger {
  // Có thể extend thêm methods nếu cần
}

// Extend Fastify types để include custom logger
declare module "fastify" {
  interface FastifyInstance {
    logger: CustomLogger;
    routeLogger: Logger;
  }

  interface FastifyRequest {
    logger: CustomLogger;
    startTime: [number, number];
  }
}
