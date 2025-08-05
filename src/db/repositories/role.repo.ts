import {
  CreateRoleBodyType,
  UpdateRoleBodyType,
} from "@/modules/v1/role/role.schema";
import { CustomError } from "@/shared/error-handler";
import { FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { QueryConfig, QueryResult } from "pg";
import { z } from "zod/v4";

export class RoleRepo {
  constructor(private req: FastifyRequest) {}

  async findById(id: string): Promise<Role | null> {
    if (!z.uuid().safeParse(id).success) return null;

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

  async create({ name, permissions }: CreateRoleBodyType): Promise<Role> {
    const queryConfig: QueryConfig = {
      text: `INSERT INTO roles (name, permissions) VALUES ($1,  $2::text[]) RETURNING *;`,
      values: [name, permissions],
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

  async update(id: string, payload: UpdateRoleBodyType): Promise<Role> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.name !== undefined) {
      sets.push(`"name" = $${idx++}`);
      values.push(payload.name);
    }
    if (payload.permissions !== undefined) {
      sets.push(`"permissions" = $${idx++}::text[]`);
      values.push(payload.permissions);
    }

    if (sets.length === 0) {
      return (await this.findById(id))!;
    }

    values.push(id);

    const queryConfig: QueryConfig = {
      text: `UPDATE roles SET ${sets.join(
        ", "
      )} WHERE id = $${idx} RETURNING *;`,
      values,
    };
    console.log(queryConfig);

    try {
      const { rows }: QueryResult<Role> = await this.req.pg.query(queryConfig);
      return rows[0] ?? null;
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
