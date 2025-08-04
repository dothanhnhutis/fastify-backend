import { FastifyInstance } from "fastify";

export default async function sessionRoutes(fastify: FastifyInstance) {
  fastify.get("/", () => {});
}
