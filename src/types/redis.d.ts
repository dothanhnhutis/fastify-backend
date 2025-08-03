import Redis from "ioredis";
import { SessionRepo } from "@/db/repositories/session.repo";

// case 1: My code
// declare module "fastify" {
//   interface FastifyInstance {
//     redis: Redis;
//   }
//   interface FastifyRequest {
//     session: SessionRepo;
//   }
// }

/// case 2: Claude AI
// declare module "fastify" {
//   interface FastifyInstance {
//     redis: { client: Redis };
//   }
//   interface FastifyRequest {
//     session: SessionRepo;
//   }
// }

/// case 2: Claude AI 10/10
declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
    redisMetrics: () => {
      connectionsCreated: number;
      connectionsFailed: number;
      reconnectionsSuccessful: number;
      reconnectionsFailed: number;
      circuitBreakerTripped: number;
      connectionState: ConnectionState;
      circuitBreaker: CircuitBreakerState;
      uptime: number;
    };
  }
  interface FastifyRequest {
    session: SessionRepo;
  }
}
