#!/usr/bin/env node

// Above, we are explicitly giving the absolute path of interpreter. Not all operating systems have node in the bin folder, but all should have env. You can tell the OS to run env with node as parameter:
const { program } = require("commander");
const { version } = require("../package.json");

const user = require("./user"); // All commands related the user management
const password = require("./password"); // All commands related to passwords management

program
  .name("Node.js password manager")
  .description("Minimalistic password manager built with node.js")
  .version(version)
  .parse(process.argv);
