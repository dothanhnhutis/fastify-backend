import { FastifyRequest, FastifyReply } from "fastify";
import { NotAuthorizedError } from "../error-handler";

export default async function requiredAuthMiddleware(
  req: FastifyRequest,
  reply: FastifyReply
) {
  if (!req.currUser) {
    throw new NotAuthorizedError();
  }
}
