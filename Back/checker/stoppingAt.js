const pvea = require("../utils/pvea");
const API_URL = "//managevm.creative-it.fr";
const db = require("../utils/database");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const client = db.client;

// Stop expired vms
function StoppingAt() {
    console.log("Checking for expired vms");
    fetch('http://managevm.cit.local:4000/api/getVms')
        .then(function (response) {
            return response.json();
        })
        .then(function (vms) {
            checkStoppingAt(vms);
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });
}

StoppingAt()

function checkStoppingAt(vms) {
    let now = Date.now();
    var today = new Date();
    var time = today.getHours()
    vms.forEach(vm => {
        if (vm.stoppingAt !== null && vm.stoppingAt < now && time > 19) {
            let today = new Date().getTime()
            pvea.getQemuVmConfig(vm.node, vm.vmId).then(function (response) {
                if (response.lock !== undefined) {
                    console.log(response.lock)
                } else {
                    console.log("stopping vm: " + vm.vmName);
                    const query = {
                        text: `UPDATE vms SET status = $1, "stoppingAt" = $2, owner = $3, "ownerName" = $4, uptime = $5 WHERE "vmId" = $6`,
                        values: ["stopped", , , , , vm.vmId]
                    }
                    pvea.post(`/nodes/${vm.node}/qemu/${vm.vmId}/status/suspend`, {todisk: 1}).then(
                        client.query(query, function (err) {
                            if (err) {
                                console.log(err)
                            } else {
                                const query = {
                                    text: `INSERT INTO logs ("vmId", "node","vmName", "actions","time", "owner", "ownerName") VALUES($1, $2, $3, $4, $5, $6, $7);`,
                                    values: [vm.vmId, vm.node, vm.vmName, "suspension", today, "manageVm", "manageVm"]
                                }
                                client.query(query, function (err) {
                                    if (err) {
                                        console.log(err)
                                    }
                                });
                            }
                        })
                    )
                }
            })
        } else {
            console.log("running vm: " + vm.vmName);
        }
    });
}

module.exports = StoppingAt
