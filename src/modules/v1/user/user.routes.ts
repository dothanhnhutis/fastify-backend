import { FastifyInstance } from "fastify";
import {
  createUserController,
  currentUserController,
  logoutUserController,
  queryUserController,
  userRolesController,
} from "./user.controller";
import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";
import checkPermissionMiddleware from "@/shared/middleware/checkPermission";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: [requiredAuthMiddleware, checkPermissionMiddleware([])],
    },
    queryUserController
  );

  fastify.post(
    "/",
    {
      preHandler: [requiredAuthMiddleware, checkPermissionMiddleware([])],
    },
    createUserController
  );

  fastify.get(
    "/me",
    { preHandler: [requiredAuthMiddleware] },
    currentUserController
  );

  fastify.get(
    "/roles",
    { preHandler: [requiredAuthMiddleware] },
    userRolesController
  );

  fastify.delete("/logout", logoutUserController);
}
