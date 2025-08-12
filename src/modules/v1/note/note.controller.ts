import { FastifyReply, FastifyRequest } from "fastify";
import { CreateNoteType } from "./note.schema";
import { BadRequestError } from "@/shared/error-handler";
import { StatusCodes } from "http-status-codes";

export async function createNoteController(
  req: FastifyRequest<{ Body: CreateNoteType["body"] }>,
  reply: FastifyReply
) {
  const { id } = req.currUser!;
  const { items, type, note } = req.body;

  const transactionItems: {
    packaging_stock_id: string;
    quantity: number;
    signed_quantity: number;
  }[] = [];

  for (let i of items) {
    const packagingStock = await req.packaging_stocks.findById(
      i.packaging_stock_id
    );
    if (!packagingStock) throw new BadRequestError("Mã lưu kho không hợp lệ.");

    if (i.quantity == 0 && (type == "EXPORT" || type == "IMPORT")) continue;

    if (type == "IMPORT") {
      transactionItems.push({
        packaging_stock_id: packagingStock.id,
        quantity: i.quantity,
        signed_quantity: i.quantity,
      });
    } else if (type == "EXPORT") {
      if (packagingStock.quatity < i.quantity) {
        throw new BadRequestError(
          "Số lượng sản không lớn hơn số lượng hện có trong kho."
        );
      }
      transactionItems.push({
        packaging_stock_id: packagingStock.id,
        quantity: i.quantity,
        signed_quantity: -i.quantity,
      });
    } else {
      transactionItems.push({
        packaging_stock_id: packagingStock.id,
        quantity: i.quantity - packagingStock.quatity,
        signed_quantity: i.quantity - packagingStock.quatity,
      });
    }
  }

  const d = await req.transactions.create({
    items: transactionItems,
    type,
    note,
    performed_by: id,
  });

  reply.code(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    statusText: "OK",
    data: {
      message: `Tạo phiếu ${
        type == "IMPORT"
          ? "nhập kho"
          : type == "EXPORT"
          ? "xuất kho"
          : "điều chỉnh"
      } thành công.`,
      // packaging,
    },
  });
}
