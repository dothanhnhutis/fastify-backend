import { FastifyRequest } from "fastify";
import { QueryConfig, QueryResult } from "pg";
import { StatusCodes } from "http-status-codes";

import { CustomError } from "@/shared/error-handler";
import {
  CreateRole,
  QueryRole,
  UpdateRole,
} from "@/modules/v1/role/role.schema";

export class RoleRepo {
  constructor(private req: FastifyRequest) {}

  async query(query: QueryRole) {
    let text: string = `SELECT * FROM roles`;
    const value: any[] = [];
    let where: string[] = [];
    let idx = 1;

    if (query.name != undefined) {
      where.push(`name ILIKE '%${idx}%'`);
      value.push(query.name);
      idx++;
    }

    if (query.permissions != undefined) {
      where.push(`permissions IN (${query.permissions.join(", ")})`);
      value.push(query.permissions);
      idx++;
    }

    if (query.desciption != undefined) {
      where.push(`desciption ILIKE '%${idx}%'`);
      value.push(query.desciption);
      idx++;
    }

    if (query.sort != undefined) {
    }

    if (query.limit != undefined && query.page) {
    }

    const queryConfig: QueryConfig = {
      text: `SELECT * FROM roles WHERE id = $1 LIMIT 1`,
      values: [id],
    };
  }

  async findById(id: string): Promise<Role | null> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM roles WHERE id = $1 LIMIT 1`,
      values: [id],
    };
    try {
      const { rows }: QueryResult<Role> = await this.req.pg.query(queryConfig);
      return rows[0] ?? null;
    } catch (error: any) {
      throw new CustomError({
        message: `RoleRepo.findById() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async create(data: CreateRole): Promise<Role> {
    const columns = ["name", "permissions"];
    const values = [data.name, data.permissions];
    const placeholders = ["$1::text", "$2::text[]"];
    let idx = values.length;

    if (data.description !== undefined) {
      idx++;
      columns.push("description");
      values.push(data.description);
      placeholders.push(`$${idx}::text`);
    }

    const queryConfig: QueryConfig = {
      text: `INSERT INTO roles (${columns.join(
        ", "
      )}) VALUES (${placeholders.join(", ")}) RETURNING *;`,
      values,
    };
    try {
      const { rows }: QueryResult<Role> = await this.req.pg.query(queryConfig);
      return rows[0] ?? null;
    } catch (error: unknown) {
      throw new CustomError({
        message: `RoleRepo.create() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async update(id: string, data: UpdateRole): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      sets.push(`"name" = $${idx++}`);
      values.push(data.name);
    }
    if (data.permissions !== undefined) {
      sets.push(`"permissions" = $${idx++}::text[]`);
      values.push(data.permissions);
    }
    if (data.description !== undefined) {
      sets.push(`"description" = $${idx++}::text[]`);
      values.push(data.description);
    }

    if (sets.length === 0) {
      return;
    }

    values.push(id);

    const queryConfig: QueryConfig = {
      text: `UPDATE roles SET ${sets.join(
        ", "
      )} WHERE id = $${idx} RETURNING *;`,
      values,
    };

    try {
      await this.req.pg.query(queryConfig);
    } catch (error: unknown) {
      throw new CustomError({
        message: `RoleRepo.update() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async delete(id: string): Promise<Role> {
    const queryConfig: QueryConfig = {
      text: `DELETE FROM roles WHERE id = $1 RETURNING *;`,
      values: [id],
    };
    try {
      const { rows }: QueryResult<Role> = await this.req.pg.query(queryConfig);
      return rows[0] ?? null;
    } catch (error: unknown) {
      /**
       * TODO: bắt sự kiện role đã rán cho cho user
       */

      throw new CustomError({
        message: `RoleRepo.delete() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }
}
