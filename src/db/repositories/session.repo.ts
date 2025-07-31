import config from "@/shared/config";
import Helper from "@/shared/helper";
import { FastifyInstance } from "fastify";
import Redis from "ioredis";

type CacheSession = {
  userId: string;
  ip: string;
  userAgentRaw: string;
  provider: "credential" | "google";
  cookie?: CookieOptions;
};

export class SessionRepo {
  constructor(private fastify: FastifyInstance) {}

  async create(d: CacheSession) {
    const sessionId = await Helper.generateId();
    const now = new Date();

    const cookieOpt: CookieOptions = {
      path: "/",
      httpOnly: true,
      secure: config.NODE_ENV == "production",
      expires: new Date(now.getTime() + config.SESSION_MAX_AGE),
      ...session.cookie,
    };

    const data: SessionData = {
      id: sessionId,
      provider: session.provider,
      userId: session.userId,
      cookie: cookieOpt,
      ip: session.ip,
      userAgent: UAParser(session.userAgentRaw),
      lastAccess: now,
      createAt: now,
    };

    const key = `${config.SESSION_KEY_NAME}:${session.userId}:${sessionId}`;

    try {
      if (cookieOpt.expires) {
        await this.client.set(
          key,
          JSON.stringify(data),
          "PX",
          cookieOpt.expires.getTime() - Date.now()
        );
      } else {
        await this.client.set(key, JSON.stringify(data));
      }

      return {
        key,
        cookie: cookieOpt,
      };
    } catch (error: unknown) {
      // if (error instanceof Error) {
      //   throw new RedisQueryError(
      //     `SessionCache.create() method error: ${error.message}`
      //   );
      // }
      // throw new RedisQueryError(
      //   `SessionCache.create() method error: Unknown error ${error}`
      // );
    }
  }
}
