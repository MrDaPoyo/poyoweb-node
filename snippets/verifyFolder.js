const fs = require('fs');

function verifyFolderName(folderName) {
    // Check if folder name is empty
    if (!folderName) {
        return false;
    }

    // Check if folder name contains any invalid characters
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;
    if (invalidChars.test(folderName)) {
        return false;
    }

    // Check if folder already exists
    if (fs.existsSync(folderName)) {
        return false;
    }
    return true;
}

module.exports = verifyFolderName;