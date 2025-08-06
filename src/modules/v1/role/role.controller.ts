import { StatusCodes } from "http-status-codes";
import { FastifyReply, FastifyRequest } from "fastify";

import { CreateRole } from "./role.schema";
import { BadRequestError } from "@/shared/error-handler";

export async function createRoleController(
  req: FastifyRequest<{ Body: CreateRole }>,
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

export async function queryRoleController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  console.log("body", req.body);
  console.log("query", req.query);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      roles: [],
    },
  });
}

export async function updateRoleByIdController(
  req: FastifyRequest<{
    Params: { id: string };
    Body: Partial<{ name: string; permissions: string[] }>;
  }>,
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
