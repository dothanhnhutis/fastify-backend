import { FastifyInstance } from "fastify";
import { currentUserController, logoutUserController } from "./user.controller";
import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/me",
    { preHandler: [requiredAuthMiddleware] },
    currentUserController
  );

  fastify.delete("/logout", logoutUserController);
}
