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

const SCAN_COUNT = 100;

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
      throw new CustomError({
        message: `SessionRepo.create() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async findByKey(key: string): Promise<SessionData | null> {
    try {
      const sessionCache = await this.fastify.redis.get(key);
      if (!sessionCache) return null;
      return JSON.parse(sessionCache) as SessionData;
    } catch (error) {
      throw new CustomError({
        message: `SessionRepo.getByKey() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async refresh(key: string): Promise<SessionData | null> {
    try {
      const session = await this.fastify.redis.get(key);
      if (!session) return null;
      const sessionData: SessionData = JSON.parse(session);
      const now = Date.now();
      const expires: Date = new Date(now + config.SESSION_MAX_AGE);
      sessionData.lastAccess = new Date(now);
      sessionData.cookie.expires = expires;
      await this.fastify.redis.set(
        key,
        JSON.stringify(sessionData),
        "PX",
        expires.getTime() - Date.now()
      );
      return sessionData;
    } catch (error: unknown) {
      throw new CustomError({
        message: `SessionRepo.refresh() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  private async findKeysByPattern(pattern: string) {
    let cursor: string = "0";
    const results: string[] = [];
    try {
      do {
        const [nextCursor, keys] = await this.fastify.redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          SCAN_COUNT
        );
        cursor = nextCursor;
        results.push(...keys);
      } while (cursor !== "0");
      return results;
    } catch (error: unknown) {
      throw new CustomError({
        message: `SessionRepo.findKeysByPattern() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async findByUserId(userId: string): Promise<SessionData[]> {
    const keys = await this.findKeysByPattern(
      `${config.SESSION_KEY_NAME}:${userId}:*`
    );

    try {
      const data: SessionData[] = [];
      for (const key of keys) {
        const session = await this.findByKey(key);
        if (!session) continue;
        data.push(session);
      }

      return data;
    } catch (error) {
      throw new CustomError({
        message: `SessionRepo.findByUserId() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }

  async deleteByKey(key: string) {
    try {
      await this.fastify.redis.del(key);
    } catch (error) {
      throw new CustomError({
        message: `SessionRepo.deleteByKey() method error: ${error}`,
        statusCode: StatusCodes.BAD_REQUEST,
        statusText: "BAD_REQUEST",
      });
    }
  }
}
