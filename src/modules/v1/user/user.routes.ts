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
import validateResource from "@/shared/middleware/validateResource";
import { createUserSchema1 } from "./user.schema";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: [
        requiredAuthMiddleware,
        checkPermissionMiddleware(["get:user:*"]),
      ],
    },
    queryUserController
  );

  fastify.post(
    "/",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["create:user"]),
        validateResource(createUserSchema1),
      ],
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
