import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest } from "fastify";
import cryptoCookie from "@/shared/crypto";

interface SessionOptions {
  cookieName?: string;
  secret: string;
}

async function session(fastify: FastifyInstance, options: SessionOptions) {
  const { cookieName = "sid", secret } = options;

  fastify.decorate("user");

  fastify.addHook("onRequest", async (req: FastifyRequest) => {
    const session = req.cookies.get(cookieName);
    if (!session) return;
    const sessionKey = cryptoCookie.decrypt(session);
    const sessionData = await req.session.getByKey(sessionKey);
    if (!sessionData) return;
    const user = await req.user.findById(sessionData.userId);
    if (user) {
      req.currUser = user;
    }
  });
}

export default fp(session, {
  name: "sessionPlugin",
});
