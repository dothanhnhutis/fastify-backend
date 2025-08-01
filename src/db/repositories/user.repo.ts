import { FastifyInstance, FastifyRequest } from "fastify";
import { PoolClient, QueryConfig, QueryResult } from "pg";

export type User = {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  created_at: Date;
  updated_at: Date;
};

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
}
