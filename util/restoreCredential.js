const fs = require("fs");
const path = require("path");

const restoreCredentials = () => {
  const credentialsPath = path.join(__dirname, "../credential.json");
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));

  return {
    password: credentials.password,
    iv: Buffer.from(credentials.iv, "hex"),
    salt: Buffer.from(credentials.salt, "hex"),
  };
};

module.exports = restoreCredentials;
