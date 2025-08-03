import { FastifyReply, FastifyRequest } from "fastify";
import { SignInBodyType } from "./auth.schema";
import Password from "@/shared/password";
import { BadRequestError } from "@/shared/error-handler";
import CryptoAES256GCM from "@/shared/crypto";
import config from "@/shared/config";
import { StatusCodes } from "http-status-codes";

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

  const session = await req.session.create({
    userId: user.id,
    ip: req.ip || req.ips?.[0] || "",
    provider: "credential",
    userAgentRaw: req.headers["user-agent"] || "",
  });

  const encryptSession = CryptoAES256GCM.encrypt(session.key);

  reply
    .code(StatusCodes.OK)
    .setCookie(config.SESSION_KEY_NAME, encryptSession, {
      ...session.cookie,
    })
    .send(user);
}
