/* eslint-disable @typescript-eslint/no-require-imports */
const { exec } = require('node:child_process');

function checkPostgres() {
    exec('docker exec postgres-dev pg_isready --host localhost', handlerReturn)

    function handlerReturn(error, stdout, stderr) {
        if (stdout.search("accepting connections") === -1) {
            process.stdout.write("-")
            checkPostgres();
            return;
        }

        console.log(">{ ONLINE }")
    }
}

process.stdout.write("Aguardando Banco de Dados iniciar ")
checkPostgres()