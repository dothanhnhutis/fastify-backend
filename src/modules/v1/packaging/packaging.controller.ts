import { StatusCodes } from "http-status-codes";
import { FastifyReply, FastifyRequest } from "fastify";

import {
  CreatePackagingType,
  DeletePackagingByIdType,
  UpdatePackagingByIdType,
} from "./packaging.schema";
import { BadRequestError } from "@/shared/error-handler";

export async function queryPackagingController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const packagings = await req.packagings.findAll();
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      packagings,
    },
  });
}

export async function getPackagingByIdController(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const packaging = await req.packagings.findById(req.params.id);
  if (!packaging) throw new BadRequestError("Bao bì không tồn tại.");
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      packaging,
    },
  });
}
export async function createPackagingController(
  req: FastifyRequest<{ Body: CreatePackagingType["body"] }>,
  reply: FastifyReply
) {
  const packaging = await req.packagings.create(req.body);
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Tạo bao bì thành công.",
      packaging,
    },
  });
}
export async function updatePackagingByIdController(
  req: FastifyRequest<{
    Params: UpdatePackagingByIdType["params"];
    Body: UpdatePackagingByIdType["body"];
  }>,
  reply: FastifyReply
) {
  const packaging = await req.packagings.findById(req.params.id);
  if (!packaging) throw new BadRequestError("Bao bì không tồn tại.");
  await req.packagings.update(packaging.id, req.body);
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Cập nhật bao bì thành công.",
    },
  });
}
export async function deletePackagingByIdController(
  req: FastifyRequest<{ Params: DeletePackagingByIdType["params"] }>,
  reply: FastifyReply
) {
  const packaging = await req.packagings.findById(req.params.id);
  if (!packaging) throw new BadRequestError("Bao bì không tồn tại.");

  await req.warehouses.delete(packaging.id);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Xoá bao bì thành công.",
    },
  });
}
