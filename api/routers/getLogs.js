const sqlite3 = require('sqlite3').verbose()

module.exports = async (req, res) => {
    // open the database
    let number = parseInt(req.query.nbr)
    console.log(req.param('nbr'))
    if (Number.isInteger(number)) {
        let limit = 50 * number
        const db = new sqlite3.Database("../db/managevm.db", err => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Successful connection to the database 'managevm.db'");
        });
        db.all('SELECT * FROM logs ORDER BY time DESC LIMIT ?', [limit], (err, rows) => {
            res.json(rows);
        });
        db.close();
    }
}

// close the database connection