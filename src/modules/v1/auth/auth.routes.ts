import { FastifyInstance } from "fastify";
import { signInSchema } from "./auth.schema";
import { signInController } from "./auth.controller";
import validateResource from "@/shared/middleware/validateResource";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/signin",
    {
      preHandler: [validateResource(signInSchema)],
    },
    signInController
  );
}
