import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./user/user.routes";
import authRoutes from "./auth/auth.routes";
import sessionRoutes from "./session/session.routes";
import roleRoutes from "./role/role.routes";

export default async function versionRoutes(fastify: FastifyInstance) {
  fastify.get("/health", (_: FastifyRequest, reply: FastifyReply) => {
    reply.code(200).send({
      status: "ok",
      environment: "development",
    });
  });

  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(sessionRoutes, { prefix: "/users/sessions" });
  fastify.register(userRoutes, { prefix: "/users" });
  fastify.register(roleRoutes, { prefix: "/roles" });
}
