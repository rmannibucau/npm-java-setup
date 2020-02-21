const fs = require('fs');
const maven = require('./maven');
const download = require('./download').download;
const explodeTarGz = require('./tar.gz').explodeTarGz;
const exec = require('./process').exec;

const isWin = process.platform.indexOf('win') >= 0;

const configuration = {
    cacheDir: process.env.NPM_SETUP_JAVA || `${process.env[isWin ? 'USERPROFILE' : 'HOME']}/.m2/repository`,
    distribution: {
        version: 'zulu8.44.0.13-ca-fx-jdk8.0.242', // zulu11.29.3-ca-fx-jdk11.0.2 or so for java 11
        platform: isWin ? 'win64' : 'linux_x64', // win64, macosx_x64
    },
    application: {
        // if repository is a nexus base:
        // nexusRepository: 'snapshots',
        repository: 'https://repo1.maven.org/maven2/', // can be a nexus base
        groupId: 'org.apache.karaf',
        artifactId: 'apache-karaf',
        version: '4.3.0.RC1',
        type: 'tar.gz',
        // classifier: undefined,
        command: [
            '${APPLICATION_HOME}/bin/karaf', 'run'
        ],
        environment: {
            KARAF_HOME: "${KARAF_HOME}",
            KARAF_BASE: "${KARAF_BASE}",
        },
    },
};

function downloadJDK() {
    const url = `https://cdn.azul.com/zulu/bin/${configuration.distribution.version}-${configuration.distribution.platform}.tar.gz`;
    const target = `${configuration.cacheDir}/com/azul/java/${configuration.distribution.version}/java-${configuration.distribution.version}-${configuration.distribution.platform}.tar.gz`;
    return download({ url, target, force: false });
}

function downloadArtifact() {
    const url = maven.toUrl(configuration.application);
    const target = `${configuration.cacheDir}/${maven.toPath(configuration.application)}`;
    return download({ url, target, force: !!process.env.NPM_SETUP_JAVA_FORCE_UPDATE });
}

function provisioning() {
    return Promise.all([
        downloadJDK()
            .then(filename => explodeTarGz({ filename, prefixToStrip: 'java-' })),
        downloadArtifact()
            .then(filename => explodeTarGz({ filename }))
    ]).then(results => ({ jdk: results[0], application: results[1] }));
}

function main() {
    provisioning().then(({ jdk, application }) => {
        function interpolate(from, javaHome, appBase) {
            return from.replace('${JAVA_HOME}', javaHome).replace('${APPLICATION_HOME}', appBase);
        }

        console.log(`JAVA_HOME=${jdk}`);
        console.log(`APPLICATION_HOME=${application}`);

        const environment = { JAVA_HOME: jdk };
        Object.keys(configuration.application.environment || {})
            .forEach(key => {
                const value = configuration.application.environment[key];
                if (value.indexOf('${')) {
                    return interpolate(value, jdk, application);
                }
                return value;
            });

        const process = exec({
            command: configuration.application.command.map(it => interpolate(it, jdk, application)),
            environment,
            directory: application,
        });
    }).catch(e => console.log(e));
}

main();
