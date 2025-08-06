import { ZodObject, ZodError } from "zod";
import { BadRequestError } from "../error-handler";
import { preHandlerMetaHookHandler } from "fastify/types/hooks";
import { FastifyReply, FastifyRequest } from "fastify";

const validateResource =
  (schema: ZodObject): preHandlerMetaHookHandler =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      schema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          `${error.issues[0].message}. At: ${error.issues[0].path.toString()}`
        );
      }
      throw error;
    }
  };
export default validateResource;
