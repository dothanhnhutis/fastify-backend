import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./v1/user/user.routes";

export default function appRoutes(server: FastifyInstance) {
  server.get("/health", (req: FastifyRequest, reply: FastifyReply) => {
    reply.code(200).send({
      status: "ok",
      environment: "development",
    });
  });

  server.register(userRoutes, { prefix: "/users" });
}
