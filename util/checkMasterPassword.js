const path = require("path");
const fs = require("fs");
const checkIfMasterPasswordExists = () => {
  const credentialsFilePath = path.join(__dirname, "../credential.json");
  const credentials = fs.readFileSync(credentialsFilePath, "utf8");
  if (!credentials) return false;

  if (JSON.parse(credentials).password.length > 0) {
    return true;
  } else {
    return false;
  }
};

module.exports = checkIfMasterPasswordExists;
