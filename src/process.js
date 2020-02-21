const spawn = require('child_process').spawn;


function exec({
    command,
    environment,
    directory,
}) {
    const process = spawn(
        command[0], command.splice(0, 1),
        {
            cwd: directory,
            env: environment,
        });
    process.stdout.on('data', data => { console.log(data.toString()); });
    process.stderr.on('data', data => { console.error(data.toString()); });
    process.on('exit', (code) => { console.log(`${command[0]} exited with exit code ${code}`); });
}

exports.exec = exec;
