import { Logger } from "pino";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export interface CustomLogger extends Logger {
  // Có thể extend thêm methods nếu cần
}

// Extend Fastify types để include custom logger
declare module "fastify" {
  interface FastifyRequest {
    cookies: Map<string, string>;
  }
  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: CookieOptions
    ): FastifyReply;
    clearCookie(name: string): FastifyReply;
  }
}
