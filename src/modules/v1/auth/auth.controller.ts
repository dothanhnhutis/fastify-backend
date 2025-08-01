import { FastifyReply, FastifyRequest } from "fastify";
import { SignInBodyType } from "./auth.schema";
import Password from "@/shared/password";
import { BadRequestError } from "@/shared/error-handler";

export async function SignInController(
  req: FastifyRequest<{
    Body: SignInBodyType;
  }>,
  reply: FastifyReply
) {
  const { email, password } = req.body;
  const user = await req.user.findByEmail(email);

  if (
    !user ||
    !user.password_hash ||
    !(await Password.compare(user.password_hash, password))
  )
    throw new BadRequestError("Email và mật khẩu không hợp lệ.");

  reply.code(200).send(user);
}
