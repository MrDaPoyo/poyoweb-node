const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const dirWalker = require('./snippets/dirWalker');
const bodyParser = require('body-parser');
const checkFiles = require('./snippets/verifyFile');
const checkCreatableFolder = require('./snippets/verifyFolder');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderName = req.query.dir || '';
        const folderPath = path.join('websites/users/', req.user.username, folderName);
        fs.mkdirSync(folderPath, { recursive: true });
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    dest: 'uploads/', storage: storage
})

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
        var dirname = "websites/users/" + await req.user.username + "/" + await req.body.cleanPath + "/" + await req.body.dir;
        if (!req.body.dir.includes(".")) {
            var valid = checkCreatableFolder(dirname);
            valid = true;
        } else {
            var valid = checkFiles.checkCreatableFile(dirname);
        }
        if (!valid) {
            res.status(404).send("FileType not allowed.");
        } else if (dirname.includes("..")) {
            res.status(404).send("HA! Good try, Hacker :3");
        } else if (req.body.dir.length > 30) {
            res.status(404).send("FileName too long.");
        } else {
            if (!dirname.includes(".")) {
                fs.mkdirSync(dirname, { recursive: true });
                res.redirect('/dashboard/?dir=' + await req.body.cleanPath);
            } else {
                fs.writeFileSync(dirname, '');
                res.redirect('/dashboard/?dir=' + await req.body.cleanPath);
            };
        }
    } catch (err) {
        console.log(err);
        res.send("Error creating file/directory.");
    }
});

router.post('/file-upload', upload.array('file'), async (req, res) => {
    console.log(req.files);
    try {
        if (req.files) {
            req.files.forEach(async (file) => {
                const filePath = path.join('websites/users/', req.user.username, req.query.dir, file.originalname);
                if (file.originalname.includes("..")) {
                    res.status(404).send("HA! Good try, Hacker :3");
                } else if (checkFiles.checkFileName(file.originalname)) {
                    fs.rename(file.path, filePath, async (err) => {
                        if (err) {
                            console.log(err);
                            res.send("Error uploading file.");
                        } else {
                            res.redirect('/dashboard/?dir=' + await req.body.cleanPath);
                        }
                    });
                } else {
                    res.status(404).send("FileType not allowed.");
                }
            });
        } else {
            res.status(404).send("No file uploaded.");
        }
    } catch (err) {
        console.log(err);
        res.send("Error uploading file.");
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