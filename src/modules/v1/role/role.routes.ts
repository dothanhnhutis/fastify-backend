import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";
import { FastifyInstance } from "fastify";
import {
  createRoleController,
  deleteRoleByIdController,
  findRoleByIdController,
  queryRoleController,
  updateRoleByIdController,
} from "./role.controller";
import checkPermissionMiddleware from "@/shared/middleware/checkPermission";
import { createRoleSchema, getRoleByIdSchema } from "./role.schema";
import validateResource from "@/shared/middleware/validateResource";

export default async function roleRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: [
        requiredAuthMiddleware,
        checkPermissionMiddleware(["read:role:*"]),
        // validateResource(queryRoleSchema),
      ],
    },
    queryRoleController
  );

  fastify.get(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        checkPermissionMiddleware(["read:role:id"]),
        validateResource(getRoleByIdSchema),
      ],
    },
    findRoleByIdController
  );

  fastify.post(
    "/",
    {
      preHandler: [
        requiredAuthMiddleware,
        checkPermissionMiddleware(["create:role"]),
        validateResource(createRoleSchema),
      ],
    },
    createRoleController
  );

  fastify.patch(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        checkPermissionMiddleware(["update:role"]),
      ],
    },
    updateRoleByIdController
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        checkPermissionMiddleware(["delete:role"]),
      ],
    },
    deleteRoleByIdController
  );
}
