import { FastifyRequest } from "fastify";
import { QueryConfig, QueryResult } from "pg";

export default class UserRepo {
  constructor(private req: FastifyRequest) {}

  async findByEmail(email: string): Promise<User | null> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM users WHERE email = $1 LIMIT 1;`,
      values: [email],
    };

    try {
      const { rows } = await this.req.pg.query<User>(queryConfig);
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
      text: `SELECT * FROM users WHERE id = $1 LIMIT 1`,
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

  async findRoles(userId: string): Promise<Role[]> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM roles WHERE id IN ( SELECT role_id FROM user_roles WHERE user_id = $1);`,
      values: [userId],
    };
    try {
      const { rows }: QueryResult<Role> = await this.req.pg.query(queryConfig);
      return rows ?? null;
    } catch (err: unknown) {
      this.req.logger.error(
        { metadata: { query: queryConfig } },
        `UserRepo.findRoles() method error: ${err}`
      );
      return [];
    }
  }

  async create(data: { email: string }) {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM roles WHERE id IN (SELECT role_id FROM user_roles WHERE user_id = $1);`,
      values: [userId],
    };
    try {
      const { rows }: QueryResult<Role> = await this.req.pg.query(queryConfig);
      return rows ?? null;
    } catch (err: unknown) {
      this.req.logger.error(
        { metadata: { query: queryConfig } },
        `UserRepo.findRoles() method error: ${err}`
      );
      return [];
    }
  }
}
