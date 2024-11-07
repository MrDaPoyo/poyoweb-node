const express = require('express');
const router = express.Router();
const fs = require('fs-extra'); // Use fs.promises
const path = require('path');
const dirWalker = require('./snippets/dirWalker');
const bodyParser = require('body-parser');
const checkFiles = require('./snippets/verifyFile');
const checkCreatableFolder = require('./snippets/verifyFolder');
const { isFileInsideDir } = require('./snippets/checkPath');
const multer = require('multer');
const yauzl = require('yauzl');
const startdb = require("./startdb");

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const fullFilePath = file.originalname; // Multer provides the full file path with folder structure
            const basePath = path.join('websites', 'users', req.user.username);

            // Ensure the directories exist using fs-extra's mkdirp
            const fullUploadPath = path.join(basePath, path.dirname(fullFilePath));

            // Ensure the upload path is inside the user's base directory
            if (!isFileInsideDir(fullUploadPath, basePath)) {
                return cb(new Error("HA! Good try, Hacker :3"));
            }

            await fs.mkdirp(fullUploadPath); // Use fs-extra's mkdirp for recursive directory creation

            cb(null, fullUploadPath); // Store the file in the correct directory
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
    	console.log("Saving file as:", path.basename(file.originalname)); // Log the filename being saved
          cb(null, Date.now() + '-' + file.originalname); // Unique filename
        },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
          cb(null, true);
        } else {
          cb(new Error('Only ZIP files are allowed.'));
        }
      }
});

const upload = multer({ storage: storage });

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
    try {
        const dirPath = "websites/users/" + await req.user.username + (req.query.dir ? "/" + req.query.dir : "");
        if (dirPath.includes("..")) {
            res.status(404).send("HA! Good try, Hacker :3");
        } else {
            const results = await dirWalker("websites/users/" + req.user.username, dirPath);
            const pastDir = path.relative("websites/users/" + req.user.username, path.dirname(dirPath));
            const cleanPath = path.relative("websites/users/" + req.user.username, dirPath);

            res.render('dashboard', {
                files: await results,
                jsonFiles: JSON.stringify(await results),
                past: pastDir,
                cleanPath,
                dashboard: (dirPath === "websites/users/" + req.user.username || cleanPath === "/"),
                title: "Dashboard",
                suffix: process.env.SUFFIX,
            });
        }
    } catch (err) {
        res.status(404).send("Directory Not Found. Good try, Hacker :3");
    }
});

router.get('/remove', async (req, res) => {
    try {
        const filePath = `websites/users/${req.user.username}/${req.query.dir}`;
        await fs.unlink(filePath);  // Use fs.promises.unlink
        await startdb.removeFileByPath(filePath);

        if (req.query.dir.includes(".")) {
            res.redirect('/dashboard');
        } else {
            res.redirect(`/dashboard?dir=${path.dirname(req.query.dir)}`);
        }
    } catch (err) {
        await fs.rm(`websites/users/${req.user.username}/${req.query.dir}`, { recursive: true }); // Use fs.promises.rm
        res.redirect('/dashboard');
    }
});

router.post('/create', async (req, res) => {
    try {
        const username = req.user.username;
        const cleanPath = req.body.cleanPath;
        const dirName = req.body.dir;
        const dirname = path.normalize(`websites/users/${username}/${cleanPath}/${dirName}`);
		console.log(dirName);
        if (dirName.includes("..")) {
            return res.status(400).send("HA! Good try, Hacker :3");
        }

        if (dirName.length > 30) {
            return res.status(400).send("FileName too long.");
        }

        let valid = true;
        if (!dirName.includes(".")) {
            valid = await checkCreatableFolder(dirName);
        } else {
            valid = checkFiles.checkCreatableFile(dirName);
        }

        if (!(await valid)) {
            return res.status(400).send("File type not allowed. D:"+ valid);
        }

        if (!dirName.includes(".")) {
            await fs.mkdir(dirname, { recursive: true });  // Use fs.promises.mkdir
        } else {
            await fs.writeFile(dirname, '');  // Use fs.promises.writeFile
        }

        res.redirect(`/dashboard/?dir=${cleanPath}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating file/directory.");
    }
});

const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_FILES = 1000;

router.post('/zip-upload', upload.single("zipFile"), (req, res) => {
    const filePath = req.file.path;
    const extractPath = path.join('websites/users/', req.user.username, req.query.dir || '');
    const userID = req.user.id; // Assuming req.user contains the user data with an id
    let totalSize = 0;
    let fileCount = 0;
    let zipProcessingError = null;

    // Helper to clean up the zip file
    async function cleanUp() {
        try {
            await fs.remove(filePath);
        } catch (cleanupError) {
            console.error(`Failed to clean up zip file: ${filePath}`, cleanupError);
        }
    }

    // Open the uploaded zip file
    yauzl.open(filePath, { lazyEntries: true }, async (err, zipfile) => {
        if (err) {
            await cleanUp(); // Clean up the uploaded zip file
            return res.status(500).send('Error reading zip file: ' + err);
        }

        // Close the zipfile if any error occurs
        zipfile.on('error', async (zipErr) => {
            zipProcessingError = zipErr;
            zipfile.close();
        });

        zipfile.on('entry', async (entry) => {
            if (zipProcessingError) return;

            const fileName = path.join(extractPath, entry.fileName);

            // Check if it's a directory
            if (/\/$/.test(entry.fileName)) {
                // It's a directory, create it
                try {
                    await fs.mkdirp(fileName); // Use fs-extra's mkdirp
                    zipfile.readEntry();
                } catch (err) {
                    console.error(`Failed to create directory: ${fileName}`, err);
                    zipProcessingError = err;
                    zipfile.close();
                    res.status(500).send('Error creating directory.');
                    return;
                }
            } else {
                // Handle the file extraction
                zipfile.openReadStream(entry, (err, readStream) => {
                    if (err) {
                        console.error(`Error opening read stream for: ${fileName}`, err);
                        zipProcessingError = err;
                        zipfile.readEntry();
                        return;
                    }

                    let fileSize = 0;
                    const writeStream = fs.createWriteStream(fileName);

                    readStream.on('data', (chunk) => {
                        fileSize += chunk.length;
                        totalSize += chunk.length;
                        if (totalSize > MAX_TOTAL_SIZE || fileCount >= MAX_FILES) {
                            zipProcessingError = new Error('Exceeded size or file count limit.');
                            zipfile.close();
                            writeStream.destroy(); // Stop writing the current file
                            readStream.destroy(); // Stop reading further data
                            return;
                        }
                    });

                    // Pipe the file data
                    readStream.pipe(writeStream);			
                    readStream.on('end', async () => {
                        fileCount++;
                        // Add/Update the file record in the database
                        const updatedData = {
                            fileName: entry.fileName,
                            filePath: fileName,
                            fileLocation: extractPath,
                            fileSize: entry.uncompressedSize,
                            status: 'active',
                            userID: await startdb.getUserIDByName(req.user.username)
                        };
                        
                        startdb.insertFileInfo(await startdb.getFileIDByPath(fileName) || null, updatedData); // Insert or update the file in the DB

                        zipfile.readEntry(); // Continue with the next entry
                    });

                    // Handle write stream errors
                    writeStream.on('error', (writeErr) => {
                        console.error(`Error writing file: ${fileName}`, writeErr);
                        zipProcessingError = writeErr;
                        zipfile.close();
                    });
                });
            }
        });

        // Handle the end of zip processing
        zipfile.on('end', async () => {
            if (zipProcessingError) {
                await cleanUp(); // Clean up zip and partially extracted files
                return res.status(500).send('Error processing zip file: ' + zipProcessingError.message);
            }

            try {
                await cleanUp(); // Ensure the zip file is deleted
                res.status(200).send("Zip file successfully uploaded and extracted!");
            } catch (cleanupErr) {
                console.error(`Failed to delete the zip file: ${filePath}`, cleanupErr);
                res.status(500).send('Error during cleanup.');
            }
        });

        zipfile.readEntry(); // Start reading entries
    });
});

router.post('/editName', async (req, res) => {
    try {
        var newName = req.body.newName.replace(/ /g, "_").replace(/[\\/]/g, "");
        var currentPath = req.body.path || "";
        const cleanPath = req.body.cleanPath;
		if (newName.includes(".")) {
			var valid = await checkFiles.checkEditableFile(newName);
		} else {
			var valid = await checkCreatableFolder(newName); 
		}
        const oldPath = path.join("websites/users/", req.user.username, cleanPath);
        const newPath = path.join("websites/users/", req.user.username, currentPath, newName);

        // Check if the old and new paths are within the allowed user directory
        const baseDir = path.join("websites/users/", req.user.username);

        if (!isFileInsideDir(oldPath, baseDir) || !isFileInsideDir(newPath, baseDir)) {
            return res.status(404).send("HA! Good try, Hacker :3");
        }

        if (newName.includes("..")) {
            return res.status(404).send("HA! Good try, Hacker :3");
        }
		if (await valid) {
        await fs.rename(oldPath, newPath);  // Use fs.promises.rename
        res.redirect('/dashboard/?dir=' + currentPath);
        } else {
        	res.status(403).send("Forbidden name/extension");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error renaming file/directory.");
    }
});

module.exports = router;
