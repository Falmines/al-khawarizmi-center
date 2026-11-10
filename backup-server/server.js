import { createServer } from "node:http";
import app from "./src/app.js";
import { closeDatabase } from "./db/db.js";

const PORT = Number(process.env.PORT) || 3000;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const server = createServer(app);

server.once("listening", () => {
  console.log(`Al-Khawarizmi Center listening at http://localhost:${PORT}`);
});

server.once("error", async (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    console.error(
      `Inspect its owner in PowerShell: Get-NetTCPConnection -LocalPort ${PORT} -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess`
    );
    console.error(
      `Inspect the process before stopping it: Get-CimInstance Win32_Process -Filter "ProcessId = <PID>" | Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine`
    );
    console.error(
      `To use another port: $env:PORT=3001; npm run dev`
    );
  } else {
    console.error("Failed to start the server:", error);
  }

  try {
    await closeDatabase();
  } catch (closeError) {
    console.error("Failed to close the database pool:", closeError);
  }
  process.exitCode = 1;
});

server.listen(PORT, "0.0.0.0");

function shutdown(signal) {
  console.log(`${signal} received; closing the server.`);
  server.close((error) => {
    if (error) {
      console.error("Failed to close the server cleanly:", error);
      process.exitCode = 1;
    }
    closeDatabase().catch((closeError) => {
      console.error("Failed to close the database pool:", closeError);
      process.exitCode = 1;
    });
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
