import { FastifyInstance } from "fastify";
import {
  deleteSessionsByIdController,
  getSessionsController,
} from "./session.controller";
import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";
import { required } from "zod/v4/core/util.cjs";

export default async function sessionRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: [requiredAuthMiddleware],
    },
    getSessionsController
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
      preHandler: [requiredAuthMiddleware],
    },
    deleteSessionsByIdController
  );
}
