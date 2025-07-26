import config from "./shared/config";
import { buildServer } from "./shared/server";

const server = buildServer();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
});

server.listen({ port: config.PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.log(`Error starting server: ${err}`);
    process.exit(1);
  }
  console.log(`Server has started with process id ${process.pid}`);
  console.log(`Server running on port ${config.PORT}`);
});
