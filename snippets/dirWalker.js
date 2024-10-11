var fs = require("fs");
var path = require("path");
var verifyFile = require('./verifyFile')

function readDir(basedir, dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            } else {
                console.log(dir);
                files = files.map(file => {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    let type = '';
                    if (stats.isDirectory()) {
                        type = 'directory';
                    } else {
                        type = 'file';
                    }
					if (type == 'file') {
						var openable = verifyFile.checkEditableFile(file);
					}
                    return {
                        name: file,
                        filePath: path.relative(basedir, filePath).replace(file, ''),
                        cleanPath: path.relative(basedir, filePath),
                        content: stats.isDirectory() ? null : fs.readFileSync(filePath, "utf8"),
                        isDirectory: stats.isDirectory(),
                        size: stats.size,
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime,
                        id: stats.birthtime.getTime(),
                        type,
                     	openable,
                     };
                    i++;
                });
                resolve(files);
            }
        });
    });
}
module.exports = readDir;
