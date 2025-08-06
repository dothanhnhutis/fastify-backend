import { ZodObject, ZodError } from "zod";
import { BadRequestError } from "../error-handler";
import { preHandlerMetaHookHandler } from "fastify/types/hooks";
import { FastifyReply, FastifyRequest, RouteGenericInterface } from "fastify";

export default function validateResource(schema: ZodObject) {
  return async <T extends RouteGenericInterface>(
    req: FastifyRequest<T>,
    _reply: FastifyReply
  ) => {
    const { success, data, error } = schema.safeParse({
      params: req.params,
      body: req.body,
      query: req.query,
    });
    if (success) {
      req = {
        ...req,
        ...data,
      };
    } else {
      throw new BadRequestError(
        `validateResource middleware error: ${
          error.issues[0].message
        }. At: ${error.issues[0].path.toString()}`
      );
    }
  };
}
