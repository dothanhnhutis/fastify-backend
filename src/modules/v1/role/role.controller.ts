import { FastifyReply, FastifyRequest } from "fastify";
import { CreateRoleBodyType, UpdateRoleBodyType } from "./role.schema";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/shared/error-handler";

export async function createRoleController(
  req: FastifyRequest<{ Body: CreateRoleBodyType }>,
  reply: FastifyReply
) {
  const role = await req.role.create(req.body);
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Tạo vai trò thành công.",
      role,
    },
  });
}

export async function findRoleByIdController(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const role = await req.role.findById(req.params.id);
  if (!role) throw new BadRequestError("Vai trò không tồn tại.");

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      role,
    },
  });
}

export async function updateRoleByIdController(
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateRoleBodyType }>,
  reply: FastifyReply
) {
  const role = await req.role.findById(req.params.id);
  if (!role) throw new BadRequestError("Vai trò không tồn tại.");

  await req.role.update(role.id, req.body);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Cập nhật vai trò thành công.",
    },
  });
}

export async function deleteRoleByIdController(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const role = await req.role.findById(req.params.id);
  if (!role) throw new BadRequestError("Vai trò không tồn tại.");

  await req.role.delete(role.id);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Xoá vai trò thành công.",
    },
  });
}
