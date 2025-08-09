import { ZodObject } from "zod";
import { BadRequestError } from "../error-handler";
import { FastifyReply, FastifyRequest, RouteGenericInterface } from "fastify";

export default function validateResource(schema: ZodObject) {
  return async <T extends RouteGenericInterface>(
    req: FastifyRequest<T>,
    _reply: FastifyReply
  ) => {
    const { success, data, error } = schema.safeParse({
      params: req.params,
      body: req.body,
      query: Object.assign({}, req.query),
    });

    if (success) {
      req.params = data.params;
      req.body = data.body;
      req.query = data.query;
    } else {
      throw new BadRequestError(
        `validateResource middleware error: ${
          error.issues[0].message
        }. At: ${error.issues[0].path.toString()}`
      );
    }
  };
}
