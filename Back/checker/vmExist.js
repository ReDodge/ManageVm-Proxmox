const pvea = require("../utils/pvea")
const db = require("../utils/database");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const client = db.client;

function vmExist() {
    console.log("Checking for existed vms");
    fetch('http://managevm.cit.local:4000/api/getVms', {
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
}

vmExist()
let today = new Date().getTime()

function checkVmsExist(vms) {
    vms.forEach(vm => {
        pvea.get(`/nodes/${vm.node}/qemu/${vm.vmId}/config`)
            .then(function (response) {
                    if (response === 500 || (response.description !== "AllowSelfServe")) {
                        console.log("Deleted " + vm.vmId)
                        const query = {
                            text: `DELETE FROM vms WHERE "vmId" = $1 `,
                            values: [vm.vmId]
                        }
                        client.query(query, function (err) {
                            if (err) {
                                console.log(err)
                            } else {
                                const query = {
                                    text: `INSERT INTO logs ("vmId", "node","vmName", "actions","time", "owner", "ownerName") VALUES($1, $2, $3, $4, $5, $6, $7);`,
                                    values: [vm.vmId, vm.node, vm.vmName, "Supression", today, "manageVm", "manageVm"]
                                }
                                client.query(query, function (err) {
                                    if (err) {
                                        console.log(err)
                                    }
                                });
                            }
                        })
                    } else {
                        console.log("VM is up")
                    }
                }
            )
    })
}

module.exports = vmExist