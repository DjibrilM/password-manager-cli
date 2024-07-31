const { program } = require("commander");
const { create,list } = require("../commands/password");

program
  .command("add-password")
  .description("Store a new password into the database")
  .action(create);

program.command("list").description("List all stored passwords").action(list);

if (!process.argv[2]) {
  program.outputHelp();
}
