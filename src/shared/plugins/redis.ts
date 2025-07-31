import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import Redis, { RedisOptions as RedisOpts } from "ioredis";

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
  const redisClient = new Redis(options.url, {
    lazyConnect: true, // tắt auto connect
    retryStrategy: () => null, // Tắt retry tự động,
    ...opts,
  });

  redisClient.on("error", (err) => {
    fastify.logger.error(`❌ Redis error: ${err.message}`);
  });

  redisClient.on("close", async () => {
    fastify.logger.warn(
      "❌ Redis connection closed. Attempting manual reconnect..."
    );
    await reconnect();
  });

  connect();

  function connect() {
    if (isConnecting) return;
    isConnecting = true;

    redisClient.connect((err) => {
      isConnecting = false;
      if (err) {
        fastify.log.error(`❌ Connect Redis error: ${err}`);
      }
      fastify.logger.info("✅ Redis connected");
    });
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function reconnect() {
    while (!fastify.redis) {
      try {
        fastify.logger.info("⏳ Trying to reconnect to Redis...");
        await connect();
      } catch (err) {
        fastify.logger.error(
          `Reconnect attempt failed. Retrying in ${
            reconnectInterval / 1000
          }s...`
        );
        await sleep(reconnectInterval);
      }
    }
  }

  fastify.decorate("redis", redisClient);

  fastify.addHook("onClose", async () => {
    fastify.log.info("🧹 Closing Redis connection");
    await redisClient.quit();
  });
}

export default fp(redisCache, {
  name: "redis-cache",
});
