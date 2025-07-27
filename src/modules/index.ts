import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./v1/user/user.routes";

export default async function appRoutes(fastify: FastifyInstance) {
  fastify.get("/health", (_: FastifyRequest, reply: FastifyReply) => {
    reply.code(200).send({
      status: "ok",
      environment: "development",
    });
  });

  fastify.register(userRoutes, { prefix: "/users" });
}
