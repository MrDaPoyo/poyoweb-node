var fs = require("fs");
var path = require("path");

async function* walk(dir) {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) {
            yield* await walk(entry);
        } else if (d.isFile()) {
            yield entry;
        } else {
            yield entry;
        }
    }
}

async function walkSync(dir) {
    var results = [];
    for await (const p of walk(dir)) {
        console.log(p);
        const fileStats = await fs.promises.stat(p);
        const fileInfo = {
            name: path.basename(p),
            path: p,
            size: fileStats.size,
            createdAt: fileStats.birthtime,
            modifiedAt: fileStats.mtime
        };
        results.push(fileInfo);
    }    
    return results; 
}

if (exports) {
    exports.walk = walkSync;
}