const http = require('https');
const fs = require('fs');
const exists = require('./io').exists;

function download({ url, target, force }) {
    return new Promise((resolve, reject) => {
        if (exists(target) && !force) { // already downloaded
            resolve(target);
            return;
        }
        fs.mkdirSync(target.substring(0, target.lastIndexOf('/')), { recursive: true });

        const file = fs.createWriteStream(target);
        file.on('finish', function () {
            file.close();
            resolve(target);
        });
        console.log(`Downloading ${url} to ${target}`);
        http.get(url, function (response) {
            if (response.statusCode !== 200) {
                reject(`Invalid download response: ${response.statusCode}`);
                return;
            }
            response.pipe(file);
        }).on('error', function (err) {
            fs.unlink(dest);
            reject(`Invalid download: ${err.message}`);
        });
    });
}

exports.download = download;
