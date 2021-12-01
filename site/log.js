let show = 1

function onClick() {
    show = show * 2;
    fetch('http://your-server:3000/getLogs?nbr=' + show, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(logs) {
            $('table tbody').empty();
            renderLogList(logs);
            if (show * 50 > logs.length) document.getElementById("more").disabled = true;
        })
        .catch(function(err) {
            console.log('error: ' + err);
        });
}
    fetch('http://your-server:3000/getLogs?nbr=' + show, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (logs) {
            renderLogList(logs);
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });

function renderLogList(logs) {
    logs.forEach(log => {
        let row = $("<tr>")
        row.append("<td>" + log.time + "</td>")
        row.append("<td>" + log.logId + "</td>")
        row.append("<td>" + log.node + "</td>")
        row.append("<td>" + log.vmName + "</td>")
        row.append("<td style=\"vertical-align: middle;\" class=\"" + getStatusColor(log.actions, "table-") + "\">" + log.actions + "</td>")
        row.append("<td>" + log.user + "</td>")
        row.append("<td>" + log.pc + "</td>")
        $('table').append(row)
    })
}

function cellStyle(value) {
    if (value === "running") {
        return {
            css: {
                background: '#c6dbd2',
            }
        }
    } else if (value === "stopped") {
        return {
            css: {
                background: '#f8d7da',
            }
        }
    }
    return {
        css: {
            background: '#a2cfda',
        }
    }
}