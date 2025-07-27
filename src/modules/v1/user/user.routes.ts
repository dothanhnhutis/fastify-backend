import { FastifyInstance, FastifyRequest } from "fastify";
import { LoginBodyType, loginSchema } from "./user.schema";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/me",
    {
      schema: loginSchema,
    },
    async (
      req: FastifyRequest<{
        Body: LoginBodyType;
      }>,
      reply
    ) => {
      const { email, password } = req.body;

      reply.code(200).send({
        email,
        password,
      });
    }
  );
}
