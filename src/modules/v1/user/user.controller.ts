import config from "@/shared/config";
import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";

export async function currentUserController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { password_hash, ...currentUser } = req.currUser!;
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      currentUser: currentUser,
    },
  });
}

export async function logoutUserController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  if (req.sessionKey) {
    await req.session.deleteByKey(req.sessionKey);
  }

  reply
    .code(StatusCodes.OK)
    .clearCookie(config.SESSION_KEY_NAME)
    .send({
      statusCode: StatusCodes.OK,
      statusText: "OK",
      data: {
        message: "Đăng xuất thành công",
      },
    });
}
