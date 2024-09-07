const { exec } = require('child_process');
const userBlacklist = ["poyo","mrdapoyo", "reporter", "weblink", "oreneta", "neocities", "dapoyo", "bitch", "newrubix", "api", "blog"];

async function createUser(username, password) {
    const createUserCommand = `useradd --no-create-home ${await username} -p ${await password}`;
    const linkUserToFolderCommand = `chown -R ${await username} websites/users/${await username}`;
    const setPermissionsCommand = `chmod -R 770 websites/users/${await username}`;
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

function checkUsername(username, req, res) {
    const regex = /^[a-zA-Z0-9]+$/;
    if (username.length > 20) {
        return 'Username must have at max 20 characters';
    } else if (!regex.test(username)) {
        return 'Username must contain only letters and numbers';
    } else if (userBlacklist.includes(username)) {
        return 'Username is blacklisted, try again with another different username';
    } else {
        return true;
    }
}

module.exports = { createUser, checkUsername };