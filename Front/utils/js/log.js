let show = 1

function onClick(search) {
    show = show * 2;
    fetch('https://managevm.creative-it.fr/api/getLogs?nbr=' + show, {
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
            if (show * 50 > logs.length) document.getElementById("more").hidden = true;
        })
        .catch(function(err) {
            console.log('error: ' + err);
        });
}
function loadLogs() {
    fetch('https://managevm.creative-it.fr/api/getLogs?nbr=' + show, {
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
            if (show * 50 > logs.length) $("#more").hide()
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });
}

loadLogs()

function renderLogList(logs) {
    logs.forEach(log => {
        let row = $("<tr class='border-b-2 border-gray-100 hover:bg-gray-200'>")
        row.append("<td class='p-2.5'>" + new Date(parseInt(log.time)).toLocaleString() + "</td>")
        row.append("<td class='align-middle  pl-2.5 text-black font-semibold' >" + log.vmId + "</td>")
        row.append("<td class='align-middle  pl-2.5 text-black font-semibold'  >" + log.node + "</td>")
        row.append("<td class='align-middle  pl-2.5 text-black font-semibold' >" + log.vmName + "</td>")
        row.append("<td style=\"vertical-align: middle;\" class=\"" + getStatusColor(log.actions) + " w-[5%] text-white text-center\">" + log.actions + "</td>")
        row.append("<td class='align-middle pl-10'>" + log.owner + "</td>")
        row.append("<td>" + log.ownerName + "</td>")
        $('table').append(row)
    })
}