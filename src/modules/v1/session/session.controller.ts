import { StatusCodes } from "http-status-codes";
import { FastifyReply, FastifyRequest } from "fastify";
import config from "@/shared/config";
import { BadRequestError } from "@/shared/error-handler";

export async function getSessionsController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = req.currUser!;
  const sessions = await req.session.findByUserId(id);

  reply.code(StatusCodes.OK).send({
    statusCodes: StatusCodes.OK,
    statusText: "OK",
    data: {
      sessions,
    },
  });
}

export async function deleteSessionsByIdController(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = req.params;
  const { id: userId } = req.currUser!;

  const key = `${config.SESSION_KEY_NAME}:${userId}:${id}`;
  const session = await req.session.findByKey(key);

  if (!session || session.userId != userId)
    throw new BadRequestError("Phiên không tồn tại");

  if (key == req.sessionKey)
    throw new BadRequestError("Không thể xoá phiên hiện tại");

  await req.session.deleteByKey(key);

  reply.code(StatusCodes.OK).send({
    data: { message: "Xoá phiên thành công" },
  });
}
