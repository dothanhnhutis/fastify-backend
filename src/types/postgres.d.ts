import RoleRepo from "@/db/repositories/role.repo";
import UserRepo from "@/db/repositories/user.repo";
import WarehouseRepo from "@/db/repositories/warehouse.repo";
import PackagingRepo from "@/db/repositories/packaging.repo";
import { Pool, PoolClient } from "pg";

// Extend Fastify types để include custom logger
declare module "fastify" {
  interface FastifyInstance {
    pgPool: Pool;
  }

  interface FastifyRequest {
    pg: PoolClient;
    user: UserRepo;
    role: RoleRepo;
    warehouse: WarehouseRepo;
    packaging: PackagingRepo;
  }
}
