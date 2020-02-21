
function toPath(coordinates) {
    return coordinates.groupId.replace(/\./g, '/') + '/' +
        coordinates.artifactId + '/' +
        coordinates.version + '/' +
        coordinates.artifactId + '-' + coordinates.version + (coordinates.classifier ? '-' + coordinates.classifier : '') + '.' +
        (coordinates.type || 'jar');
}

function toUrl(coordinates) {
    if (coordinates.nexusRepository) {
        return `${coordinates.repository}/service/local/artifact/maven/content?` +
            `r=${coordinates.nexusRepository || 'snapshots'}&g=${coordinates.groupId}&a=${coordinates.artifactId}&v=${coordinates.version}&e=${coordinates.type || 'jar'}` +
            (coordinates.classifier ? '&c=' + coordinates.classifier : '');
    }
    return (coordinates.repository || 'https://repo.maven.apache.org/maven2/') + toPath(coordinates);
}

exports.toPath = toPath;
exports.toUrl = toUrl;
