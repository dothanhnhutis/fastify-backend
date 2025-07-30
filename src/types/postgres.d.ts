import { Pool, PoolClient } from "pg";

// Extend Fastify types để include custom logger
declare module "fastify" {
  interface FastifyInstance {
    pgPool: Pool;
  }

  interface FastifyRequest {
    pg: PoolClient | null;
  }
}
