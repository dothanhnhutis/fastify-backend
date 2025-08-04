import { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    currUser: User | null;
    sessionKey: string | null;
  }
}
