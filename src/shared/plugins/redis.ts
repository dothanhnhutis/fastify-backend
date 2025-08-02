import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import Redis, { RedisOptions as RedisOpts } from "ioredis";
import { CustomError } from "../error-handler";
import { StatusCodes } from "http-status-codes";

// class RedisCache {
//   private _client: Redis | null;
//   private isConnecting = false;
//   private reconnectInterval = 5000;

//   constructor(private url: string) {
//     this._client = null;
//   }

//   async connect() {
//     if (this.isConnecting) return;
//     this.isConnecting = true;

//     try {
//       const connection = new Redis(this.url, {
//         lazyConnect: true, // tắt auto connect
//         retryStrategy: () => null, // Tắt retry tự động
//       });

//       await connection.connect();

//       this.isConnecting = false;
//       log.info("✅ Redis connected");
//       this._client = connection;

//       connection.on("error", (err) => {
//         log.error(`❌ Redis error: ${err.message}`);
//       });

//       connection.on("close", async () => {
//         log.warn("❌ Redis connection closed. Attempting manual reconnect...");
//         this._client = null;
//         await this.reconnect();
//       });
//     } catch (error: unknown) {
//       this.isConnecting = false;
//       log.error(`❌ Connect Redis error: ${error}`);
//       throw new RedisConnectError();
//     }
//   }

//   private async reconnect() {
//     while (!this._client) {
//       try {
//         log.info("⏳ Trying to reconnect to Redis...");
//         await this.connect();
//       } catch (err) {
//         log.error(
//           `Reconnect attempt failed. Retrying in ${
//             this.reconnectInterval / 1000
//           }s...`
//         );
//         await this.sleep(this.reconnectInterval);
//       }
//     }
//   }

//   private sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   get client(): Redis {
//     if (!this._client) {
//       throw new Error("❌ Redis connection not established");
//     }
//     return this._client;
//   }
// }

interface RedisOptions
  extends Omit<RedisOpts, "retryStrategy" | "lazyConnect"> {
  url: string;
}

async function redisCache(
  fastify: FastifyInstance,
  options: RedisOptions & FastifyPluginOptions
) {
  let isConnecting = false;
  const reconnectInterval = 5000;

  const { url, ...opts } = options;
  let redisClient: Redis = new Redis(options.url, {
    lazyConnect: true, // tắt auto connect
    retryStrategy: () => null, // Tắt retry tự động,
    ...opts,
  });

  redisClient.on("error", (err) => {
    console.log(`❌ Redis error: ${err.message}`);
  });

  redisClient.on("close", async () => {
    console.log("❌ Redis connection closed. Attempting manual reconnect...");
    // await reconnect();
  });

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  fastify.decorate("redis", redisClient);

  fastify.addHook("onReady", async () => {
    try {
      await redisClient.connect();
      fastify.logger.info("Cache connected successfully");
    } catch (error) {
      throw new CustomError({
        message:
          "Cache temporarily unavailable. Please try again in a few moments",
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        statusText: "SERVICE_UNAVAILABLE",
      });
    }
  });

  fastify.addHook("onClose", async () => {
    fastify.log.info("Closing Redis connection");
    await redisClient.quit();
  });
}

export default fp(redisCache, {
  name: "redis-cache",
});
