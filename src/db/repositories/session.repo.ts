export type User = {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  created_at: Date;
  updated_at: Date;
};

export class UserRepo {
  constructor(private client: PoolClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const queryConfig: QueryConfig = {
      text: `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
      values: [email],
    };
    const { rows }: QueryResult<User> = await this.client.query(queryConfig);
    return rows[0] ?? null;
  }
}
