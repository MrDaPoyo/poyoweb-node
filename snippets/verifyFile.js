var VALID_EXTENSIONS = [
    'html', 'htm', 'txt', 'text', 'css', 'js', 'jpg', 'jpeg', 'png', 'apng', 'gif', 'svg', 'md', 'markdown', 'eot', 'ttf', 'woff', 'woff2', 'json', 'geojson', 'csv', 'tsv', 'mf', 'ico', 'pdf', 'asc', 'key', 'pgp', 'xml', 'mid', 'midi', 'manifest', 'otf', 'webapp', 'less', 'sass', 'rss', 'kml', 'dae', 'obj', 'mtl', 'scss', 'webp', 'avif', 'xcf', 'epub', 'gltf', 'bin', 'webmanifest', 'knowl', 'atom', 'opml', 'rdf', 'map', 'gpg', 'resolveHandle', 'pls', 'yaml', 'yml', 'toml', 'osdx', 'mjs', 'cjs', 'ts', 'glb', 'py'
];

var VALID_EDITABLE_EXTENSIONS = [
    'html', 'htm', 'txt', 'js', 'css', 'scss', 'md', 'manifest', 'less', 'webmanifest', 'xml', 'json', 'opml', 'rdf', 'svg', 'gpg', 'pgp', 'resolveHandle', 'pls', 'yaml', 'yml', 'toml', 'osdx', 'mjs', 'cjs', 'ts', 'py'
];

function checkFileName(name) {
    const invalid = ['/', '\\', '?', '%', '*', ':', '|', '"', '<', '>'];
    for (let i = 0; i < invalid.length; i++) {
        if (name.includes(invalid[i])) {
            return false;
        }
    }
    for (let i = 0; i < disallowedExtensions.length; i++) {
        if (name.endsWith(disallowedExtensions[i])) {
            return false;
        }
    }
    return true;
}

module.exports = checkFileName;