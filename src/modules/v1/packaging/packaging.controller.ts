import { StatusCodes } from "http-status-codes";
import { FastifyReply, FastifyRequest } from "fastify";

import {
  CreatePackagingType,
  DeletePackagingByIdType,
  UpdatePackagingByIdType,
} from "./packaging.schema";
import { BadRequestError } from "@/shared/error-handler";

export async function getPackagingByIdController(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const packaging = await req.packaging.findById(req.params.id);
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
  const packaging = await req.packaging.create(req.body);
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
  const packaging = await req.packaging.findById(req.params.id);
  if (!packaging) throw new BadRequestError("Bao bì không tồn tại.");
  await req.packaging.update(packaging.id, req.body);
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
  const packaging = await req.packaging.findById(req.params.id);
  if (!packaging) throw new BadRequestError("Bao bì không tồn tại.");

  await req.warehouse.delete(packaging.id);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Xoá bao bì thành công.",
    },
  });
}
