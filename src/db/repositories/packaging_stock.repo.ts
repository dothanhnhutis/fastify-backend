import { FastifyRequest } from "fastify";

export default class PackagingStockRepo {
  constructor(private req: FastifyRequest) {}

  async findById(id: string) {}
}
