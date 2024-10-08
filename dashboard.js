const express = require('express');
const router = express.Router();
const fs = require('fs').promises; // Use fs.promises
const path = require('path');
const dirWalker = require('./snippets/dirWalker');
const bodyParser = require('body-parser');
const checkFiles = require('./snippets/verifyFile');
const checkCreatableFolder = require('./snippets/verifyFolder');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            // Extract the full file path from the original file field
            const fullFilePath = file.originalname; // Multer provides the full file path with folder structure
            const basePath = path.join('websites', 'users', req.user.username);

            // Ensure the directories exist using fs.promises.mkdir
            const fullUploadPath = path.join(basePath, path.dirname(fullFilePath));
            await fs.mkdir(fullUploadPath, { recursive: true });

            cb(null, fullUploadPath); // Store the file in the correct directory
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        cb(null, path.basename(file.originalname)); // Save file with its original name
    }
});

// Set up the multer middleware
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
                past: pastDir,
                cleanPath,
                dashboard: (dirPath === "websites/users/" + req.user.username || cleanPath === "/"),
                title: "Dashboard"
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

const MAX_SIZE_MB = 500 * 1024 * 1024; // 500 MB in bytes
const { getTotalSizeByWebsiteName, addSizeByWebsiteName } = require('./startdb');

// Updated POST route for file upload
router.post('/file-upload', upload.any(), async (req, res) => {
    let responseSent = false;

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(404).send("No file uploaded.");
        }

        const websiteName = req.user.username;
        const currentTotalSize = await getTotalSizeByWebsiteName(websiteName);
        let totalUploadedSize = req.files.reduce((sum, file) => sum + file.size, 0);

        if ((currentTotalSize + totalUploadedSize) > MAX_SIZE_MB) {
            return res.status(400).send("File upload exceeds the total folder size limit of 500 MB.");
        }

        for (const file of req.files) {
            const filePath = path.join('websites/users/', req.user.username, req.query.dir || '', file.originalname);

            if (file.originalname.includes("..")) {
                if (!responseSent) {
                    res.status(404).send("HA! Good try, Hacker :3");
                    responseSent = true;
                }
                break;
            }

            if (checkFiles.checkFileName(file.originalname)) {
                try {
                    await fs.rename(file.path, filePath);  // Use fs.promises.rename
                    await addSizeByWebsiteName(websiteName, file.size);

                    if (!responseSent) {
                        res.redirect('/dashboard/?dir=' + (req.query.dir || ''));
                        responseSent = true;
                        console.log("Uploaded: " + totalUploadedSize);
                    }
                } catch (err) {
                    console.log(err);
                    if (!responseSent) {
                        res.status(500).send("Error uploading file.");
                        responseSent = true;
                    }
                }
            } else {
                if (!responseSent) {
                    res.status(404).send("FileType not allowed.");
                    responseSent = true;
                }
                break;
            }
        }
    } catch (err) {
        console.log(err);
        if (!responseSent) {
            res.status(500).send("Error uploading file.");
        }
    }
});

router.post('/editName', async (req, res) => {
    try {
        var newName = req.body.newName.replace(/ /g, "_").replace(/[\\/]/g, "");
        var path = req.body.path || "";
        const cleanPath = req.body.cleanPath;

        var newPath = path.join("websites/users/", req.user.username, path, newName);
        var oldPath = path.join("websites/users/", req.user.username, cleanPath);

        if (newName.includes("..")) {
            return res.status(404).send("HA! Good try, Hacker :3");
        }

        await fs.rename(oldPath, newPath);  // Use fs.promises.rename
        res.redirect('/dashboard/?dir=' + path);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error renaming file/directory.");
    }
});

module.exports = router;
