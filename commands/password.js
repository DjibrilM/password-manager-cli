const { Table } = require("console-table-printer");
const inquirer = require("inquirer");
const crypto = require("../library/crypto");
const fs = require("fs");
const path = require("path");

const { forceExitErrorMessage } = require("../util/constants");
const checkFile = require("../util/fileExistanceCheck");
const restoreCredentials = require("../util/restoreCredential");
const checkIfMasterPasswordExists = require("../util/checkMasterPassword");

const verifyMasterPassword = (answer) => {
  if (!checkIfMasterPasswordExists()) {
    console.log("No master password found".red);
    process.exit();
  }

  const { password, iv, salt } = restoreCredentials();
  const compare = crypto.compare(answer, iv, salt, password);

  if (compare) {
    return true;
  } else {
    console.log("\nIncorrect master password 💬".red);
    process.exit();
  }
};

const deriveKey = (message) => {
  const userCredentialsPath = path.join(__dirname, "../", "credential.json");
  const credentials = JSON.parse(fs.readFileSync(userCredentialsPath, "utf-8"));
  const key = crypto.deriveKey(
    message,
    Buffer.from(Buffer.from(credentials.salt, "hex"))
  );

  return {
    key,
    salt: credentials.salt,
    iv: credentials.iv,
  };
};

module.exports = {
  create: () => {
    const prompt = inquirer.createPromptModule();
    prompt([
      {
        default: "",
        type: "password",
        name: "verifyMasterPassword",
        message: "Please verify your master password".blue,
        validate: verifyMasterPassword,
      },

      {
        type: "input",
        name: "title",
        message: "Please provide the password title".blue,
        validate: (answer) => {
          const regex = /^.{5,}$/;
          if (!regex.test(answer)) {
            return "Password's title must be at least 5 characters long.";
          } else {
            return true;
          }
        },
      },

      {
        type: "password",
        name: "password",
        message: "Please enter the new password".blue,
        validate: (answer) => {
          const regex = /^\S{5,}$/;
          if (!regex.test(answer)) {
            return "Password must be at least 5 characters long.";
          } else {
            return true;
          }
        },
      },
    ])
      .then(({ password, title, verifyMasterPassword }) => {
        const { key } = deriveKey(verifyMasterPassword);
        const { encryptedMessage, iv, authTag } = crypto.encryptChildPassword(
          password,
          key
        );

        const passwordsFilePath = path.join(__dirname, "..", "passwords.json");

        // check if the passwords file exists,
        //  if the file does not exist the bellow function will create
        //   it with all the minimum requirements.
        checkFile("passwords.json", JSON.stringify({ passwords: [] }));

        const newPassword = {
          password: encryptedMessage,
          iv: iv.toString("hex"),
          title: title,
          authTag: authTag.toString("hex"),
        };

        const passwords = JSON.parse(
          fs.readFileSync(passwordsFilePath, "utf-8")
        );

        passwords.passwords.push(newPassword);
        const jsonDate = JSON.stringify(passwords, null, 2);

        fs.writeFileSync(passwordsFilePath, jsonDate, "utf8");
        console.log("Password successfully created✅");
      })
      .catch((err) => {
        console.log(err);
        if (err.message === forceExitErrorMessage) {
          console.log("Process closed".yellow);
        }
      });
  },

  list: () => {
    const prompt = inquirer.createPromptModule();
    prompt([
      {
        default: () => "",
        type: "password",
        name: "password",
        message: "Please enter your master password".green,
        validate: verifyMasterPassword,
      },
    ])
      .then(({ password }) => {
        const passwordFilePath = path.join(__dirname, "../", "passwords.json");
        const checkExistance = fs.existsSync(passwordFilePath); //Check if the file containing passwords exists

        if (!checkExistance) {
          console.log("\n");
          console.log("No password saved yet 💤".blue);
          console.log("\n");
          return;
        }

        const passwords = JSON.parse(
          fs.readFileSync(passwordFilePath, "utf-8")
        );

        const { key } = deriveKey(password);
        const table = new Table();

        passwords.passwords.forEach((element) => {
          const password = crypto.decrypt(
            element.password,
            key,
            Buffer.from(element.iv, "hex"),
            Buffer.from(element.authTag, "hex")
          );

          table.addRow({
            ["title".yellow]: element.title,
            ["password".yellow]: password.green,
            ["iv".yellow]: element.iv,
          });
        });

        table.printTable();
      })
      .catch((err) => {
        console.log(err);
        if (err.message === forceExitErrorMessage) {
          console.log("Process closed".yellow);
        }
      });
  },
};
