import config from "@/shared/config";
import { CustomError } from "@/shared/error-handler";
import Helper from "@/shared/helper";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { UAParser } from "ua-parser-js";

type CacheSession = {
  userId: string;
  ip: string;
  userAgentRaw: string;
  provider: "credential" | "google";
  cookie?: CookieOptions;
};

export type SessionData = {
  id: string;
  provider: "google" | "credential";
  userId: string;
  cookie: CookieOptions;
  ip: string;
  userAgent: UAParser.IResult;
  lastAccess: Date;
  createAt: Date;
};

export class SessionRepo {
  constructor(private fastify: FastifyInstance) {}

  async create(session: CacheSession) {
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
        await this.fastify.redis.set(
          key,
          JSON.stringify(data),
          "PX",
          cookieOpt.expires.getTime() - Date.now()
        );
      } else {
        await this.fastify.redis.set(key, JSON.stringify(data));
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
      throw new CustomError({
        message: `SessionCache.create() method error: Unknown error ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }
}
