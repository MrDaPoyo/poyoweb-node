const disallowedExtensions = [
    ".exe", ".dll", ".bat", ".sh", ".ps1", ".apk", ".dmg", ".pkg", ".deb", ".rpm", 
    ".bin", ".cmd", ".msi", ".vbs", ".jar", ".app", ".scr", ".cpl", ".bat", ".zip",
    ".sh", ".bash", ".bashrc", ".bash_profile", ".zsh", ".zshrc", ".zsh_profile", ".zsh_history"
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