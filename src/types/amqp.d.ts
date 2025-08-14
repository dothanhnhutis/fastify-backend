import { ChannelModel } from "amqplib";

declare module "fastify" {
  interface FastifyInstance {
    amqp: ChannelModel;
  }
}
