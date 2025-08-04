import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest } from "fastify";

async function cookie(fastify: FastifyInstance, options: CookieOptions = {}) {
  fastify.decorateRequest("cookies");
  fastify.addHook("onRequest", async (req: FastifyRequest) => {
    req.cookies = parseCookies(req.headers.cookie);
  });

  const defaultOptions = options;

  fastify.decorateReply(
    "setCookie",
    function (name: string, value: string, options?: CookieOptions) {
      const cookieOptions = { ...defaultOptions, ...options };

      const cookieString = serializeCookie(name, value, cookieOptions);

      const existingCookies = this.getHeader("Set-Cookie") || [];

      const cookiesArray = Array.isArray(existingCookies)
        ? existingCookies
        : [existingCookies];

      cookiesArray.push(cookieString);
      this.header("Set-Cookie", cookiesArray);

      return this;
    }
  );

  fastify.decorateReply("clearCookie", function (name: string) {
    return this.setCookie(name, "", {
      maxAge: 0,
    });
  });
}

function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const {
    maxAge,
    expires,
    httpOnly = false,
    secure = false,
    sameSite = "lax",
    path = "/",
    domain,
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (maxAge) {
    cookie += `; Max-Age=${Math.floor(maxAge / 1000)}`;
  }

  if (expires) {
    cookie += `; Expires=${expires.toUTCString()}`;
  }

  if (httpOnly) {
    cookie += "; HttpOnly";
  }

  if (secure) {
    cookie += "; Secure";
  }

  if (sameSite) {
    cookie += `; SameSite=${sameSite}`;
  }

  if (path) {
    cookie += `; Path=${path}`;
  }

  if (domain) {
    cookie += `; Domain=${domain}`;
  }

  return cookie;
}

function parseCookies(cookieHeader?: string): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;
  cookieHeader.split("; ").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=").map(decodeURIComponent);
    if (name && value && typeof name == "string" && typeof value == "string") {
      cookies.set(name, value);
    }
  });
  return cookies;
}

export default fp(cookie, {
  name: "cookiePlugin",
});
