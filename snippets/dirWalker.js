var fs = require("fs");
var path = require("path");

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
                        const ext = path.extname(file).toLowerCase();
                        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff', 'webp'].includes(ext)) {
                            type = 'image';
                        } else if (['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.odt'].includes(ext)) {
                            type = 'document';
                        } else if (['.mp3', '.wav', '.ogg', '.flac', '.aac', '.wma'].includes(ext)) {
                            type = 'audio';
                        } else if (['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv'].includes(ext)) {
                            type = 'video';
                        } else if (['.zip', '.rar', '.tar', '.gz', '.7z'].includes(ext)) {
                            type = 'compressed';
                        } else {
                            type = 'unknown';
                        }
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
                        openable: type !== 'unknown'
                    };
                    i++;
                });
                resolve(files);
            }
        });
    });
}
module.exports = readDir;
