const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("../db/managevm.db", err => {
    if (err) {
        console.log(err)
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'managevm.db'");
});

module.exports = async (req, res) => {
    db.all('SELECT * FROM vms ORDER BY vmName', [], (err, rows) => {
        res.json(rows);
    });
}