const pvea = require("../../utils/pvea")
const db = require("../../utils/database")
const client = db.client

module.exports = async (req, res) => {
    if (req.body === undefined) {
        return res.status(400).json({
            status: 'error',
            error: '404',
        });
    }

    let vmId = req.body.vmId
    let node = req.body.node
    let name = req.body.name
    let actions = req.body.action
    let pc = req.domain
    let today = new Date().getTime()
    let state = await pvea.get(`/nodes/${node}/qemu/${vmId}/status/current`)
    let config = await pvea.getQemuVmConfig(node, vmId)
    let vmName = config.name
    let stoppingAt = req.body.days

    if (node === undefined || vmId === undefined || name === undefined) {
        return res.status(400).json({
            status: 'error',
            error: 'req body cannot be empty',
        });
    }

    if (!config.description.startsWith("AllowSelfServe")) {
        return res.status(401).json({
            status: 'error',
            error: 'AllowSelfServe',
        });
    }

    if (typeof state === "number") {
        res.sendStatus(state)
        return
    }

    if (state.status === "stopped") {
        const query = {
            text: `UPDATE vms SET status = $1, "stoppingAt" = $2, owner = $3, "ownerName" = $4 WHERE "vmId" = $5`,
            values: ["running", stoppingAt, req.domain, name, vmId]
        }
        await pvea.startQemuVm(node, vmId).then(
            client.query(query, function (err) {
                if (err) {
                    return res.status(400).json({
                        status: 'error',
                        error: err.message,
                    });
                } else {
                    const query = {
                        text: `INSERT INTO logs ("vmId", "node","vmName", "actions","time", "owner", "ownerName") VALUES($1, $2, $3, $4, $5, $6, $7);`,
                        values: [vmId, node, vmName, actions, today, name, pc]
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
}