import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";
import { FastifyInstance } from "fastify";
import { createNoteController } from "./note.controller";
import validateResource from "@/shared/middleware/validateResource";
import { createNoteSchema } from "./note.schema";

export default async function packagingRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [
        requiredAuthMiddleware,
        // checkPermissionMiddleware(["create:packaging"]),
        validateResource(createNoteSchema),
      ],
    },
    createNoteController
  );
}
