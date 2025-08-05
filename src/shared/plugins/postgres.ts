import fp from "fastify-plugin";
import { Pool, PoolClient, PoolConfig } from "pg";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

import config from "../config";
import { UserRepo } from "@/db/repositories/user.repo";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../error-handler";
import { RoleRepo } from "@/db/repositories/role.repo";

export interface PostgresDBOptions extends PoolConfig {}

async function postgresDB(
  fastify: FastifyInstance,
  options: PostgresDBOptions & FastifyPluginOptions
) {
  let isConnected = false,
    reconnectAttempts = 0;
  const reconnectInterval = 5000;

  const pool = new Pool({
    connectionString:
      config.DATABASE_URL ||
      "postgres://admin:secret@localhost:5432/pgdb?schema=publish",
    max: 100,
    idleTimeoutMillis: 30_000,
    ...options,
  });

  fastify.decorate("pgPool", pool);
  fastify.decorateRequest("pg");
  fastify.decorateRequest("user");

  // Handle pool errors
  pool.on("error", (err) => {
    fastify.logger.error(err, "PostgreSQL - Pool error");
    isConnected = false;

    // Don't reconnect immediately if we're already reconnecting
    if (reconnectAttempts === 0) {
      reconnect();
    }
  });

  // Handle client errors
  pool.on("connect", (client: PoolClient) => {
    client.on("error", (err) => {
      fastify.logger.error(err, "PostgreSQL - client error");
    });
  });

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function reconnect() {
    while (!isConnected) {
      fastify.logger.warn(
        `PostgreSQL - Attempting to reconnect to database...`
      );
      try {
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        isConnected = true;
        reconnectAttempts = 0;
        fastify.logger.info("PostgreSQL - Database connected successfully");
        break;
      } catch (error) {
        reconnectAttempts++;
        isConnected = false;
        fastify.logger.warn(
          error,
          `PostgreSQL - Reconnection attempt ${reconnectAttempts} failed`
        );
        await sleep(reconnectInterval);
      }
    }
  }

  fastify.addHook("onReady", async () => {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      isConnected = true;
      fastify.logger.info("PostgreSQL - Database connected successfully");
    } catch (error) {
      isConnected = false;
      fastify.logger.error(
        "PostgreSQL - Database temporarily unavailable. Please try again in a few moments"
      );
      throw new CustomError({
        message:
          "PostgreSQL - Database temporarily unavailable. Please try again in a few moments",
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        statusText: "SERVICE_UNAVAILABLE",
      });
    }
  });

  // Mượn connection cho mỗi request
  fastify.addHook("onRequest", async (req, reply) => {
    if (!isConnected)
      throw new CustomError({
        message:
          "PostgreSQL - Database temporarily unavailable. Please try again in a few moments",
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        statusText: "SERVICE_UNAVAILABLE",
      });
    try {
      req.pg = await pool.connect();
    } catch (err) {
      fastify.logger.error(err, "PostgreSQL - onRequest error");
      isConnected = false;

      // Don't reconnect immediately if we're already reconnecting
      if (reconnectAttempts === 0) {
        reconnect();
      }
    } finally {
      req.user = new UserRepo(req);
      req.role = new RoleRepo(req);
    }
  });

  fastify.addHook("onResponse", async (req) => {
    req.pg?.release();
  });

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
