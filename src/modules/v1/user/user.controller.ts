import { StatusCodes } from "http-status-codes";
import { FastifyReply, FastifyRequest } from "fastify";

import config from "@/shared/config";

export async function queryUserController(
  req: FastifyRequest,
  reply: FastifyReply
) {}

export async function createUserController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const newUser = await req.users.create(req.body);
  reply.code(StatusCodes.CREATED).send({
    statusCode: StatusCodes.OK,
    statusText: "CREATED",
    data: {
      message: "Tạo người dùng thành công.",
      newUser,
    },
  });
}

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

export async function userRolesController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      userRole: req.userRoles,
    },
  });
}

export async function logoutUserController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  if (req.sessionId) {
    await req.sessions.delete(req.sessionId);
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
