const pvea = require("../../utils/pvea")
const db = require("../../utils/database")
const client = db.client


module.exports = async (req, res) => {

    if (req.body === undefined) {
        res.sendStatus(400)
        return;
    }

    let vmId = req.body.vmId
    let node = req.body.node
    let actions = req.body.action
    let pc = req.domain
    let name = req.body.name
    let today = new Date().getTime()
    let state = await pvea.get(`/nodes/${node}/qemu/${vmId}/status/current`)
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
    const query = {
        text: `UPDATE vms SET status = $1, "stoppingAt" = $2, owner = $3, "ownerName" = $4, uptime = $5 WHERE "vmId" = $6`,
        values: ["stopped", , , , , vmId]
    }
    await pvea.post(`/nodes/${node}/qemu/${vmId}/status/suspend`, {todisk: 1}).then(
        client.query(query, function (err) {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    error: err.message,
                });
            } else {
                const query = {
                    text: `INSERT INTO logs ("vmId", "node","vmName", "actions","time", "owner", "ownerName") VALUES($1, $2, $3, $4, $5, $6, $7);`,
                    values: [vmId, node, state.name, "suspension", today, name, pc]
                }
                client.query(query, function (err) {
                    if (err) {
                        return res.status(400).json({
                            status: 'error',
                            error: err.message,
                        });
                    } else {
                        return res.sendStatus(200)
                    }
                });
            }
        })
    )
}