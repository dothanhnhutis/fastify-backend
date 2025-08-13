import { FastifyInstance, FastifyPluginOptions } from "fastify";
import amqplib, { ChannelModel, Options } from "amqplib";
import fp from "fastify-plugin";
import { CustomError } from "../error-handler";
import { StatusCodes } from "http-status-codes";

export interface AMQPOptions extends FastifyPluginOptions {
  connectOpts: string | Options.Connect;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

async function amqpPlugin(fastify: FastifyInstance, options: AMQPOptions) {
  let connection: ChannelModel | null = null;
  let isConnecting = false;
  let reconnectAttempts = 0;
  let shouldReconnect = true;

  const {
    connectOpts = "amqp://localhost",
    reconnectInterval = 5000,
    maxReconnectAttempts = null,
  } = options;

  async function reconnect() {
    try {
      reconnectAttempts++;
      fastify.log.info("RabbitMQ - Kết nối AMQP thành công");
    } catch (error) {}
  }

  async function connect() {
    if (isConnecting) return;
    isConnecting = true;

    try {
      connection = await amqplib.connect(connectOpts);
      reconnectAttempts = 0;

      fastify.log.info("RabbitMQ - Kết nối AMQP thành công");

      connection.on("close", () => {
        fastify.log.warn("RabbitMQ - AMQP connection đã bị đóng");
        connection = null;
        reconnect();
      });

      connection.on("error", (err) => {
        fastify.log.error("RabbitMQ - AMQP connection error:", err.message);
        connection = null;
      });
    } catch (error) {
      isConnecting = false;
      throw error;
    }
  }

  fastify.addHook("onReady", async () => {
    try {
      await connect();
    } catch (error) {
      fastify.logger.error(
        "RabbitMQ - Message broker temporarily unavailable. Please try again in a few moments"
      );
      throw new CustomError({
        message:
          "RabbitMQ - Message broker temporarily unavailable. Please try again in a few moments",
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        statusText: "SERVICE_UNAVAILABLE",
      });
    }
  });

  fastify.addHook("onClose", async () => {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        fastify.log.warn("Lỗi khi đóng connection:");
      }
      connection = null;
    }

    fastify.log.info("AMQP connection đã được đóng");
  });
}
export default fp(amqpPlugin, {
  name: "amqpPlugin",
});
