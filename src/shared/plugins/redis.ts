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
    reconnectAttempts = 0;
  const reconnectInterval = 5000;

  const { url, ...opts } = options;

  let redisClient: Redis = new Redis(options.url, {
    lazyConnect: true, // tắt auto connect
    retryStrategy: () => null, // Tắt retry tự động,
    ...opts,
  });

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function reconnect(): Promise<void> {
    redisClient = new Redis(options.url, {
      lazyConnect: true, // tắt auto connect
      retryStrategy: () => null, // Tắt retry tự động,
      ...opts,
    });
    while (!isConnected) {
      console.log(`Redis - Attempting to reconnect to cache...`);
      try {
        await redisClient.connect();
        console.log("Redis - Connected successfully");

        redisClient.on("error", (err) => {
          console.log("setupEventHandlers error");
        });

        redisClient.on("close", async () => {
          isConnected = false;
          redisClient.quit();
          await reconnect();
        });

        isConnected = true;
        reconnectAttempts = 0;
        break;
      } catch (error) {
        reconnectAttempts++;
        console.log(`Redis - Reconnection attempt ${reconnectAttempts} failed`);
        await sleep(reconnectInterval); // <- Fix here: not working
      }
    }
  }

  fastify.decorate("redis", redisClient);

  fastify.addHook("onReady", async () => {
    try {
      await redisClient.connect();
      console.log("Redis - connected successfully");
      isConnected = true;

      redisClient.on("error", (err) => {
        console.log("setupEventHandlers error");
      });

      redisClient.on("close", async () => {
        isConnected = false;
        await reconnect();
      });
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
    fastify.logger.info("Closing Redis connection");
    await redisClient.quit();
  });
}

export default fp(redisCache, {
  name: "redis-cache",
});
