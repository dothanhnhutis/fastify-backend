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

  const {
    connectOpts,
    reconnectInterval = 5000,
    maxReconnectAttempts = null,
  } = options;

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function reconnect() {
    while (!connection) {
      try {
        if (maxReconnectAttempts && maxReconnectAttempts <= reconnectAttempts) {
          fastify.logger.error(
            `RabbitMQ - Đã vượt quá số lần thử kết nối tối đa (${maxReconnectAttempts})`
          );
          break;
        }

        reconnectAttempts++;
        fastify.logger.info(
          `RabbitMQ - Sẽ thử kết nối lại sau ${reconnectInterval}ms (lần thử: ${reconnectAttempts})`
        );
        await sleep(reconnectInterval);
        await connect();
      } catch (error) {
        fastify.logger.warn(`RabbitMQ - Lần thử ${reconnectAttempts} thất bại`);
      }
    }
  }

  async function connect() {
    if (isConnecting || connection) return;
    isConnecting = true;

    try {
      connection = await amqplib.connect(connectOpts);
      reconnectAttempts = 0;

      fastify.logger.info("RabbitMQ - Kết nối AMQP thành công");

      connection.on("close", async () => {
        fastify.logger.warn("RabbitMQ - Kêt nối AMQP đã bị đóng");
        connection = null;
        await reconnect();
      });

      connection.on("error", () => {
        fastify.logger.error("RabbitMQ - AMQP connection error");
        connection = null;
      });

      // listener
    } catch (error) {
      throw error;
    } finally {
      isConnecting = false;
    }
  }

  fastify.addHook("onReady", async () => {
    try {
      await connect();
    } catch (error) {
      fastify.logger.error("RabbitMQ - Không thể kết nối tới AMQP server");
      throw new CustomError({
        message: "RabbitMQ - Không thể kết nối tới AMQP server",
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        statusText: "SERVICE_UNAVAILABLE",
      });
    }
  });

  // fastify.decorate("amqp", {});

  fastify.addHook("onClose", async () => {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        fastify.logger.warn("Lỗi khi đóng connection:");
      }
      connection = null;
    }

    fastify.logger.info("AMQP connection đã được đóng");
  });
}
export default fp(amqpPlugin, {
  name: "amqpPlugin",
});
