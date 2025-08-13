import { FastifyInstance, FastifyPluginOptions } from "fastify";
import amqplib, { Options } from "amqplib";
import fp from "fastify-plugin";

export interface AMQPOptions extends FastifyPluginOptions {
  connectOpts: string | Options.Connect;
}

async function amqpPlugin(fastify: FastifyInstance, options: AMQPOptions) {
  console.log(options.connectOpts);
  const connection = await amqplib.connect(options.connectOpts);

  connection.on("close", () => {
    console.log("close");
  });

  fastify.addHook("onReady", async () => {
    // console.log(connection);
  });

  fastify.addHook("onClose", async () => {});
}
export default fp(amqpPlugin, {
  name: "amqpPlugin",
});
