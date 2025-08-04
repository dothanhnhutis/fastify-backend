import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cryptoCookie from "@/shared/crypto";
import config from "../config";

interface SessionOptions {
  cookieName?: string;
  secret: string;
  refreshCookie?: boolean;
}

async function session(fastify: FastifyInstance, options: SessionOptions) {
  const { cookieName = "sid", secret } = options;

  fastify.decorate("user");
  fastify.decorateRequest("sessionId", null);

  fastify.addHook(
    "onRequest",
    async (req: FastifyRequest, res: FastifyReply) => {
      const session = req.cookies.get(cookieName);
      if (!session) return;
      const sessionKey = cryptoCookie.decrypt(session);
      const sessionData = await req.session.findByKey(sessionKey);
      if (!sessionData) return;
      const user = await req.user.findById(sessionData.userId);
      if (!user) {
        res.clearCookie(config.SESSION_KEY_NAME);
      } else {
        req.sessionKey = sessionKey;
        const refreshSession = await req.session.refresh(sessionKey);
        req.currUser = user;
        if (refreshSession) {
          res.setCookie(
            config.SESSION_KEY_NAME,
            cryptoCookie.encrypt(sessionKey),
            refreshSession.cookie
          );
        }
      }
    }
  );
}

export default fp(session, {
  name: "sessionPlugin",
});
