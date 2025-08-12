// // case 1: My Code 8.5/10
// import fp from "fastify-plugin";
// import { StatusCodes } from "http-status-codes";
// import Redis, { RedisOptions as RedisOpts } from "ioredis";
// import { FastifyInstance, FastifyPluginOptions } from "fastify";

// import { CustomError } from "../error-handler";
// import { SessionRepo } from "@/db/repositories/session.repo";

// interface RedisOptions
//   extends Omit<RedisOpts, "retryStrategy" | "lazyConnect"> {
//   url: string;
// }

// async function redisCache(
//   fastify: FastifyInstance,
//   options: RedisOptions & FastifyPluginOptions
// ) {
//   let isConnected = false,
//     reconnectAttempts = 0;
//   const reconnectInterval = 5000;

//   const { url, ...opts } = options;

//   const redisClient: Redis = new Redis(options.url, {
//     lazyConnect: true,
//     retryStrategy: () => null,
//     ...opts,
//   });

//   // Decorate ban đầu
//   fastify.decorate("redis", redisClient);
//   fastify.decorateRequest("session");

//   function sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   async function reconnect(): Promise<void> {
//     while (!isConnected) {
//       console.log(`Redis - Attempting to reconnect to cache...`);
//       try {
//         // Disconnect client cũ nếu chưa disconnect
//         if (fastify.redis && fastify.redis.status !== "end") {
//           fastify.redis.disconnect();
//         }

//         const newRedisClient = new Redis(options.url, {
//           lazyConnect: true,
//           retryStrategy: () => null,
//           ...opts,
//         });

//         await newRedisClient.connect();
//         console.log("Redis - Connected successfully");

//         // Cập nhật client reference
//         fastify.redis = newRedisClient;

//         newRedisClient.on("error", (err) => {
//           console.log("Redis connection error:", err.message);
//         });

//         newRedisClient.on("close", async () => {
//           console.log("Redis connection closed");
//           isConnected = false;
//           await reconnect();
//         });

//         isConnected = true;
//         reconnectAttempts = 0;
//         break;
//       } catch (error) {
//         reconnectAttempts++;
//         console.log(
//           `Redis - Reconnection attempt ${reconnectAttempts} failed:`,
//           error
//         );
//         await sleep(reconnectInterval);
//       }
//     }
//   }

//   fastify.addHook("onReady", async () => {
//     try {
//       await redisClient.connect();
//       console.log("Redis - connected successfully");
//       isConnected = true;

//       redisClient.on("error", (err) => {
//         console.log("Redis connection error:", err.message);
//       });

//       redisClient.on("close", async () => {
//         console.log("Redis connection closed");
//         isConnected = false;
//         await reconnect();
//       });
//     } catch (error) {
//       console.log("Redis initial connection failed:", error);
//       throw new CustomError({
//         message:
//           "Cache temporarily unavailable. Please try again in a few moments",
//         statusCode: StatusCodes.SERVICE_UNAVAILABLE,
//         statusText: "SERVICE_UNAVAILABLE",
//       });
//     }
//   });

//   fastify.addHook("onRequest", async (req) => {
//     req.session = new SessionRepo(fastify);
//   });

//   fastify.addHook("onClose", async () => {
//     fastify.logger.info("Closing Redis connection");
//     isConnected = false;
//     if (fastify.redis && fastify.redis.status !== "end") {
//       await fastify.redis.quit();
//     }
//   });
// }

// export default fp(redisCache, {
//   name: "redis-cache",
// });

// // case 2: Claude AI
// import fp from "fastify-plugin";
// import { StatusCodes } from "http-status-codes";
// import Redis, { RedisOptions as RedisOpts } from "ioredis";
// import { FastifyInstance, FastifyPluginOptions } from "fastify";

// import { CustomError } from "../error-handler";
// import { SessionRepo } from "@/db/repositories/session.repo";

// interface RedisOptions
//   extends Omit<RedisOpts, "retryStrategy" | "lazyConnect"> {
//   url: string;
// }

// async function redisCache(
//   fastify: FastifyInstance,
//   options: RedisOptions & FastifyPluginOptions
// ) {
//   let isConnected = false,
//     reconnectAttempts = 0;
//   const reconnectInterval = 5000;

//   const { url, ...opts } = options;

//   let redisClient: Redis = new Redis(options.url, {
//     lazyConnect: true,
//     retryStrategy: () => null,
//     ...opts,
//   });

//   // Decorate với getter để luôn trả về client hiện tại
//   fastify.decorate("redis", {
//     get client() {
//       return redisClient;
//     },
//   });

//   // Hoặc sử dụng cách này (đơn giản hơn):
//   // fastify.decorate("redis", redisClient);

//   fastify.decorateRequest("session");

//   function sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   // Hàm để cập nhật client reference
//   function updateRedisClient(newClient: Redis) {
//     redisClient = newClient;
//     // Cập nhật lại decorator
//     // fastify.redis = newClient;
//   }

//   async function reconnect(): Promise<void> {
//     while (!isConnected) {
//       console.log(`Redis - Attempting to reconnect to cache...`);
//       try {
//         // Disconnect client cũ nếu chưa disconnect
//         if (redisClient && redisClient.status !== "end") {
//           redisClient.disconnect();
//         }

//         const newRedisClient = new Redis(options.url, {
//           lazyConnect: true,
//           retryStrategy: () => null,
//           ...opts,
//         });

//         await newRedisClient.connect();
//         console.log("Redis - Connected successfully");

//         // Cập nhật client reference
//         updateRedisClient(newRedisClient);

//         newRedisClient.on("error", (err) => {
//           console.log("Redis connection error:", err.message);
//         });

//         newRedisClient.on("close", async () => {
//           console.log("Redis connection closed");
//           isConnected = false;
//           await reconnect();
//         });

//         isConnected = true;
//         reconnectAttempts = 0;
//         break;
//       } catch (error) {
//         reconnectAttempts++;
//         console.log(
//           `Redis - Reconnection attempt ${reconnectAttempts} failed:`,
//           error
//         );
//         await sleep(reconnectInterval);
//       }
//     }
//   }

//   fastify.addHook("onReady", async () => {
//     try {
//       await redisClient.connect();
//       console.log("Redis - connected successfully");
//       isConnected = true;

//       redisClient.on("error", (err) => {
//         console.log("Redis connection error:", err.message);
//       });

//       redisClient.on("close", async () => {
//         console.log("Redis connection closed");
//         isConnected = false;
//         await reconnect();
//       });
//     } catch (error) {
//       console.log("Redis initial connection failed:", error);
//       throw new CustomError({
//         message:
//           "Cache temporarily unavailable. Please try again in a few moments",
//         statusCode: StatusCodes.SERVICE_UNAVAILABLE,
//         statusText: "SERVICE_UNAVAILABLE",
//       });
//     }
//   });

//   fastify.addHook("onRequest", async (req) => {
//     req.session = new SessionRepo(fastify);
//   });

//   fastify.addHook("onClose", async () => {
//     fastify.logger.info("Closing Redis connection");
//     isConnected = false;
//     if (redisClient && redisClient.status !== "end") {
//       await redisClient.quit();
//     }
//   });
// }

// export default fp(redisCache, {
//   name: "redis-cache",
// });

// // case 3: Claude AI 10/10
// import fp from "fastify-plugin";
// import { StatusCodes } from "http-status-codes";
// import Redis, { RedisOptions as RedisOpts } from "ioredis";
// import { FastifyInstance, FastifyPluginOptions } from "fastify";

// import { CustomError } from "../error-handler";
// import { SessionRepo } from "@/db/repositories/session.repo";

// interface RedisOptions
//   extends Omit<RedisOpts, "retryStrategy" | "lazyConnect"> {
//   url: string;
//   maxReconnectAttempts?: number;
//   reconnectInterval?: number;
//   healthCheckInterval?: number;
//   circuitBreakerThreshold?: number;
//   circuitBreakerTimeout?: number;
// }

// interface ConnectionState {
//   isConnected: boolean;
//   isReconnecting: boolean;
//   reconnectAttempts: number;
//   lastError?: Error;
//   connectionStartTime?: number;
//   totalReconnects: number;
// }

// interface CircuitBreakerState {
//   failures: number;
//   isOpen: boolean;
//   nextAttempt: number;
// }

// async function redisCache(
//   fastify: FastifyInstance,
//   options: RedisOptions & FastifyPluginOptions
// ) {
//   // Configuration with defaults
//   const config = {
//     maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
//     reconnectInterval: options.reconnectInterval ?? 5000,
//     healthCheckInterval: options.healthCheckInterval ?? 30000,
//     circuitBreakerThreshold: options.circuitBreakerThreshold ?? 5,
//     circuitBreakerTimeout: options.circuitBreakerTimeout ?? 60000,
//   };

//   const {
//     url,
//     maxReconnectAttempts,
//     reconnectInterval,
//     healthCheckInterval,
//     circuitBreakerThreshold,
//     circuitBreakerTimeout,
//     ...opts
//   } = options;

//   // State management
//   const connectionState: ConnectionState = {
//     isConnected: false,
//     isReconnecting: false,
//     reconnectAttempts: 0,
//     totalReconnects: 0,
//   };

//   const circuitBreaker: CircuitBreakerState = {
//     failures: 0,
//     isOpen: false,
//     nextAttempt: 0,
//   };

//   let redisClient: Redis;
//   let healthCheckTimer: NodeJS.Timeout | null = null;
//   let reconnectTimer: NodeJS.Timeout | null = null;

//   // Metrics for monitoring
//   const metrics = {
//     connectionsCreated: 0,
//     connectionsFailed: 0,
//     reconnectionsSuccessful: 0,
//     reconnectionsFailed: 0,
//     circuitBreakerTripped: 0,
//   };

//   fastify.decorateRequest("session");

//   // Utility functions
//   function sleep(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   function createRedisClient(): Redis {
//     metrics.connectionsCreated++;
//     return new Redis(url, {
//       lazyConnect: true,
//       retryStrategy: () => null, // We handle reconnection manually
//       maxRetriesPerRequest: 3,
//       enableReadyCheck: true,
//       ...opts,
//     });
//   }

//   function isCircuitBreakerOpen(): boolean {
//     if (!circuitBreaker.isOpen) return false;

//     if (Date.now() > circuitBreaker.nextAttempt) {
//       circuitBreaker.isOpen = false;
//       circuitBreaker.failures = 0;
//       fastify.logger.info("Redis circuit breaker reset");
//       return false;
//     }

//     return true;
//   }

//   function tripCircuitBreaker(): void {
//     circuitBreaker.failures++;

//     if (circuitBreaker.failures >= config.circuitBreakerThreshold) {
//       circuitBreaker.isOpen = true;
//       circuitBreaker.nextAttempt = Date.now() + config.circuitBreakerTimeout;
//       metrics.circuitBreakerTripped++;

//       fastify.logger.error(
//         `Redis circuit breaker tripped after ${circuitBreaker.failures} failures. ` +
//           `Will retry at ${new Date(circuitBreaker.nextAttempt).toISOString()}`
//       );
//     }
//   }

//   function setupEventHandlers(client: Redis): void {
//     // Remove any existing listeners to prevent memory leaks
//     client.removeAllListeners();

//     client.on("connect", () => {
//       connectionState.isConnected = true;
//       connectionState.isReconnecting = false;
//       connectionState.reconnectAttempts = 0;
//       connectionState.connectionStartTime = Date.now();

//       // Reset circuit breaker on successful connection
//       circuitBreaker.failures = 0;
//       circuitBreaker.isOpen = false;

//       fastify.logger.info("Redis connected successfully", {
//         totalReconnects: connectionState.totalReconnects,
//         connectionTime: connectionState.connectionStartTime,
//       });
//     });

//     client.on("ready", () => {
//       fastify.logger.info("Redis ready for operations");
//     });

//     client.on("error", (error) => {
//       connectionState.lastError = error;

//       fastify.logger.error("Redis connection error", {
//         error: error.message,
//         code: (error as any).code,
//         syscall: (error as any).syscall,
//       });

//       tripCircuitBreaker();
//     });

//     client.on("close", () => {
//       connectionState.isConnected = false;

//       fastify.logger.warn("Redis connection closed", {
//         wasConnected: connectionState.isConnected,
//         uptime: connectionState.connectionStartTime
//           ? Date.now() - connectionState.connectionStartTime
//           : 0,
//       });

//       // Only trigger reconnection if not already reconnecting and not shutting down
//       if (!connectionState.isReconnecting && !fastify.closing) {
//         scheduleReconnect();
//       }
//     });

//     client.on("reconnecting", (time) => {
//       fastify.logger.info(`Redis reconnecting in ${time}ms`);
//     });
//   }

//   function scheduleReconnect(): void {
//     if (connectionState.isReconnecting || isCircuitBreakerOpen()) {
//       return;
//     }

//     connectionState.isReconnecting = true;

//     // Clear any existing reconnect timer
//     if (reconnectTimer) {
//       clearTimeout(reconnectTimer);
//     }

//     reconnectTimer = setTimeout(() => {
//       reconnect().catch((error) => {
//         fastify.logger.error("Unhandled reconnection error", { error });
//       });
//     }, config.reconnectInterval);
//   }

//   async function reconnect(): Promise<void> {
//     if (connectionState.isConnected || isCircuitBreakerOpen()) {
//       connectionState.isReconnecting = false;
//       return;
//     }

//     while (
//       !connectionState.isConnected &&
//       connectionState.reconnectAttempts < config.maxReconnectAttempts &&
//       !isCircuitBreakerOpen() &&
//       !fastify.closing
//     ) {
//       connectionState.reconnectAttempts++;

//       fastify.logger.info(
//         `Redis reconnection attempt ${connectionState.reconnectAttempts}/${config.maxReconnectAttempts}`
//       );

//       try {
//         // Cleanup old client
//         if (redisClient) {
//           await cleanupClient(redisClient);
//         }

//         // Create and setup new client
//         const newClient = createRedisClient();
//         setupEventHandlers(newClient);

//         // Connect with timeout
//         const connectPromise = newClient.connect();
//         const timeoutPromise = sleep(10000).then(() => {
//           throw new Error("Connection timeout after 10 seconds");
//         });

//         await Promise.race([connectPromise, timeoutPromise]);

//         // Update references atomically
//         redisClient = newClient;
//         fastify.redis = newClient;

//         connectionState.totalReconnects++;
//         metrics.reconnectionsSuccessful++;

//         fastify.logger.info("Redis reconnection successful", {
//           attempt: connectionState.reconnectAttempts,
//           totalReconnects: connectionState.totalReconnects,
//         });

//         return;
//       } catch (error) {
//         metrics.reconnectionsFailed++;

//         fastify.logger.error(
//           `Redis reconnection attempt ${connectionState.reconnectAttempts} failed`,
//           {
//             error: (error as Error).message,
//             attempt: connectionState.reconnectAttempts,
//             maxAttempts: config.maxReconnectAttempts,
//           }
//         );

//         if (connectionState.reconnectAttempts < config.maxReconnectAttempts) {
//           await sleep(config.reconnectInterval);
//         }
//       }
//     }

//     // Max attempts reached or circuit breaker open
//     connectionState.isReconnecting = false;

//     if (connectionState.reconnectAttempts >= config.maxReconnectAttempts) {
//       fastify.logger.error(
//         `Redis reconnection failed after ${config.maxReconnectAttempts} attempts. Giving up.`
//       );
//       tripCircuitBreaker();
//     }
//   }

//   async function cleanupClient(client: Redis): Promise<void> {
//     try {
//       client.removeAllListeners();

//       if (client.status !== "end") {
//         // Give it a moment to disconnect gracefully
//         const disconnectPromise = new Promise<void>((resolve) => {
//           client.disconnect();
//           setTimeout(resolve, 1000);
//         });

//         await disconnectPromise;
//       }
//     } catch (error) {
//       fastify.logger.warn("Error during client cleanup", { error });
//     }
//   }

//   function startHealthCheck(): void {
//     if (healthCheckTimer) return;

//     healthCheckTimer = setInterval(async () => {
//       if (!connectionState.isConnected || !redisClient) return;

//       try {
//         await redisClient.ping();
//         fastify.logger.debug("Redis health check passed");
//       } catch (error) {
//         fastify.logger.warn("Redis health check failed", { error });
//         // The error event will trigger reconnection
//       }
//     }, config.healthCheckInterval);
//   }

//   function stopHealthCheck(): void {
//     if (healthCheckTimer) {
//       clearInterval(healthCheckTimer);
//       healthCheckTimer = null;
//     }
//   }

//   // Initialize
//   redisClient = createRedisClient();
//   fastify.decorate("redis", redisClient);

//   // Add metrics endpoint for monitoring
//   fastify.decorate("redisMetrics", () => ({
//     ...metrics,
//     connectionState: { ...connectionState },
//     circuitBreaker: { ...circuitBreaker },
//     uptime: connectionState.connectionStartTime
//       ? Date.now() - connectionState.connectionStartTime
//       : 0,
//   }));

//   // Hooks
//   fastify.addHook("onReady", async () => {
//     try {
//       setupEventHandlers(redisClient);

//       connectionState.connectionStartTime = Date.now();
//       await redisClient.connect();

//       startHealthCheck();

//       fastify.logger.info("Redis plugin initialized successfully");
//     } catch (error) {
//       metrics.connectionsFailed++;

//       fastify.logger.error("Redis initial connection failed", {
//         error: (error as Error).message,
//       });

//       throw new CustomError({
//         message:
//           "Cache temporarily unavailable. Please try again in a few moments",
//         statusCode: StatusCodes.SERVICE_UNAVAILABLE,
//         statusText: "SERVICE_UNAVAILABLE",
//       });
//     }
//   });

//   fastify.addHook("onRequest", async (req) => {
//     // Create session with error handling
//     try {
//       req.session = new SessionRepo(fastify);
//     } catch (error) {
//       fastify.logger.error("Failed to create session", { error });
//       throw new CustomError({
//         message: "Session initialization failed",
//         statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//         statusText: "INTERNAL_SERVER_ERROR",
//       });
//     }
//   });

//   fastify.addHook("onClose", async () => {
//     fastify.logger.info("Shutting down Redis connection", {
//       totalConnections: metrics.connectionsCreated,
//       totalReconnects: connectionState.totalReconnects,
//       uptime: connectionState.connectionStartTime
//         ? Date.now() - connectionState.connectionStartTime
//         : 0,
//     });

//     // Stop health check
//     stopHealthCheck();

//     // Clear timers
//     if (reconnectTimer) {
//       clearTimeout(reconnectTimer);
//       reconnectTimer = null;
//     }

//     // Mark as shutting down
//     connectionState.isConnected = false;
//     connectionState.isReconnecting = false;

//     // Cleanup client
//     if (redisClient) {
//       await cleanupClient(redisClient);

//       try {
//         if (redisClient.status !== "end") {
//           await redisClient.quit();
//         }
//       } catch (error) {
//         fastify.logger.warn("Error during Redis shutdown", { error });
//       }
//     }

//     fastify.logger.info("Redis connection closed successfully");
//   });
// }

// export default fp(redisCache, {
//   name: "redis-cache",
// });

import fp from "fastify-plugin";
import { StatusCodes } from "http-status-codes";
import Redis, { RedisOptions as RedisOpts } from "ioredis";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { CustomError } from "../error-handler";
import SessionRepo from "@/db/repositories/session.repo";

interface RedisOptions
  extends Omit<RedisOpts, "retryStrategy" | "lazyConnect"> {
  url: string;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  healthCheckInterval?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
}

interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastError?: Error;
  connectionStartTime?: number;
  totalReconnects: number;
}

interface CircuitBreakerState {
  failures: number;
  isOpen: boolean;
  nextAttempt: number;
}

async function redisCache(
  fastify: FastifyInstance,
  options: RedisOptions & FastifyPluginOptions
) {
  // Configuration with defaults
  const config = {
    maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
    reconnectInterval: options.reconnectInterval ?? 5000,
    healthCheckInterval: options.healthCheckInterval ?? 30000,
    circuitBreakerThreshold: options.circuitBreakerThreshold ?? 5,
    circuitBreakerTimeout: options.circuitBreakerTimeout ?? 60000,
  };

  const {
    url,
    maxReconnectAttempts,
    reconnectInterval,
    healthCheckInterval,
    circuitBreakerThreshold,
    circuitBreakerTimeout,
    ...opts
  } = options;

  // State management
  const connectionState: ConnectionState = {
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    totalReconnects: 0,
  };

  const circuitBreaker: CircuitBreakerState = {
    failures: 0,
    isOpen: false,
    nextAttempt: 0,
  };

  let redisClient: Redis;
  let healthCheckTimer: NodeJS.Timeout | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let isShuttingDown = false;

  // Metrics for monitoring
  const metrics = {
    connectionsCreated: 0,
    connectionsFailed: 0,
    reconnectionsSuccessful: 0,
    reconnectionsFailed: 0,
    circuitBreakerTripped: 0,
  };

  fastify.decorateRequest("session");

  // Utility functions
  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function createRedisClient(): Redis {
    metrics.connectionsCreated++;
    return new Redis(url, {
      lazyConnect: true,
      retryStrategy: () => null, // We handle reconnection manually
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      ...opts,
    });
  }

  function isCircuitBreakerOpen(): boolean {
    if (!circuitBreaker.isOpen) return false;

    if (Date.now() > circuitBreaker.nextAttempt) {
      circuitBreaker.isOpen = false;
      circuitBreaker.failures = 0;
      fastify.logger.info("Redis circuit breaker reset");
      return false;
    }

    return true;
  }

  function tripCircuitBreaker(): void {
    circuitBreaker.failures++;

    if (circuitBreaker.failures >= config.circuitBreakerThreshold) {
      circuitBreaker.isOpen = true;
      circuitBreaker.nextAttempt = Date.now() + config.circuitBreakerTimeout;
      metrics.circuitBreakerTripped++;

      fastify.logger.error(
        `Redis circuit breaker tripped after ${circuitBreaker.failures} failures. ` +
          `Will retry at ${new Date(circuitBreaker.nextAttempt).toISOString()}`
      );
    }
  }

  function setupEventHandlers(client: Redis): void {
    // Remove any existing listeners to prevent memory leaks
    client.removeAllListeners();

    client.on("connect", () => {
      connectionState.isConnected = true;
      connectionState.isReconnecting = false;
      connectionState.reconnectAttempts = 0;
      connectionState.connectionStartTime = Date.now();

      // Reset circuit breaker on successful connection
      circuitBreaker.failures = 0;
      circuitBreaker.isOpen = false;

      fastify.logger.info("Redis connected successfully", {
        totalReconnects: connectionState.totalReconnects,
        connectionTime: connectionState.connectionStartTime,
      });
    });

    client.on("ready", () => {
      fastify.logger.info("Redis ready for operations");
    });

    client.on("error", (error) => {
      connectionState.lastError = error;

      fastify.logger.error("Redis connection error", {
        error: error.message,
        code: (error as any).code,
        syscall: (error as any).syscall,
      });

      tripCircuitBreaker();
    });

    client.on("close", () => {
      connectionState.isConnected = false;

      fastify.logger.warn("Redis connection closed", {
        wasConnected: connectionState.isConnected,
        uptime: connectionState.connectionStartTime
          ? Date.now() - connectionState.connectionStartTime
          : 0,
      });

      // Only trigger reconnection if not already reconnecting and not shutting down
      if (!connectionState.isReconnecting && !isShuttingDown) {
        scheduleReconnect();
      }
    });

    client.on("reconnecting", (time: number) => {
      fastify.logger.info(`Redis reconnecting in ${time}ms`);
    });
  }

  function scheduleReconnect(): void {
    if (connectionState.isReconnecting || isCircuitBreakerOpen()) {
      return;
    }

    connectionState.isReconnecting = true;

    // Clear any existing reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(() => {
      reconnect().catch((error) => {
        fastify.logger.error("Unhandled reconnection error", { error });
      });
    }, config.reconnectInterval);
  }

  async function reconnect(): Promise<void> {
    if (connectionState.isConnected || isCircuitBreakerOpen()) {
      connectionState.isReconnecting = false;
      return;
    }

    while (
      !connectionState.isConnected &&
      connectionState.reconnectAttempts < config.maxReconnectAttempts &&
      !isCircuitBreakerOpen() &&
      !isShuttingDown
    ) {
      connectionState.reconnectAttempts++;

      fastify.logger.info(
        `Redis reconnection attempt ${connectionState.reconnectAttempts}/${config.maxReconnectAttempts}`
      );

      try {
        // Cleanup old client
        if (redisClient) {
          await cleanupClient(redisClient);
        }

        // Create and setup new client
        const newClient = createRedisClient();
        setupEventHandlers(newClient);

        // Connect with timeout
        const connectPromise = newClient.connect();
        const timeoutPromise = sleep(10000).then(() => {
          throw new Error("Connection timeout after 10 seconds");
        });

        await Promise.race([connectPromise, timeoutPromise]);

        // Update references atomically
        redisClient = newClient;
        fastify.redis = newClient;

        connectionState.totalReconnects++;
        metrics.reconnectionsSuccessful++;

        fastify.logger.info("Redis reconnection successful", {
          attempt: connectionState.reconnectAttempts,
          totalReconnects: connectionState.totalReconnects,
        });

        return;
      } catch (error) {
        metrics.reconnectionsFailed++;

        fastify.logger.error(
          `Redis reconnection attempt ${connectionState.reconnectAttempts} failed`,
          {
            error: (error as Error).message,
            attempt: connectionState.reconnectAttempts,
            maxAttempts: config.maxReconnectAttempts,
          }
        );

        if (connectionState.reconnectAttempts < config.maxReconnectAttempts) {
          await sleep(config.reconnectInterval);
        }
      }
    }

    // Max attempts reached or circuit breaker open
    connectionState.isReconnecting = false;

    if (connectionState.reconnectAttempts >= config.maxReconnectAttempts) {
      fastify.logger.error(
        `Redis reconnection failed after ${config.maxReconnectAttempts} attempts. Giving up.`
      );
      tripCircuitBreaker();
    }
  }

  async function cleanupClient(client: Redis): Promise<void> {
    try {
      client.removeAllListeners();

      if (client.status !== "end") {
        // Give it a moment to disconnect gracefully
        const disconnectPromise = new Promise<void>((resolve) => {
          client.disconnect();
          setTimeout(resolve, 1000);
        });

        await disconnectPromise;
      }
    } catch (error) {
      fastify.logger.warn("Error during client cleanup", { error });
    }
  }

  function startHealthCheck(): void {
    if (healthCheckTimer) return;

    healthCheckTimer = setInterval(async () => {
      if (!connectionState.isConnected || !redisClient) return;

      try {
        await redisClient.ping();
        fastify.logger.debug("Redis health check passed");
      } catch (error) {
        fastify.logger.warn("Redis health check failed", { error });
        // The error event will trigger reconnection
      }
    }, config.healthCheckInterval);
  }

  function stopHealthCheck(): void {
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer);
      healthCheckTimer = null;
    }
  }

  // Initialize
  redisClient = createRedisClient();
  fastify.decorate("redis", redisClient);

  // Add metrics endpoint for monitoring
  fastify.decorate("redisMetrics", () => ({
    ...metrics,
    connectionState: { ...connectionState },
    circuitBreaker: { ...circuitBreaker },
    uptime: connectionState.connectionStartTime
      ? Date.now() - connectionState.connectionStartTime
      : 0,
  }));

  // Hooks
  fastify.addHook("onReady", async () => {
    try {
      setupEventHandlers(redisClient);

      connectionState.connectionStartTime = Date.now();
      await redisClient.connect();

      startHealthCheck();

      fastify.logger.info("Redis plugin initialized successfully");
    } catch (error) {
      metrics.connectionsFailed++;

      fastify.logger.error("Redis initial connection failed", {
        error: (error as Error).message,
      });

      throw new CustomError({
        message:
          "Cache temporarily unavailable. Please try again in a few moments",
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        statusText: "SERVICE_UNAVAILABLE",
      });
    }
  });

  fastify.addHook("onRequest", async (req) => {
    // Create session with error handling
    try {
      req.sessions = new SessionRepo(fastify);
    } catch (error) {
      fastify.logger.error("Failed to create session", { error });
      throw new CustomError({
        message: "Session initialization failed",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        statusText: "INTERNAL_SERVER_ERROR",
      });
    }
  });

  fastify.addHook("onClose", async () => {
    fastify.logger.info("Shutting down Redis connection", {
      totalConnections: metrics.connectionsCreated,
      totalReconnects: connectionState.totalReconnects,
      uptime: connectionState.connectionStartTime
        ? Date.now() - connectionState.connectionStartTime
        : 0,
    });

    // Stop health check
    stopHealthCheck();

    // Clear timers
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // Mark as shutting down
    isShuttingDown = true;
    connectionState.isConnected = false;
    connectionState.isReconnecting = false;

    // Cleanup client
    if (redisClient) {
      await cleanupClient(redisClient);

      try {
        if (redisClient.status !== "end") {
          await redisClient.quit();
        }
      } catch (error) {
        fastify.logger.warn("Error during Redis shutdown", { error });
      }
    }

    fastify.logger.info("Redis connection closed successfully");
  });
}

export default fp(redisCache, {
  name: "redis-cache",
});
