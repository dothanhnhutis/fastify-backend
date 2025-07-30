import { FastifyReply, FastifyRequest } from "fastify";
import { SignInBodyType } from "./auth.schema";

export async function SignInController(
  req: FastifyRequest<{
    Body: SignInBodyType;
  }>,
  reply: FastifyReply
) {
  const { email, password } = req.body;

  const dbRes = await req.pg?.query(`SELECT *
FROM "User"
WHERE email = '${email}';`);
  console.log(dbRes);

  reply.code(200).send({
    email,
    password,
  });
}
