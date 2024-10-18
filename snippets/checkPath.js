const path = require('path');

// Function to check if a file is inside a directory
function isFileInsideDir(filePath, dirPath) {
    // Resolve both paths to absolute paths
    const absoluteDirPath = path.resolve(dirPath);
    const absoluteFilePath = path.resolve(filePath);

    // Get the relative path from the directory to the file
    const relative = path.relative(absoluteDirPath, absoluteFilePath);

    // If the relative path doesn't start with '..' or '/', it's inside the directory
    return !relative.startsWith('..') && !path.isAbsolute(relative);
}

module.exports = {
    isFileInsideDir
};
