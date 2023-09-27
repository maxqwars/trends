import { Command } from "commander";
import { startServer } from "./web/startServer";

const cmd = new Command();

cmd
  .command("run-web-ui")
  .option("--port <port>")
  .action(({ port }) => {
    startServer(Number(port));
  });

cmd.parse();
