const path = require("path");
const fs = require("fs");


const checkFile = (filePath, initialDate) => {
    const constructedPath = path.join(__dirname, '..' , filePath)
    const checkExistance = fs.existsSync(constructedPath);

    if (!checkExistance) fs.writeFileSync(constructedPath, initialDate, "utf8");
};

module.exports = checkFile;
