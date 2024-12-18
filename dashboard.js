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
          cb(null, file.originalname); // Unique filename
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
                dashboard: (dirPath === "websites/users/" + req.user.username || cleanPath === "/" || cleanPath === "."),
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
        await fs.rm(filePath);  // Use fs.promises.unlink
        await startdb.removeFileByPath(filePath);
        res.redirect(`/dashboard?dir=${path.dirname(req.query.dir)}`);
    } catch (err) {
    	try {
    		const filePath = `websites/users/${req.user.username}/${req.query.dir}`;
    		fs.remove(filePath);
    		res.redirect(`/dashboard?dir=${path.dirname(req.query.dir)}`);
    	} catch (err) {
    		console.log(err);
        	await fs.rm(`websites/users/${req.user.username}/${req.query.dir}`, { recursive: true }); // Use fs.promises.rm
        	res.redirect('/dashboard');
        }
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

router.post('/zip-upload', upload.single("zipFile"), async (req, res) => {
    const filePath = req.file.path;
    const extractPath = path.join('websites/users/', req.user.username, req.query.dir || '');
    let totalSize = 0;
    let fileCount = 0;
    const MAX_TOTAL_SIZE = 450 * 1024 * 1024; // Example max size of 450 MB
    const MAX_FILES = 100; // Example max file count
    let zipProcessingError = null;

    // Helper function for cleanup
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
            await cleanUp();
            return res.status(500).send('Error reading zip file: ' + err);
        }

        // Handle errors while processing the zip file
        zipfile.on('error', async (zipErr) => {
            zipProcessingError = zipErr;
            zipfile.close();
        });

        // Process each entry in the zip file
        zipfile.on('entry', async (entry) => {
            if (zipProcessingError) return;

            const fileName = path.join(extractPath, entry.fileName);

            // Check if it's a directory
            if (/\/$/.test(entry.fileName)) {
                try {
                    await fs.mkdirp(fileName);
                    zipfile.readEntry();
                } catch (err) {
                    console.error(`Failed to create directory: ${fileName}`, err);
                    zipProcessingError = err;
                    zipfile.close();
                    res.status(500).send('Error creating directory.');
                    return;
                }
            } else {
                // Handle file extraction
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
                            writeStream.destroy();
                            readStream.destroy();
                            return;
                        }
                    });

                    readStream.pipe(writeStream);

                    readStream.on('end', async () => {
                        fileCount++;
                        zipfile.readEntry();
                    });

                    writeStream.on('error', (writeErr) => {
                        console.error(`Error writing file: ${fileName}`, writeErr);
                        zipProcessingError = writeErr;
                        zipfile.close();
                    });
                });
            }
        });

        // When zip processing is complete
        zipfile.on('end', async () => {
            if (zipProcessingError) {
                await cleanUp();
                return res.status(500).send('Error processing zip file: ' + zipProcessingError.message);
            }

            try {
                await cleanUp();
                res.status(200).send("OMG IT WORKS!");
            } catch (cleanupErr) {
                console.error(`Failed to delete the zip file: ${filePath}`, cleanupErr);
                res.status(500).send('Error during cleanup.');
            }
        });

        zipfile.readEntry();
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
        } else if (newName.includes("..")) {
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
