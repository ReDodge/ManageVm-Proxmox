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
    let stoppingAt = req.body.days
    let name = req.body.name
    let actions = req.body.action
    let pc = req.domain
    let today = new Date().getTime()
    let config = await pvea.getQemuVmConfig(node, vmId)
    let vmName = config.name

    if (vmId === undefined || node === undefined) {
        res.sendStatus(400)
        return;
    }

    const query = {
        text: `UPDATE vms SET "stoppingAt" = $1, owner = $2, "ownerName" = $3 WHERE "vmId" = $4`,
        values: [stoppingAt, req.domain, name, vmId]
    }
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
}