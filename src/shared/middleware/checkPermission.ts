import { FastifyReply, FastifyRequest, RouteGenericInterface } from "fastify";
import { PermissionError } from "../error-handler";

export default function checkPermissionMiddleware(permissions: string[]) {
  return async <T extends RouteGenericInterface>(
    req: FastifyRequest<T>,
    reply: FastifyReply
  ) => {
    if (!req.currUser) throw new PermissionError();
    const roles = await req.users.findRoles(req.currUser.id);
    const pers: string[] = Array.from(
      new Set(roles.flatMap(({ permissions }) => permissions))
    );

    if (permissions.every((per) => !pers.includes(per)))
      throw new PermissionError();
  };
}
