import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";
import { FastifyInstance } from "fastify";
import {
  createRoleController,
  deleteRoleByIdController,
  findRoleByIdController,
  updateRoleByIdController,
} from "./role.controller";
import checkPermissionMiddleware from "@/shared/middleware/checkPermission";
import { createRoleSchema, updateRoleSchema } from "./role.schema";

export default async function roleRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        checkPermissionMiddleware(["read:role:id"]),
      ],
    },
    findRoleByIdController
  );

  fastify.post(
    "/",
    {
      schema: createRoleSchema,
      preHandler: [
        requiredAuthMiddleware,
        checkPermissionMiddleware(["create:role"]),
      ],
      attachValidation: true,
    },
    createRoleController
  );

  fastify.patch(
    "/:id",
    {
      schema: updateRoleSchema,
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
