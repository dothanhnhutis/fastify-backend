import { StatusCodes } from "http-status-codes";
import { FastifyReply, FastifyRequest } from "fastify";

import { BadRequestError } from "@/shared/error-handler";
import {
  CreateWarehouseType,
  DeleteWarehouseByIdType,
  GetWarehouseByIdType,
  UpdateWarehouseByIdType,
} from "./warehouse.schema";

export async function queryWarehouseController(
  req: FastifyRequest<{ Params: GetWarehouseByIdType["params"] }>,
  reply: FastifyReply
) {
  const warehouse = await req.warehouses.findAll();
  if (!warehouse) throw new BadRequestError("Nhà kho không tồn tại.");
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      warehouse,
    },
  });
}

export async function getWarehouseByIdController(
  req: FastifyRequest<{ Params: GetWarehouseByIdType["params"] }>,
  reply: FastifyReply
) {
  const warehouse = await req.warehouses.findById(req.params.id);
  if (!warehouse) throw new BadRequestError("Nhà kho không tồn tại.");
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      warehouse,
    },
  });
}

export async function createWarehouseController(
  req: FastifyRequest<{
    Body: CreateWarehouseType["body"];
  }>,
  reply: FastifyReply
) {
  const role = await req.warehouses.create(req.body);
  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Tạo nhà kho thành công.",
      role,
    },
  });
}

export async function updateWarehouseByIdController(
  req: FastifyRequest<{
    Params: UpdateWarehouseByIdType["params"];
    Body: UpdateWarehouseByIdType["body"];
  }>,
  reply: FastifyReply
) {
  const warehouse = await req.warehouses.findById(req.params.id);
  if (!warehouse) throw new BadRequestError("Nhà kho không tồn tại.");

  await req.warehouses.update(warehouse.id, req.body);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Cập nhật nhà kho thành công.",
    },
  });
}

export async function deleteWarehouseByIdController(
  req: FastifyRequest<{ Params: DeleteWarehouseByIdType["params"] }>,
  reply: FastifyReply
) {
  const warehouse = await req.warehouses.findById(req.params.id);
  if (!warehouse) throw new BadRequestError("Nhà kho không tồn tại.");

  await req.warehouses.delete(warehouse.id);

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: "Xoá nhà kho thành công.",
    },
  });
}
