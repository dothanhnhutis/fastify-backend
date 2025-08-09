import { FastifyInstance } from "fastify";

import validateResource from "@/shared/middleware/validateResource";
import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";
import checkPermissionMiddleware from "@/shared/middleware/checkPermission";
import {
  createPackagingController,
  deletePackagingByIdController,
  getPackagingByIdController,
  updatePackagingByIdController,
} from "./packaging.controller";
import {
  getPackagingByIdSchema,
  createPackagingSchema,
  updatePackagingByIdSchema,
  deletePackagingByIdSchema,
} from "./packaging.schema";

export default async function packagingRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["read:packaging:id"]),
        validateResource(getPackagingByIdSchema),
      ],
    },
    getPackagingByIdController
  );

  fastify.post(
    "/",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["create:packaging"]),
        validateResource(createPackagingSchema),
      ],
    },
    createPackagingController
  );

  fastify.patch(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["update:role"]),
        validateResource(updatePackagingByIdSchema),
      ],
    },
    updatePackagingByIdController
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["delete:role"]),
        validateResource(deletePackagingByIdSchema),
      ],
    },
    deletePackagingByIdController
  );
}
