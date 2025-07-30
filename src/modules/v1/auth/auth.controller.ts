import { FastifyReply, FastifyRequest } from "fastify";
import { SignInBodyType } from "./auth.schema";

export async function SignInController(
  req: FastifyRequest<{
    Body: SignInBodyType;
  }>,
  reply: FastifyReply
) {
  const { email, password } = req.body;

  reply.code(200).send({
    email,
    password,
  });
}
