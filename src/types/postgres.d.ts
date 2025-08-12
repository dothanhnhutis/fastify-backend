import { Pool, PoolClient } from "pg";

import RoleRepo from "@/db/repositories/role.repo";
import UserRepo from "@/db/repositories/user.repo";
import WarehouseRepo from "@/db/repositories/warehouse.repo";
import PackagingRepo from "@/db/repositories/packaging.repo";
import PackagingStockRepo from "@/db/repositories/packaging_stock.repo";
import TransactionRepo from "@/db/repositories/transaction.repo";

// Extend Fastify types để include custom logger
declare module "fastify" {
  interface FastifyInstance {
    pgPool: Pool;
  }

  interface FastifyRequest {
    pg: PoolClient;
    users: UserRepo;
    roles: RoleRepo;
    warehouses: WarehouseRepo;
    packagings: PackagingRepo;
    packaging_stocks: PackagingStockRepo;
    transactions: TransactionRepo;
  }
}
