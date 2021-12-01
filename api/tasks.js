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
        fetch('http://your-server:3000/getVms', {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (vms) {
                checkStoppingAt(vms);
            })
            .catch(function (err) {
                console.log('error: ' + err);
            });
        let now = Date.now()
        let today = new Date()
        let date = today.toISOString();

        function checkStoppingAt(vms) {
            vms.forEach(vm => {
                if (parseInt(vm.stoppingAt) !== 0 && vm.stoppingAt < now) {
                    console.log("stopping vm: " + vm.vmName)
                    pvea.post(`/nodes/${vm.node}/qemu/${vm.vmId}/status/suspend`, {
                        todisk: 1
                    }).then(
                        db.run(`UPDATE vms SET status = ?, uptime = ? ,stoppingAt = ?, owner = ?, ownerName = ? WHERE vmId = ?`, ["stopped", 0, 0, "", "", vm.vmId], function (err) {
                            if (err) {
                                return console.log(err.message);
                            } else {
                                db.run(`INSERT INTO logs (logId, node,vmName, actions, user, pc, time) VALUES(?, ?, ?, ?, ?, ?, ?)`, [vm.vmId, vm.node, vm.vmName, "suspension", "manageVm", "Server", date], function (err) {
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
                            db.close();
                        }))
                } else {
                    console.log("running vm: " + vm.vmName)
                }
            });
        }
    }

    ,
    300000) // 5 minutes