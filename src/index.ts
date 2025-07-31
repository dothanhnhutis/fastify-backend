import config from "./shared/config";
import { buildServer } from "./shared/server";

// const server = await buildServer();

// ["SIGINT", "SIGTERM"].forEach((signal) => {
//   process.on(signal, async () => {
//     await server.close();
//     process.exit(0);
//   });
// });

// server.listen({ port: config.PORT, host: "0.0.0.0" }, (err) => {
//   if (err) {
//     console.log(`Error starting server: ${err}`);
//     process.exit(1);
//   }
//   console.log(`Server has started with process id ${process.pid}`);
//   console.log(`Server running on port ${config.PORT}`);
// });

// Khởi tạo server
async function start(): Promise<void> {
  try {
    const server = await buildServer();

    const port = parseInt(process.env.PORT || "3000");
    const host = process.env.HOST || "0.0.0.0";

    await server.listen({ port, host });

    server.logger.info(`Server started on ${host}:${port}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

start();
