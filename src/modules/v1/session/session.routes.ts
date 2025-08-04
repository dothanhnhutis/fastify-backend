import { FastifyInstance } from "fastify";
import { getSessionsController } from "./session.controller";
import requiredAuthMiddleware from "@/shared/middleware/requiredAuth";

const sessionSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "string" },
      provider: { type: "string", enum: ["google", "credential"] },
      userId: { type: "string" },
      cookie: {
        type: "object",
        properties: {
          maxAge: { type: "number" },
          expires: { type: "string", format: "date-time" },
          httpOnly: { type: "boolean" },
          path: { type: "string" },
          domain: { type: "string" },
          secure: { type: "boolean" },
          sameSite: { type: ["boolean", "string"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
        },
        additionalProperties: false,
      },
      ip: { type: "string" },

      lastAccess: { type: "string", format: "date-time" },
      createAt: { type: "string", format: "date-time" },
    },
  },
};

export default async function sessionRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: [requiredAuthMiddleware],
    },
    getSessionsController
  );
}
