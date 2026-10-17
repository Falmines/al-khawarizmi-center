import app from "./src/app.js";

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Al-Khawarizmi Center is running at http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Failed to start the server:", error);
  process.exitCode = 1;
});

function shutdown(signal) {
  console.log(`${signal} received; closing the server.`);
  server.close((error) => {
    if (error) {
      console.error("Failed to close the server cleanly:", error);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
