const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'managevm',
    password: 'postgres',
    port: 5432,
});
client.connect();

module.exports = {
    client: client
};
vmsTable = ('' +
    'CREATE TABLE IF NOT EXISTS vms (\n' +
    '    "vmId" \tVARCHAR(50) PRIMARY KEY,\n' +
    '    node VARCHAR(50) NOT NULL,\n' +
    '    "vmName" VARCHAR(50) NOT NULL,\n' +
    '    status VARCHAR(50),\n' +
    '    uptime VARCHAR(50),\n' +
    '    "stoppingAt" VARCHAR(50),\n' +
    '    owner VARCHAR(100),\n' +
    '    "ownerName" VARCHAR(100)\n' +
    ');')
logsTable = ('' +
    'CREATE TABLE IF NOT EXISTS logs (\n' +
    '    "vmId" \tVARCHAR(50) NOT NULL,\n' +
    '    node VARCHAR(50) NOT NULL,\n' +
    '    "vmName" VARCHAR(50) NOT NULL,\n' +
    '    actions VARCHAR(50),\n' +
    '    time VARCHAR(50),\n' +
    '    owner VARCHAR(100),\n' +
    '    "ownerName" VARCHAR(100)\n' +
    ');')
client.query(vmsTable, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Table créée avec succès');
});
client.query(logsTable, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Table créée avec succès');
});
