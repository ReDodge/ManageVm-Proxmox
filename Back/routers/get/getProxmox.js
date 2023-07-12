const pvea = require("../../utils/pvea")
const db = require("../../utils/database")

const client = db.client

let lastQueried = 0
let cache = []

module.exports = async (req, res) => {

    let date = Date.now()
    let localCache = []
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
                let defaultDate = Date.now() + 1210000000
                if (status === "running") {
                    const query = {
                        text: `INSERT INTO vms ("vmId", "node", "vmName", "status", "uptime", "stoppingAt", "owner", "ownerName") VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT ("vmId") DO UPDATE SET uptime = ($5) , status = ($4), "stoppingAt" = (COALESCE((SELECT "stoppingAt" FROM vms WHERE "vmId" = ($1)), ($6))), owner = (COALESCE((SELECT owner FROM vms WHERE "vmId" = ($1)), ($7))),  "ownerName" = (COALESCE((SELECT "ownerName" FROM vms WHERE "vmId" = ($1)), ($8)));`,
                        values: [vm.vmid, node.node, vmName, status, uptime, defaultDate, "manageVM", "manageVM"]
                    }
                    await client.query(query, (err, res) => {
                        if (err) {
                            console.error(err);

                        }
                    })
                } else if (status === "stopped") {
                    const query = {
                        text: `INSERT INTO vms ("vmId", "node", "vmName", "status", "uptime", "stoppingAt", "owner", "ownerName") VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT ("vmId") DO UPDATE SET uptime = ($5) , status = ($4), "stoppingAt" = ($6), owner = ($7), "ownerName" = ($8);`,
                        values: [vm.vmid, node.node, vmName, status, uptime, null, null, null]
                    }
                    await client.query(query, (err, res) => {
                        if (err) {
                            console.error(err);

                        }
                    })
                    localCache.push({
                        vmId: vm.vmid,
                        node: node.node
                    })
                }
            } else {
                const deleteQuery = {
                    text: `DELETE FROM vms WHERE "vmId" = ($1)`,
                    values: [vm.vmid]
                }
                const query = {
                    text: `SELECT * FROM vms WHERE "vmId" = ($1)`,
                    values: [vm.vmid]
                }
                //Check si la vm existe dans la db mais ne possède pas la description "AllowSelServe"
                await client.query(query, function (err) {
                    if (err) {
                        return console.log(err.message);
                    } else {
                        client.query(deleteQuery);
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