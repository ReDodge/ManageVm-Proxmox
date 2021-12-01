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
    let name = req.body.name
    let hours = req.body.time
    let state = await pvea.get(`/nodes/${node}/qemu/${vmId}/status/current`)
    let config = await pvea.getQemuVmConfig(node, vmId)
    let stoppingAt = new Date(Date.now() + (hours * 86400000))

    if (node === undefined || vmId === undefined || name === undefined) {
        res.sendStatus(400)
        return;
    }

    if (!config.description.startsWith("AllowSelfServe")) {
        res.sendStatus(401)
        return;
    }

    if (typeof state === "number") {
        res.sendStatus(state)
        return
    }

    if (state.status === "stopped") {
        await pvea.startQemuVm(node, vmId).then(
            db.run(`UPDATE vms SET status = ?, stoppingAt = ?, owner = ?, ownerName = ? WHERE vmId = ?`, ["running", stoppingAt, req.domain, name, vmId], function (err) {
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
}