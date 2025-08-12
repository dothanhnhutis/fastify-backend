import { FastifyRequest } from "fastify";
import { QueryConfig, QueryResult } from "pg";
import { StatusCodes } from "http-status-codes";

import { CustomError } from "@/shared/error-handler";
import { CreateNoteType } from "@/modules/v1/note/note.schema";

type CreateNoteRepoType = {
  type: "IMPORT" | "EXPORT" | "ADJUST";
  note: string;
  items: {
    packaging_stock_id: string;
    quantity: number;
    signed_quantity: number;
  }[];
  performed_by: string;
};

export default class TranasctionRepo {
  constructor(private req: FastifyRequest) {}

  async create(data: CreateNoteRepoType) {
    const queryConfig: QueryConfig = {
      text: `INSERT INTO packaging_transactions (type,note) VALUES ($1::transaction_type, $2::text) RETURNING *;`,
      values: [data.type, data.note],
    };
    try {
      await this.req.pg.query("BEGIN");
      const { rows: transactionRow }: QueryResult<Omit<Transaction, "items">> =
        await this.req.pg.query<Omit<Transaction, "items">>(queryConfig);

      const values: any[] = [];
      const placeholders = data.items
        .map(async (item, i) => {
          const baseIndex = i * 4;

          values.push(
            item.packaging_stock_id,
            transactionRow[0].id,
            item.quantity,
            item.signed_quantity
          );
          return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
            baseIndex + 4
          })`;
        })
        .join(", ");

      const { rows: transactionItemRows } =
        await this.req.pg.query<TransactionItem>(
          `INSERT INTO packaging_transaction_items (packing_stock_id, packaging_transaction_id, quantity, signed_quantity) VALUES ${placeholders} RETURNING *`
        );

      const result = { ...transactionRow[0], items: transactionItemRows };

      await this.req.pg.query({
        text: "INSERT INTO packaging_transaction_audits (action_type,new_data) VALUES ($1::action_type,$2::json)",
        values: ["CREATE", result],
      });

      await this.req.pg.query("COMMIT");

      return result;
    } catch (error: unknown) {
      await this.req.pg.query("ROLLBACK");
      throw new CustomError({
        message: `NoteRepo.create() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }
}
