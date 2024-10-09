const fs = require('fs').promises;
const path = require('path');

async function verifyFolderName(folderName) {
    // Check if folder name is empty or only contains whitespace
    if (!folderName || !folderName.trim()) {
        return false;
    }

    // Disallow slashes (/) and dots (.) and allow only alphanumeric characters, underscores, and dashes
    const validFolderName = /^[A-Za-z0-9_-]+$/;

    // Check if the folder name contains only valid characters
    if (!validFolderName.test(folderName)) {
        return false;
    }

    // Normalize the folder path to avoid path traversal
    const normalizedFolderName = path.normalize(folderName);

    try {
        // Check if folder already exists using fs.promises
        await fs.access(normalizedFolderName);
        return false; // Folder exists, so return false
    } catch (err) {
        // Folder doesn't exist, which is the expected outcome
        if (err.code === 'ENOENT') {
            return true; // Folder is valid and doesn't exist
        }
        // Handle other unexpected errors
        console.error(err);
        return false;
    }
}

module.exports = verifyFolderName;
