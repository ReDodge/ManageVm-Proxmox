const db = require("../../utils/database")

const client = db.client

module.exports = async (req, res) => {
    let number = parseInt(req.query.nbr)
    if (Number.isInteger(number)) {
        let limit = 50 * number
        const query = {
            text: `SELECT * FROM logs ORDER BY time DESC LIMIT ($1);`,
            values: [limit]
        }
        client.query(query, (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            res.json(rows.rows);
        })
    }
}