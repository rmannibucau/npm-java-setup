const fs = require('fs');

function exists(file) {
    try {
        return fs.existsSync(file);
    } catch (err) {
        return false;
    }
}

exports.exists = exists;
