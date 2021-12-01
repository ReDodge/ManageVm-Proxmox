const sqlite3 = require("sqlite3").verbose();
const pvea = require("../pvea")

let lastQueried = 0
// Array with the ids of the authorized vms to avoid checking every time (super slow)
let cache = []

const db = new sqlite3.Database("../db/managevm.db", err => {
    if (err) {
        console.log(err)
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'managevm.db'");
});

module.exports = async (req, res) => {

    db.all('SELECT * FROM vms ORDER BY vmName COLLATE NOCASE', [], (err, rows) => {
        res.json(rows);
    });
    let date = Date.now()

    let localCache = [] // To avoid conflict on concurrent requests

    lastQueried = date

    let nodes = await pvea.getNodes()
    let queriedNodesLeft = nodes.length;

    for (const node of nodes) {
        let vms = await pvea.listQemuVms(node.node)

        let queriedConfigsLeft = vms.length
        for (const vm of vms) {

            let config = await pvea.getQemuVmConfig(node.node, vm.vmid)
            queriedConfigsLeft--

            if (config.description && config.description.startsWith("AllowSelfServe")) {
                let vmName = config.name
                let state = await pvea.getCurrentQemuVmState(node.node, vm.vmid)
                let status = state.status
                let uptime = state.uptime
                let stoppingAt = 1
                if (status === "stopped") stoppingAt = 0;
                if (status === "stopped") {
                    db.run(`INSERT OR REPLACE INTO vms (vmId, node, vmName, status, uptime, stoppingAt, owner, ownerName) VALUES(?, ?, ?, ?, ?,COALESCE((SELECT stoppingAt FROM vms WHERE vmId = ${vm.vmid} ) * ${stoppingAt}, 0), COALESCE((SELECT owner FROM vms WHERE vmId = ${vm.vmid}), ''), COALESCE((SELECT ownerName FROM vms WHERE vmId = ${vm.vmid}), ''))`, [vm.vmid, node.node, vmName, status, uptime], function (err) {
                        if (err) {
                            return console.log(err.message);
                        } else {
                            console.log(`A row has been inserted with rowid ${this.lastID}`);
                        }
                    });
                }/*
                db.run(`INSERT OR REPLACE INTO vms (vmId, node, vmName, status, uptime, stoppingAt, owner, ownerName) VALUES(?, ?, ?, ?, ?,COALESCE((SELECT stoppingAt FROM vms WHERE vmId = ${vm.vmid} ) * ${stoppingAt}, 0), COALESCE((SELECT owner FROM vms WHERE vmId = ${vm.vmid}), ''), COALESCE((SELECT ownerName FROM vms WHERE vmId = ${vm.vmid}), ''))`, [vm.vmid, node.node, vmName, status, uptime], function (err) {
                    if (err) {
                        return console.log(err.message);
                    } else {
                        console.log(`A row has been inserted with rowid ${this.lastID}`);
                    }
                });
                localCache.push({
                    vmId: vm.vmid,
                    node: node.node
                })*/
            } else {
                //Check si la vm existe dans la db mais ne possède pas la description "AllowSelServe"
                db.run(`SELECT * FROM vms WHERE vmId = ?`, [vm.vmid], function (err) {
                    if (err) {
                        return console.log(err.message);
                    } else {
                        db.run(`DELETE FROM vms WHERE vmId = ?`, [vm.vmid])
                    }

                })
            }
            if (queriedConfigsLeft === 0) {
                queriedNodesLeft--

                if (queriedNodesLeft === 0) {
                    cache = localCache
                    res.sendStatus(200)
                }
            }
        }
    }
}