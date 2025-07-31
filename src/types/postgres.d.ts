import { UserRepo } from "@/db/repositories/user.repo";
import { Pool, PoolClient } from "pg";

// Extend Fastify types để include custom logger
declare module "fastify" {
  interface FastifyInstance {
    pgPool: Pool;
  }

  interface FastifyRequest {
    pg: PoolClient;
    user: UserRepo;
  }
}
