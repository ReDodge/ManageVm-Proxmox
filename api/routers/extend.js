const sqlite3 = require("sqlite3").verbose();

module.exports = async (req, res) => {

    const db = new sqlite3.Database("../db/managevm.db", err => {
        if (err) {
            console.log(err)
            return console.error(err.message);
        }
        console.log("Successful connection to the database 'managevm.db'");
    });

    if (req.body === undefined) {
        res.sendStatus(400)
        return;
    }

    let vmId = req.body.vmId
    let node = req.body.node
    let time = req.body.time
    let name = req.body.name

    if (vmId === undefined || node === undefined) {
        res.sendStatus(400)
        return;
    }
    if (time === undefined || time <= 0 || time > 744) {
        res.sendStatus(400)
        return;
    }

    let stoppingAt = time * 86400000
    let extendDate = (Date.now() + stoppingAt)

    db.run(`UPDATE vms SET stoppingAt = COALESCE((SELECT stoppingAt FROM vms WHERE vmId = ? AND stoppingAt != 0 ) + ?, ?), ownerName = ? WHERE vmId = ${vmId}`, [vmId, stoppingAt, extendDate, name], function(err, rows) {
        if (err) {
            return console.log(err.message);
        } else {
            console.log(`A row has been inserted with rowid ${this.lastID}`);
            res.sendStatus(200)
        }
    })
}