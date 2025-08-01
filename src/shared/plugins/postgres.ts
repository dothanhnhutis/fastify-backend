import fp from "fastify-plugin";
import { Pool, PoolConfig } from "pg";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

import config from "../config";
import { UserRepo } from "@/db/repositories/user.repo";

export interface PostgresDBOptions extends PoolConfig {}

async function postgresDB(
  fastify: FastifyInstance,
  options: PostgresDBOptions & FastifyPluginOptions
) {
  let connected = false;
  const reconnectInterval = 5000;
  let retries = 1;

  const pool = new Pool({
    connectionString:
      config.DATABASE_URL ||
      "postgres://admin:secret@localhost:5432/pgdb?schema=publish",
    max: 100,
    ...options,
  });

  fastify.decorate("pgPool", pool);
  fastify.decorateRequest("pg");
  fastify.decorateRequest("user");

  fastify.addHook("onRoute", async () => {
    while (!connected) {
      try {
        const client = await pool.connect();
        await client.query("SELECT NOW()");
        client.release();
        connected = true;
        fastify.log.info("✅ Database connected successfully");
        break;
      } catch (error) {
        fastify.logger.warn(
          `Database connection failed, retries time: ${retries}`
        );
        retries++;
        await new Promise((resolve) => setTimeout(resolve, reconnectInterval));
      }
    }
  });

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
