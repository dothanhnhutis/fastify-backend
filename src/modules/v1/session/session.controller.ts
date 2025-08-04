import { StatusCodes } from "http-status-codes";
import { FastifyReply, FastifyRequest } from "fastify";
import { SessionData } from "@/db/repositories/session.repo";
import { UAParser } from "ua-parser-js";

const safeStringify = (obj: any) => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "function" || value === undefined) {
      return null;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
};
const cleanCookieOptions = (cookie: CookieOptions): CookieOptions => {
  return {
    ...(cookie.maxAge !== undefined && { maxAge: cookie.maxAge }),
    ...(cookie.expires && { expires: cookie.expires }),
    ...(cookie.httpOnly !== undefined && { httpOnly: cookie.httpOnly }),
    ...(cookie.path && { path: cookie.path }),
    ...(cookie.domain && { domain: cookie.domain }),
    ...(cookie.secure !== undefined && { secure: cookie.secure }),
    ...(cookie.sameSite && { sameSite: cookie.sameSite }),
    ...(cookie.priority && { priority: cookie.priority }),
  };
};
const sanitizeSessionData = (session: SessionData): any => {
  const parser = new UAParser(session.userAgent.ua || "");

  return {
    id: session.id,
    provider: session.provider,
    userId: session.userId,
    cookie: cleanCookieOptions(session.cookie),
    ip: session.ip,
    userAgent: {
      ua: parser.getUA(),
      browser: parser.getBrowser(),
      engine: parser.getEngine(),
      os: parser.getOS(),
      device: parser.getDevice(),
      cpu: parser.getCPU(),
    },
    lastAccess: session.lastAccess.toISOString(),
    createAt: session.createAt.toISOString(),
  };
};

export async function getSessionsController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = req.currUser!;
  const sessions = await req.session.findByUserId(id);

  reply
    .type("application/json")
    .code(StatusCodes.OK)
    // .header("Content-Type", "application/json; charset=utf-8")
    // .header("Accept-Encoding", "gzip,deflate,compress")
    .send(sessions);
}
