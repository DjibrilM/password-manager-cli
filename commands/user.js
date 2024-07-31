const fs = require("fs");
const colors = require("colors");
const path = require("path");
const inquirer = require("inquirer");
const Crypto = require("../library/crypto");
const checkIfMasterPasswordExists = require("../util/checkMasterPassword");
const checkFile = require("../util/fileExistanceCheck");

module.exports = {
  register: async () => {
    const prompt = inquirer.createPromptModule();

    prompt([
      {
        type: "password",
        name: "password",
        message: "Please enter your master password".green,
        validate: (answer) => {
          // Check if the trimmed string has at least 5 non-whitespace characters
          const regex = /^\S{5,}$/;
          if (!regex.test(answer)) {
            return "Password must be at least 5 characters long.";
          } else {
            return true;
          }
        },
      },
    ])
      .then(({ password }) => {
        // check if the credentials file exists,
        //  if the file does not exist the bellow function will create
        //   it with all the minimum requirements.
        checkFile(
          "credential.json",
          JSON.stringify({
            password: "",
            iv: "",
            salt: "",
          })
        );

        //check if master password already exists
        if (checkIfMasterPasswordExists()) {
          console.log("Master password already created".red);
          return;
        }

        const { encryptedMessage, iv, salt } = Crypto.encrypt(password);

        const credentials = {
          password: encryptedMessage,
          iv: iv.toString("hex"),
          salt: salt.toString("hex"),
        };

        const jsonDate = JSON.stringify(credentials, null, 2);
        const credentialsFilePath = path.join(__dirname, "../credential.json");
        fs.writeFileSync(credentialsFilePath, jsonDate, "utf8");
        console.log("Master key created 🤟🏽".green);
      })
      .catch((err) => {
        console.log("Failed to create your master password 🥵".red);
        console.log(err);
      });
  },

};
