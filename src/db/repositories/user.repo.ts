import { FastifyRequest } from "fastify";
import { QueryConfig, QueryResult } from "pg";

export class UserRepo {
  constructor(private req: FastifyRequest) {}

  async findByEmail(email: string): Promise<User | null> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
      values: [email],
    };
    try {
      const { rows }: QueryResult<User> = await this.req.pg.query(queryConfig);
      return rows[0] ?? null;
    } catch (err: unknown) {
      this.req.logger.error(
        { metadata: { query: queryConfig } },
        `UserRepo.findByEmail() method error: ${err}`
      );
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM "User" WHERE id = $1 LIMIT 1`,
      values: [id],
    };
    try {
      const { rows }: QueryResult<User> = await this.req.pg.query(queryConfig);
      return rows[0] ?? null;
    } catch (err: unknown) {
      this.req.logger.error(
        { metadata: { query: queryConfig } },
        `UserRepo.findById() method error: ${err}`
      );
      return null;
    }
  }
}
