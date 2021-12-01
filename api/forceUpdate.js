const pvea = require("./pvea")
const fetch = require("node-fetch");
const sqlite3 = require("sqlite3").verbose();

// Stop expired vms
const db = new sqlite3.Database("../db/managevm.db", err => {
    if (err) {
        console.log(err)
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'managevm.db'");
});
setInterval(async () => {
        console.log("Checking for expired vms");
        fetch('http://your-server:3000/getVmsList', {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (vms) {
                checkVmsExist(vms);
            })
            .catch(function (err) {
                console.log('error: ' + err);
            });

        let today = new Date()
        let date = today.toISOString();

        function checkVmsExist(vms) {
            vms.forEach(vm => {
                pvea.get(`/nodes/${vm.node}/qemu/${vm.vmId}/config`)
                    .then(function (response) {
                            if (response === 500) {
                                db.run(`DELETE FROM vms WHERE vmId=? AND node=?`, [vm.vmId, vm.node], function (err) {
                                    if (err) {
                                        return console.error(err.message);
                                    }
                                    console.log(`Row(s) deleted ${this.changes}`);
                                });
                            } else {
                                db.run(`INSERT INTO logs (logId, node,vmName, actions, user, pc, time) VALUES(?, ?, ?, ?, ?, ?, ?)`, [vm.vmId, vm.node, vm.vmName, "suppression", "manageVm", "Server", date], function (err) {
                                    if (err) {
                                        return console.log(err.message);
                                    } else {
                                        fetch('http://your-server:3000/getVms', {
                                            method: "GET",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                        })
                                        console.log(`A row has been inserted with rowid ${this.lastID}`);
                                    }
                                })
                            }
                        }
                    )
            });
        }
    }

    ,
    86400000
) //  1 jour