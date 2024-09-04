const { exec } = require('child_process');

function createUser(username, password) {
    const createUserCommand = `useradd --no-create-home -p ${password} ${username}`;
    const linkUserToFolderCommand = `chown -R ${username}:${username} ./websites/users/${username}`;
    const setPermissionsCommand = `chmod -R 750 ./websites/users/${username}`;
    try {
        exec(createUserCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating user: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error creating user: ${stderr}`);
                return;
            }
        });
        exec(linkUserToFolderCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error linking user to folder: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error linking user to folder: ${stderr}`);
                return;
            }
        });
        exec(setPermissionsCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error setting permissions: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error setting permissions: ${stderr}`);
                return;
            }
        });
    } catch (error) {
        console.error(`Error creating user: ${error.message}`);
    }
    console.log(`User ${username} created successfully`);
}

module.exports = { createUser };