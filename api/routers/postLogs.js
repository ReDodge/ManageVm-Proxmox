const sqlite3 = require("sqlite3").verbose();
const pvea = require("../pvea")


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
    let name = req.body.name
    let actions = req.body.action
    let pc = req.domain
    let today = new Date()
    let date = today.toISOString();
    let state = await pvea.get(`/nodes/${node}/qemu/${vmId}/status/current`)
    let vmName = state.name


    if (node === undefined || vmId === undefined || name === undefined) {
        res.sendStatus(400)
        return;
    }

    db.run(`INSERT INTO logs (logId, node,vmName, actions, user, pc, time) VALUES(?, ?, ?, ?, ?, ?, ?)`, [vmId, node, vmName, actions, name, pc, date], function(err) {
        if (err) {
            return console.log(err.message);
        } else {
            res.sendStatus(200)
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        }

        db.close();
    });
}