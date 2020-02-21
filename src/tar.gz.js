const targz = require('targz');
const fs = require('fs');
const exists = require('./io').exists;

function explodeTarGz({ filename, prefixToStrip, type }) {
    return new Promise((resolve, reject) => {
        const tarGzBaseName = filename.substring(
            filename.lastIndexOf('/') + 1 + (prefixToStrip || '').length,
            filename.length - (type || '.tar.gz').length);
        const explodedFolder = `${filename.substring(0, filename.lastIndexOf('/'))}/${tarGzBaseName}_exploded`;
        const exploded = `${explodedFolder}`;
        if (exists(`${exploded}`)) {
            resolve(exploded);
            return;
        }

        fs.mkdirSync(exploded, { recursive: true });

        console.log(`Exploding ${filename} in ${explodedFolder}`);
        targz.decompress({
            src: filename,
            dest: explodedFolder,
            tar: {
                map: headers => ({
                    ...headers,
                    name: headers.name.substring(headers.name.indexOf('/') + 1),
                }),
            },
        }, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(exploded);
            }
        });
    });
}

exports.explodeTarGz = explodeTarGz;
