import { StatusCodes } from "http-status-codes";
import { FastifyReply, FastifyRequest } from "fastify";

import {
  CreateRoleType,
  QueryRoleType,
  UpdateRoleByIdType,
} from "./role.schema";
import { BadRequestError } from "@/shared/error-handler";

export async function createRoleController(
  req: FastifyRequest<{ Body: CreateRoleType["body"] }>,
  reply: FastifyReply
) {
  const role = await req.roles.create(req.body);
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
  const role = await req.roles.findById(req.params.id);
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
  req: FastifyRequest<{
    Querystring: QueryRoleType;
  }>,
  reply: FastifyReply
) {
  const data = await req.roles.query(req.query);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data,
  });
}

export async function updateRoleByIdController(
  req: FastifyRequest<{
    Params: UpdateRoleByIdType["params"];
    Body: UpdateRoleByIdType["body"];
  }>,
  reply: FastifyReply
) {
  const role = await req.roles.findById(req.params.id);
  if (!role) throw new BadRequestError("Vai trò không tồn tại.");

  await req.roles.update(role.id, req.body);

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
  const role = await req.roles.findById(req.params.id);
  if (!role) throw new BadRequestError("Vai trò không tồn tại.");

  await req.roles.delete(role.id);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Xoá vai trò thành công.",
    },
  });
}
