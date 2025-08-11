import { FastifyRequest } from "fastify";
import { QueryConfig, QueryResult } from "pg";
import { StatusCodes } from "http-status-codes";

import { CustomError } from "@/shared/error-handler";

export default class PackagingRepo {
  constructor(private req: FastifyRequest) {}

  async findById(id: string): Promise<Packaging | null> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM packagings WHERE id = $1 LIMIT 1`,
      values: [id],
    };
    try {
      const { rows }: QueryResult<Packaging> =
        await this.req.pg.query<Packaging>(queryConfig);
      return rows[0] ?? null;
    } catch (error: any) {
      throw new CustomError({
        message: `PackagingRepo.findById() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async create(data: { name: string }): Promise<Packaging> {
    const queryConfig: QueryConfig = {
      text: `INSERT INTO packagings (name) VALUES ($1::text) RETURNING *;`,
      values: [data.name],
    };
    try {
      await this.req.pg.query("BEGIN");
      const { rows }: QueryResult<Packaging> =
        await this.req.pg.query<Packaging>(queryConfig);

      const { rows: warehouses } = await this.req.pg.query<Warehouse>({
        text: "SELECT * FROM warehouses",
      });

      // Tạo packaging_stocks
      if (warehouses.length > 0) {
        const values: string[] = [];
        const placeholders = warehouses
          .map((w, i) => {
            const baseIndex = i * 2;
            values.push(rows[0].id, w.id);
            return `($${baseIndex + 1}, $${baseIndex + 2})`;
          })
          .join(", ");
        await this.req.pg.query({
          text: `INSERT INTO packaging_stocks (packaging_id, warehouse_id) VALUES ${placeholders}`,
          values,
        });
      }

      await this.req.pg.query("COMMIT");
      return rows[0] ?? null;
    } catch (error: unknown) {
      await this.req.pg.query("ROLLBACK");
      throw new CustomError({
        message: `PackagingRepo.create() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async update(id: string, data: Partial<{ name: string }>): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      sets.push(`"name" = $${idx++}`);
      values.push(data.name);
    }

    if (sets.length === 0) {
      return;
    }

    values.push(id);

    const queryConfig: QueryConfig = {
      text: `UPDATE packagings SET ${sets.join(
        ", "
      )} WHERE id = $${idx} RETURNING *;`,
      values,
    };
    try {
      await this.req.pg.query(queryConfig);
    } catch (error: unknown) {
      throw new CustomError({
        message: `PackagingRepo.update() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async delete(id: string): Promise<Packaging> {
    const queryConfig: QueryConfig = {
      text: `DELETE FROM packagings WHERE id = $1 RETURNING *;`,
      values: [id],
    };
    try {
      const { rows }: QueryResult<Packaging> =
        await this.req.pg.query<Packaging>(queryConfig);
      return rows[0] ?? null;
    } catch (error: unknown) {
      throw new CustomError({
        message: `PackagingRepo.delete() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }
}
