const { program } = require("commander");
const { register } = require("../commands/user");
const colors = require("colors");

program
  .command("register")
  .description("Register the master password 🔐")
  .action(register);

if (!process.argv[2]) {
  program.outputHelp();
}
