const pvea = require("../utils/pvea")
const fetch = require("node-fetch");
const sqlite3 = require("sqlite3").verbose();

//Connect to database
const db = new sqlite3.Database("../../db/managevm.db", err => {
    if (err) {
        console.log(err)
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'managevm.db'");
});

//Check if weekend when code is execute
const is_weekend = function (date1) {
    const dt = new Date(date1);

    if (dt.getDay() === 6 || dt.getDay() === 0) {
        return "weekend";
    }
}

//Format date
function formatDate(date) {
    const end = date.replace("T", " ").replace("Z", "")
    return (end)
}

//Check Vmq locked
setInterval(async () => {
    let today = new Date()
    fetch(new URL('/getLockedVms', "https://managevm.creative-it.fr" ), {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (vms) {
            //CheckLockedVms only when there is locked vm in db and is not weekend or hours is between 8 and 18
            if (vms.length > 0 && is_weekend(today) !== "weekend" && 8 < today.getHours() && today.getHours() < 18) {
                checkLockedVms(vms);
            } else {
                console.log("No Vms Locked")
            }
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });

    let date = today.toISOString();
    //Header
    const slackMessage = {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Vms en attentes de déverrouillages :lock:",
                    "emoji": true
                }
            },
        ]
    }

    function checkLockedVms(vms) {
        console.log(vms)
        let count = 0
        const limit = new Date()
        limit.setHours(limit.getHours() - 1)
        vms.forEach(vm => {
            pvea.getQemuVmConfig(vm.node, vm.vmId).then(function (response) {
                    count++
                    if (response.lock === undefined) {
                        db.run(`DELETE FROM lockedVms WHERE vmId = ?`, vm.vmId, function (err) {
                            if (err) {
                                return console.error(err.message);
                            }
                            console.log(`Row(s) deleted ${this.changes}`);
                        })
                    } else {
                        //Slack Message Template
                        slackMessage.blocks.push(
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": ":desktop_computer: _" + vm.vmName + "_\n Status: *" + vm.status + "*\n Depuis: " + formatDate(vm.date) + "\n Dernière update: " + formatDate(vm.lastUpdate)
                                },
                                "accessory": {
                                    "type": "button",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Aller sur Proxmox " + vm.node,
                                        "emoji": true
                                    },
                                    "value": "click_me_123",
                                    "url": "https://epyc6515.proxmox.creative-it.fr:8006/#v1:0:=node%2F" + vm.node + ":4:::::::",
                                    "action_id": "button-action"
                                }
                            },)
                        db.run(`UPDATE lockedVms SET lastUpdate = ?, sendAt = ? WHERE vmId = ${vm.vmId}`, [date, date], function (err) {
                            if (err) {
                                return console.log(err.message);
                            } else {
                                console.log(`A row has been inserted with rowid ${this.lastID}`);
                            }
                            db.close();
                        })
                        if (count === vms.length) {
                            fetch('https://hooks.slack.com/services/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', {
                                method: "POST",
                                body: JSON.stringify(slackMessage),
                                headers: {"Content-Type": "application/json"},
                            })
                        }
                    }
                }
            )


        })


    }
}, 7200000)