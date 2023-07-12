const db = require("../../utils/database")

const client = db.client
let localCache = []
module.exports = async (req, res) => {
    const query = {text:`SELECT * FROM vms ORDER BY UPPER("vmName") ASC`,}
    client.query(query, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        res.json(rows.rows);
        localCache.push({
            vmId: rows.rows.vmid,
            node: rows.rows.node
        })
    });
}