import { FastifyRequest } from "fastify";
import { QueryConfig, QueryResult } from "pg";
import { StatusCodes } from "http-status-codes";

import { CustomError } from "@/shared/error-handler";
import {
  CreateWarehouseType,
  UpdateWarehouseByIdType,
} from "@/modules/v1/warehouse/warehouse.schema";

export default class WarehouseRepo {
  constructor(private req: FastifyRequest) {}

  async findAll(): Promise<Warehouse[]> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM warehouses;`,
    };
    try {
      const { rows }: QueryResult<Warehouse> =
        await this.req.pg.query<Warehouse>(queryConfig);
      return rows;
    } catch (error: any) {
      throw new CustomError({
        message: `WarehouseRepo.findAll() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async findById(id: string): Promise<Warehouse | null> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM warehouses WHERE id = $1 LIMIT 1`,
      values: [id],
    };
    try {
      const { rows }: QueryResult<Warehouse> =
        await this.req.pg.query<Warehouse>(queryConfig);
      return rows[0] ?? null;
    } catch (error: any) {
      throw new CustomError({
        message: `WarehouseRepo.findById() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async create(data: CreateWarehouseType["body"]): Promise<Warehouse> {
    const queryConfig: QueryConfig = {
      text: `INSERT INTO warehouses (name, address) VALUES ($1::text, $2::text) RETURNING *;`,
      values: [data.name, data.address],
    };
    try {
      await this.req.pg.query("BEGIN");
      const { rows }: QueryResult<Warehouse> =
        await this.req.pg.query<Warehouse>(queryConfig);

      // const { rows: packagings } = await this.req.pg.query({
      //   text: `SELECT * FROM packagings`,
      // });

      // if (packagings.length > 0) {
      //   const values: string[] = [];
      //   const placeholders = packagings
      //     .map((p, i) => {
      //       const baseIndex = i * 2;
      //       values.push(rows[0].id, p.id);
      //       return `($${baseIndex + 1}, $${baseIndex + 2})`;
      //     })
      //     .join(", ");

      //   await this.req.pg.query({
      //     text: `INSERT INTO packaging_stocks (warehouse_id, packaging_id) VALUES ${placeholders}`,
      //     values,
      //   });
      // }

      await this.req.pg.query("COMMIT");
      return rows[0] ?? null;
    } catch (error: unknown) {
      await this.req.pg.query("ROLLBACK");
      throw new CustomError({
        message: `WarehouseRepo.create() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async update(
    id: string,
    data: UpdateWarehouseByIdType["body"]
  ): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      sets.push(`"name" = $${idx++}`);
      values.push(data.name);
    }

    if (data.address !== undefined) {
      sets.push(`"address" = $${idx++}`);
      values.push(data.address);
    }

    if (sets.length === 0) {
      return;
    }

    values.push(id);

    const queryConfig: QueryConfig = {
      text: `UPDATE warehouses SET ${sets.join(
        ", "
      )} WHERE id = $${idx} RETURNING *;`,
      values,
    };
    try {
      await this.req.pg.query(queryConfig);
    } catch (error: unknown) {
      throw new CustomError({
        message: `WarehouseRepo.update() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async delete(id: string): Promise<Warehouse> {
    const queryConfig: QueryConfig = {
      text: `DELETE FROM warehouses WHERE id = $1 RETURNING *;`,
      values: [id],
    };
    try {
      const { rows }: QueryResult<Warehouse> =
        await this.req.pg.query<Warehouse>(queryConfig);
      return rows[0] ?? null;
    } catch (error: unknown) {
      throw new CustomError({
        message: `WarehouseRepo.delete() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }
}
