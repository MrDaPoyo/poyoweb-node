const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const dirWalker = require('./snippets/dirWalker');
const bodyParser = require('body-parser');
const checkFiles = require('./snippets/verifyFile');
const checkCreatableFolder = require('./snippets/verifyFolder');

const multer = require('multer');

// Configure multer to store files, preserving folder structure
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const relativePath = req.body.uploadPath || '';
            const basePath = path.join('websites', 'users', req.user.username); 
            const fullUploadPath = path.join(basePath, relativePath);

            // Ensure the directories exist
            await fs.promises.mkdir(fullUploadPath, { recursive: true });
            cb(null, fullUploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Save the file with its original name
        cb(null, file.originalname);
    }
});

// Set up the multer middleware
const upload = multer({ storage: storage });

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
    try {
        const dirPath = "websites/users/" + await req.user.username + (req.query.dir ? "/" + req.query.dir : "");
        if (dirPath.includes("..")) {
            res.send("HA! Good try, Hacker :3", 404);
        } else {
            const results = await dirWalker("websites/users/" + await req.user.username, dirPath);
            const pastDir = path.relative("websites/users/" + req.user.username, path.dirname(dirPath));
            const cleanPath = path.relative("websites/users/" + req.user.username, dirPath);

            res.render('dashboard', { files: await results, past: pastDir, cleanPath, dashboard: (dirPath == "websites/users/" + await req.user.username || cleanPath == "/"), title: "Dashboard" });
        }
    } catch (err) {
        res.send("Directory Not Found. Good try, Hacker :3");
    }
});

router.get('/remove', (req, res) => {
    try {
        fs.unlinkSync("websites/users/" + req.user.username + "/" + req.query.dir);
        if (req.query.dir.includes(".")) {
            res.redirect(`/dashboard`);
        }
        res.redirect(`/dashboard?dir=${path.dirname(req.query.dir)}`);
    } catch (err) {
        fs.rmSync("websites/users/" + req.user.username + "/" + req.query.dir, { recursive: true });
    }
});

router.post('/create', async (req, res) => {
    try {
        // Sanitize input and construct the directory path
        const username = req.user.username;
        const cleanPath = req.body.cleanPath;
        const dirName = req.body.dir;

        // Prevent directory traversal attacks by using path.join and normalizing the path
        const dirname = path.normalize(`websites/users/${username}/${cleanPath}/${dirName}`);

        // Basic validation checks
        if (dirName.includes("..")) {
            return res.status(400).send("HA! Good try, Hacker :3");
        }

        if (dirName.length > 30) {
            return res.status(400).send("FileName too long.");
        }

        // Check if it's a directory or a file based on the presence of a dot
        let valid;
        if (!dirName.includes(".")) {
            valid = checkCreatableFolder(dirname); // Check if it's a valid directory
        } else {
            valid = checkFiles.checkCreatableFile(dirname); // Check if it's a valid file
        }

        // Handle invalid file types
        if (!valid) {
            return res.status(400).send("File type not allowed.");
        }

        // Create the directory or file
        if (!dirName.includes(".")) {
            // Directory creation
            fs.mkdirSync(dirname, { recursive: true });
        } else {
            // File creation
            fs.writeFileSync(dirname, '');
        }

        // Redirect on success
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

        const websiteName = await req.user.username;  // Get the website name from the request (e.g., via query param)

        // Get the current total size of the website's folder
        const currentTotalSize = await getTotalSizeByWebsiteName(websiteName);

        // Calculate total size of uploaded files
        let totalUploadedSize = req.files.reduce((sum, file) => sum + file.size, 0);

        // Check if adding the new files exceeds the 500 MB limit
        if ((currentTotalSize + totalUploadedSize) > MAX_SIZE_MB) {
            return res.status(400).send("File upload exceeds the total folder size limit of 500 MB.");
        }

        // Process each uploaded file
        for (const file of req.files) {
            const filePath = path.join('websites/users/', req.user.username, req.query.dir || '', file.originalname);

            // Check for path traversal attempt
            if (file.originalname.includes("..")) {
                if (!responseSent) {
                    res.status(404).send("HA! Good try, Hacker :3");
                    responseSent = true;
                }
                break;
            }

            // Verify file type
            if (checkFiles.checkFileName(file.originalname)) {
                try {
                    // Move the file to its destination
                    await fs.promises.rename(file.path, filePath);

                    // Update the total size in the database using the website name
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
        var newName = await req.body.newName;
        newName = newName.replace(/ /g, "_");
        newName = newName.replace(/[\\/]/g, "");
        if (req.body.isDirectory == "false") {
            if (checkFiles.checkCreatableFile(newName) == true) {
                console.log(await newName);
                var path = await req.body.path;
                if (!path) { path = ""; }
                const cleanPath = await req.body.cleanPath;

                var newPath = "websites/users/" + await req.user.username + "/" + path + "/" + newName;
                var oldPath = "websites/users/" + await req.user.username + "/" + cleanPath;

                if (newName.includes("..")) {
                    res.status(404).send("HA! Good try, Hacker :3");
                } else if (!undefined) {
                    fs.renameSync(oldPath, newPath);
                    res.redirect('/dashboard/?dir=' + await path);
                }
            } else {
                res.status(404).send("FileType not allowed.");
            }
        } else {
            newName = newName.replace(/ /g, "_");
            newName = newName.replace(/\./g, "");
            console.log(await newName);
            var path = await req.body.path;
            if (!path) { path = ""; }
            const cleanPath = await req.body.cleanPath;

            var newPath = "websites/users/" + await req.user.username + "/" + path + "/" + newName;
            var oldPath = "websites/users/" + await req.user.username + "/" + cleanPath;

            if (newName.includes("..")) {
                res.status(404).send("HA! Good try, Hacker :3");
            } else if (!undefined) {
                fs.renameSync(oldPath, newPath);
                res.redirect('/dashboard/?dir=' + await path);
            }
        }
    } catch (err) {
        console.log(err);
        res.send("Error renaming file/directory.");
    }
});

module.exports = router;
