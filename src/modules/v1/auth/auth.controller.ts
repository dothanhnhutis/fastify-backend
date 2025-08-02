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
  console.log(await Password.hash("@Abc123123"));
  if (
    !user ||
    !user.password_hash ||
    !(await Password.compare(user.password_hash, password))
  )
    throw new BadRequestError("Email và mật khẩu không hợp lệ.");

  // const session = await req..create({
  //   userId: user.id,
  //   ip: ip || ips[0],
  //   provider: "credential",
  //   userAgentRaw: headers["user-agent"] || "",
  // });

  // const encryptSession = CryptoAES256GCM.encrypt(
  //   session.key,
  //   config.SESSION_SECRET_KEY
  // );

  reply.code(200).send(user);
}
