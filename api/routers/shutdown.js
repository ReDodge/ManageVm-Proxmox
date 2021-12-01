const pvea = require("../pvea")
const sqlite3 = require("sqlite3").verbose();


module.exports = async (req, res) => {

    if (req.body === undefined) {
        res.sendStatus(400)
        return;
    }

    const db = new sqlite3.Database("../db/managevm.db", err => {
        if (err) {
            console.log(err)
            return console.error(err.message);
        }
        console.log("Successful connection to the database 'managevm.db'");
    });

    let vmId = req.body.vmId
    let node = req.body.node
    let config = await pvea.getQemuVmConfig(node, vmId)

    if (vmId === undefined || node === undefined) {
        res.sendStatus(400)
        return;
    }

    if (!config.description.startsWith("AllowSelfServe")) {
        console.log(config.description)
        res.sendStatus(401)
        return;
    }

    pvea.post(`/nodes/${node}/qemu/${vmId}/status/suspend`, {todisk: 1}).then(
        db.run(`UPDATE vms SET status = ?, uptime = ? ,stoppingAt = ?, owner = ?, ownerName = ? WHERE vmId = ?`, ["stopped", 0, 0, "", "", vmId], function(err) {
            if (err) {
                return console.log(err.message);
            } else {
                res.sendStatus(200)
                console.log(`A row has been inserted with rowid ${this.lastID}`);
            }
            db.close();
        })
    )
}