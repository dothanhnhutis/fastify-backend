// import fp from "fastify-plugin";
// import { Pool, PoolConfig } from "pg";
// import { FastifyInstance, FastifyPluginOptions } from "fastify";

// import config from "../config";
// import { UserRepo } from "@/db/repositories/user.repo";

// export interface PostgresDBOptions extends PoolConfig {}

// async function postgresDB(
//   fastify: FastifyInstance,
//   options: PostgresDBOptions & FastifyPluginOptions
// ) {
//   let isConnecting = false,
//     isConnected = false;
//   const reconnectInterval = 5000;
//   let retries = 1;

//   const pool = new Pool({
//     connectionString:
//       config.DATABASE_URL ||
//       "postgres://admin:secret@localhost:5432/pgdb?schema=publish",
//     max: 100,

//     ...options,
//   });

//   fastify.decorate("pgPool", pool);
//   fastify.decorateRequest("pg");
//   fastify.decorateRequest("user");

//   // pool.on("error", (err, client) => {
//   //   if (err) {
//   //     console.log("pool onError");
//   //   }
//   // });

//   // pool.on("connect", () => {
//   //   console.log("pool onConnect");
//   // });

//   // function sleep(ms: number) {
//   //   return new Promise((resolve) => setTimeout(resolve, ms));
//   // }

//   // async function connect() {
//   //   if (isConnecting) return;
//   //   isConnecting = true;

//   //   try {
//   //     const client = await pool.connect();
//   //     await client.query("SELECT NOW()");
//   //     client.release();

//   //     isConnecting = false;
//   //     isConnected = true;
//   //     retries = 1;
//   //     fastify.logger.info("✅ Database connected successfully");
//   //   } catch (error) {
//   //     isConnecting = false;
//   //     throw error;
//   //   }
//   // }

//   // async function reconnect() {
//   //   while (!isConnected) {
//   //     try {
//   //       fastify.logger.info("⏳ Trying to reconnect to Redis...");
//   //       await connect();
//   //     } catch (err) {
//   //       fastify.logger.error(
//   //         `Reconnect attempt failed. Retrying in ${
//   //           reconnectInterval / 1000
//   //         }s...`
//   //       );
//   //       await sleep(reconnectInterval);
//   //     }
//   //   }
//   // }

//   // async function reconnect1() {
//   //   let retries = 5;
//   //   while (retries > 0) {
//   //     try {
//   //       const client = await pool.connect();
//   //       await client.query("SELECT NOW()");
//   //       client.release();

//   //       console.log("✅ Database connected successfully");
//   //       break;
//   //     } catch (error) {
//   //       console.log(`❌ Connect Database error:`, error);
//   //       if (retries == 0) {
//   //         break;
//   //       }

//   //       console.log(`retries time:`, retries);
//   //       retries--;
//   //       await sleep(5000);
//   //     }
//   //   }
//   // }

//   fastify.addHook("onReady", async () => {
//     try {
//       const client = await pool.connect();
//       await client.query("SELECT NOW()");
//       client.release();

//       console.log("✅ Database connected successfully");
//     } catch (error) {
//       console.log(`❌ Connect Database error:`, error);
//       await reconnect1();
//     }
//   });

//   // Mượn connection cho mỗi request
//   fastify.addHook("onRequest", async (req) => {
//     req.pg = await pool.connect();
//     req.user = new UserRepo(req);
//   });

//   fastify.addHook("onResponse", async (req) => {
//     req.pg?.release();
//   });

//   fastify.addHook("onError", async (req) => {
//     console.log("postgres onError");
//     req.pg?.release();
//   });

//   fastify.addHook("onClose", async () => {
//     await pool.end();
//   });
// }

// export default fp(postgresDB, {
//   name: "postgresDB",
// });

import fp from "fastify-plugin";
import { Pool, PoolConfig, PoolClient } from "pg";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

import config from "../config";
import { UserRepo } from "@/db/repositories/user.repo";

export interface PostgresDBOptions extends PoolConfig {}

async function postgresDB(
  fastify: FastifyInstance,
  options: PostgresDBOptions & FastifyPluginOptions
) {
  let pool: Pool;
  let isConnected = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  const reconnectDelay = 5000; // 5 seconds

  const createPool = () => {
    return new Pool({
      connectionString:
        config.DATABASE_URL ||
        "postgres://admin:secret@localhost:5432/pgdb?schema=publish",
      max: 100,
      // Connection timeout
      connectionTimeoutMillis: 10000,
      // Idle timeout - close connections after 30 seconds of inactivity
      idleTimeoutMillis: 30000,
      // Query timeout
      query_timeout: 30000,
      // Keep alive settings
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      ...options,
    });
  };

  const testConnection = async (testPool: Pool): Promise<boolean> => {
    try {
      const client = await testPool.connect();
      await client.query("SELECT NOW()");
      client.release();
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  };

  const reconnect = async (): Promise<void> => {
    console.log(
      `🔄 Attempting to reconnect to database... (attempt ${
        reconnectAttempts + 1
      }/${maxReconnectAttempts})`
    );

    try {
      // Close existing pool if it exists
      if (pool) {
        await pool.end();
      }

      // Create new pool
      pool = createPool();

      // Test the connection
      const connected = await testConnection(pool);

      if (connected) {
        isConnected = true;
        reconnectAttempts = 0;
        console.log("✅ Database reconnected successfully");

        // Re-decorate fastify with new pool
        fastify.decorate("pgPool", pool);

        // Setup error handlers for the new pool
        setupPoolErrorHandlers();
      } else {
        throw new Error("Connection test failed");
      }
    } catch (error) {
      reconnectAttempts++;
      isConnected = false;

      console.error(
        `❌ Reconnection attempt ${reconnectAttempts} failed:`,
        error
      );

      if (reconnectAttempts < maxReconnectAttempts) {
        console.log(`⏱️  Retrying in ${reconnectDelay / 1000} seconds...`);
        setTimeout(reconnect, reconnectDelay);
      } else {
        console.error(
          "❌ Max reconnection attempts reached. Database unavailable."
        );
        // You might want to gracefully shutdown the server or trigger an alert here
        process.exit(1);
      }
    }
  };

  const setupPoolErrorHandlers = () => {
    // Handle pool errors
    pool.on("error", (err) => {
      console.error("❌ PostgreSQL pool error:", err);
      isConnected = false;

      // Don't reconnect immediately if we're already reconnecting
      if (reconnectAttempts === 0) {
        reconnect();
      }
    });

    // Handle client errors
    pool.on("connect", (client: PoolClient) => {
      client.on("error", (err) => {
        console.error("❌ PostgreSQL client error:", err);
      });
    });
  };

  // Initial pool creation
  pool = createPool();

  fastify.decorate("pgPool", pool);
  fastify.decorateRequest("pg");
  fastify.decorateRequest("user");

  // Setup initial error handlers
  setupPoolErrorHandlers();

  fastify.addHook("onReady", async () => {
    try {
      const connected = await testConnection(pool);
      if (connected) {
        isConnected = true;
        console.log("✅ Database connected successfully");
      } else {
        throw new Error("Initial connection test failed");
      }
    } catch (error) {
      console.error(`❌ Connect Database error:`, error);
      isConnected = false;
      await reconnect();
    }
  });

  // Enhanced onRequest hook with connection checking
  fastify.addHook("onRequest", async (req, reply) => {
    try {
      // Check if we have a healthy connection
      if (!isConnected) {
        reply.code(503).send({
          error: "Database temporarily unavailable",
          message: "Please try again in a few moments",
        });
        return;
      }

      req.pg = await pool.connect();
      req.user = new UserRepo(req);
    } catch (error) {
      console.error("❌ Error getting database connection:", error);

      // Trigger reconnection if not already in progress
      if (reconnectAttempts === 0) {
        isConnected = false;
        reconnect();
      }

      reply.code(503).send({
        error: "Database connection failed",
        message: "Please try again in a few moments",
      });
    }
  });

  fastify.addHook("onResponse", async (req) => {
    if (req.pg) {
      try {
        req.pg.release();
      } catch (error) {
        console.error("❌ Error releasing database connection:", error);
      }
    }
  });

  fastify.addHook("onError", async (req, reply, error) => {
    console.error("❌ Request error:", error);

    if (req.pg) {
      try {
        req.pg.release();
      } catch (releaseError) {
        console.error(
          "❌ Error releasing database connection on error:",
          releaseError
        );
      }
    }
  });

  fastify.addHook("onClose", async () => {
    console.log("🔄 Closing database connections...");
    if (pool) {
      await pool.end();
    }
    console.log("✅ Database connections closed");
  });
}

export default fp(postgresDB, {
  name: "postgresDB",
});
