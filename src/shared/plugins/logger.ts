import pino, { Level } from "pino";
import rfs from "rotating-file-stream";
import path from "path";
import fs from "fs";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

export interface LoggerOptions {
  level?: Level;
  serviceName?: string;
}

export function loggerPlugin(
  fastify: FastifyInstance,
  options: LoggerOptions & FastifyPluginOptions
) {
  // Tạo thư mục logs nếu chưa tồn tại
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Tạo logger với multiple streams
  const logger = pino(
    {
      level: "info",
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
      },
      // serializers: {
      //   req: pino.stdSerializers.req,
      //   res: pino.stdSerializers.res,
      //   err: pino.stdSerializers.err,
      // },
      // base: {
      //   pid: process.pid,
      //   hostname: require("os").hostname(),
      //   service: options.serviceName || "fastify-app",
      // },
    },
    pino.multistream([{ stream: process.stdout }])
  );
  logger.info("plugin pino");

  // Đăng ký logger với Fastify
  // fastify.decorateRequest("logger1", logger);
  fastify.decorate("logger1", logger);

  // Hook để log tất cả requests
  fastify.addHook("onRequest", async (request, reply) => {
    console.log("first");
    logger.info(
      {
        method: request.method,
        url: request.url,
        userAgent: request.headers["user-agent"],
        ip: request.ip,
      },
      "Incoming request"
    );
  });

  // // Hook để log responses
  // fastify.addHook("onResponse", async (request, reply) => {
  //   const responseTime = reply.getResponseTime();

  //   request.log.info(
  //     {
  //       method: request.method,
  //       url: request.url,
  //       statusCode: reply.statusCode,
  //       responseTime: `${responseTime}ms`,
  //       ip: request.ip,
  //     },
  //     "Request completed"
  //   );
  // });

  // // Hook để log errors
  // fastify.addHook("onError", async (request, reply, error) => {
  //   request.log.error(
  //     {
  //       method: request.method,
  //       url: request.url,
  //       error: {
  //         message: error.message,
  //         stack: error.stack,
  //         statusCode: (error as any).statusCode || 500,
  //       },
  //       ip: request.ip,
  //     },
  //     "Request error"
  //   );
  // });
}
