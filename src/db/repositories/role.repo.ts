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

  async query(query: QueryRole): Promise<{
    roles: Role[];
    metadata: Metadata;
  }> {
    let queryString = ["SELECT * FROM roles"];
    let queryCount = "SELECT count(*) FROM roles";
    const values: any[] = [];
    let where: string[] = [];
    let idx = 1;

    if (query.name != undefined) {
      where.push(`name ILIKE '%' || $${idx++}::text || '%'`);
      values.push(query.name);
    }

    if (query.permissions != undefined) {
      where.push(`permissions @> $${idx++}::text[]`);
      values.push(query.permissions);
    }

    if (query.description != undefined) {
      where.push(`description ILIKE '%' || $${idx++}::text || '%'`);
      values.push(query.description);
    }

    if (where.length > 0) {
      queryString.push(`WHERE ${where.join(" AND ")}`);
      queryCount += `WHERE ${where.join(" AND ")}`;
    }

    const fieldAllow = ["name", "permissions", "permissions"];

    if (query.sorts != undefined) {
      queryString.push(
        `ORDER BY ${query.sorts
          .filter((sort) => fieldAllow.includes(sort.field))
          .map((sort) => `${sort.field} ${sort.direction.toUpperCase()}`)
          .join(", ")}`
      );
    }

    if (query.page != undefined) {
      const limit = query.limit ?? 10;
      const offset = (query.page - 1) * limit;
      queryString.push(`LIMIT $${idx++}::int OFFSET $${idx}::int`);
      values.push(limit, offset);
    }

    const queryConfig: QueryConfig = {
      text: queryString.join(" "),
      values,
    };

    try {
      const { rows: roles } = await this.req.pg.query<Role>(queryConfig);
      const { rows } = await this.req.pg.query<{ count: string }>({
        text: queryCount,
      });
      const totalItem = parseInt(rows[0].count);
      const limit = query.limit ?? totalItem;
      const totalPage = Math.ceil(totalItem / limit);
      const page = query.page ?? 1;

      return {
        roles,
        metadata: {
          totalItem,
          totalPage,
          hasNextPage: query.page ?? 1 < totalPage,
          limit,
          itemStart: (page - 1) * limit + 1,
          itemEnd: Math.min(page * limit, totalItem),
        },
      };
    } catch (error: any) {
      throw new CustomError({
        message: `RoleRepo.query() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
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
