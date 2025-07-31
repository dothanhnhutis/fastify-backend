import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import { Pool, PoolConfig } from "pg";
import config from "../config";
import { UserRepo } from "@/db/repositories/user.repo";
export interface PostgresDBOptions extends PoolConfig {}

async function postgresDB(
  fastify: FastifyInstance,
  options: PostgresDBOptions & FastifyPluginOptions
) {
  const pool = new Pool({
    connectionString:
      config.DATABASE_URL ||
      "postgres://admin:secret@localhost:5432/pgdb?schema=publish",
    max: 100,
    ...options,
  });

  pool.on("connect", (client) => {
    fastify.logger.info("database connected.");
  });

  fastify.decorate("pgPool", pool);
  // Khai báo property để Fastify cho phép gán vào request
  fastify.decorateRequest("pg");
  fastify.decorateRequest("user");

  // Mượn connection cho mỗi request
  fastify.addHook("onRequest", async (req) => {
    req.pg = await pool.connect();
    req.user = new UserRepo(req);
  });

  // Trả connection về pool khi response xong
  fastify.addHook("onResponse", async (req) => {
    req.pg?.release();
  });

  // Phòng hờ khi có lỗi
  fastify.addHook("onError", async (req) => {
    req.pg?.release();
  });

  fastify.addHook("onClose", async () => {
    await pool.end();
  });
}

export default fp(postgresDB, {
  name: "postgresDB",
});
