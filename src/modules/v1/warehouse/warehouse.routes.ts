import { FastifyInstance } from "fastify";
import {
  createWarehouseController,
  deleteWarehouseByIdController,
  getWarehouseByIdController,
  queryWarehouseController,
  updateWarehouseByIdController,
} from "./warehouse.controller";
import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";
import checkPermissionMiddleware from "@/shared/middleware/checkPermission";
import validateResource from "@/shared/middleware/validateResource";
import {
  createWarehouseSchema,
  deleteWarehouseByIdSchema,
  getWarehouseByIdSchema,
  updateWarehouseByIdSchema,
} from "./warehouse.schema";

export default async function warehouseRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["read:warehouse:*"]),
        // validateResource(getWarehouseByIdSchema),
      ],
    },
    queryWarehouseController
  );
  fastify.get(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["read:warehouse:*"]),
        validateResource(getWarehouseByIdSchema),
      ],
    },
    getWarehouseByIdController
  );
  fastify.post(
    "/",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["read:warehouse"]),
        validateResource(createWarehouseSchema),
      ],
    },
    createWarehouseController
  );
  fastify.patch(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["update:warehouse"]),
        validateResource(updateWarehouseByIdSchema),
      ],
    },
    updateWarehouseByIdController
  );
  fastify.delete(
    "/:id",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["delete:warehouse"]),
        validateResource(deleteWarehouseByIdSchema),
      ],
    },
    deleteWarehouseByIdController
  );
}
