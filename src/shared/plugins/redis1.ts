import fp from "fastify-plugin";
import { StatusCodes } from "http-status-codes";
import Redis, { RedisOptions as RedisOpts } from "ioredis";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { CustomError } from "../error-handler";

interface RedisOptions
  extends Omit<RedisOpts, "retryStrategy" | "lazyConnect"> {
  url: string;
}

async function redisCache(
  fastify: FastifyInstance,
  options: RedisOptions & FastifyPluginOptions
) {
  let isConnected = false,
    reconnectAttempts = 0,
    connectionTimeout: NodeJS.Timeout;
  const reconnectInterval = 5000;

  const { url, ...opts } = options;

  let redisClient: Redis = new Redis(options.url, {
    maxRetriesPerRequest: null,
  });

  function handleTimeoutError() {
    connectionTimeout = setTimeout(() => {
      throw new Error("Redis reconnect time out");
    }, reconnectInterval);
  }

  function handleEventConnect(redisClient: Redis) {
    redisClient.on("connect", () => {
      console.log("Redis connection status: connected");
      clearTimeout(connectionTimeout);
    });
    redisClient.on("end", () => {
      console.log("Redis connection status: disconnected");
      handleTimeoutError();
    });
    redisClient.on("reconnecting", () => {
      console.log("Redis connection status: reconnecting");
      clearTimeout(connectionTimeout);
    });
    redisClient.on("error", (err) => {
      console.log(`Redis connection status: error ${err}`);
      handleTimeoutError();
    });
  }

  fastify.decorate("redis", redisClient);

  fastify.addHook("onReady", async () => {
    handleEventConnect(redisClient);
    console.log("Redis - connected successfully");
  });

  fastify.addHook("onClose", async () => {
    fastify.logger.info("Closing Redis connection");
    redisClient.disconnect();
  });
}

export default fp(redisCache, {
  name: "redis-cache",
});

// import Redis from "ioredis";
// import env from "@/configs/env";

// let redisClient: Redis, connectionTimeout: NodeJS.Timeout;

// const REDIS_CONNECT_TIMEOUT = env.NODE_ENV == "development" ? 0 : 10000;

// function handleTimeoutError() {
//   connectionTimeout = setTimeout(() => {
//     throw new Error("Redis reconnect time out");
//   }, REDIS_CONNECT_TIMEOUT);
// }

// function handleEventConnect(redisClient: Redis) {
//   redisClient.on("connect", () => {
//     console.log("Redis connection status: connected");
//     clearTimeout(connectionTimeout);
//   });
//   redisClient.on("end", () => {
//     console.log("Redis connection status: disconnected");
//     handleTimeoutError();
//   });
//   redisClient.on("reconnecting", () => {
//     console.log("Redis connection status: reconnecting");
//     clearTimeout(connectionTimeout);
//   });
//   redisClient.on("error", (err) => {
//     console.log(`Redis connection status: error ${err}`);
//     handleTimeoutError();
//   });
// }

// export function initRedis(): void {
//   const instanceRedis: Redis = new Redis(env.REDIS_HOST, {
//     maxRetriesPerRequest: null,
//   });
//   redisClient = instanceRedis;
//   handleEventConnect(redisClient);
//   for (const s of ["SIGINT", "SIGTERM"]) {
//     process.once(s, () => {
//       redisClient.disconnect();
//     });
//   }
// }
// export { redisClient };
