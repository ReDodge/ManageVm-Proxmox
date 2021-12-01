const API_URL = "http://your-server:3000"
let domain = ""

async function subscribeVm(vmId, node, name, time, action) {
    await Promise.all(["/subscribe", "/postLogs"].map(suffix =>
        fetch(API_URL + suffix, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                vmId,
                node,
                name,
                time,
                action
            })
        })
    ))
}

async function enableVm(vmId, node, name, time, action) {
    await Promise.all(["/extend", "/postLogs"].map(suffix =>
        fetch(API_URL + suffix, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                vmId,
                node,
                name,
                time,
                action
            })
        })
    ))
}

async function shutdownVm(vmId, node, name, action) {
    await Promise.all(["/shutdown", "/postLogs"].map(suffix =>
        fetch(API_URL + suffix, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                vmId,
                node,
                name,
                action
            })
        })
    ))
}

function getStatusColor(status, prefix) {
    switch (status) {
        case "démarrage":
            return prefix + "success"
        case "suspension":
            return prefix + "danger"
        case "stopping":
            return prefix + "success"
        case "prolongation":
            return prefix + "primary"
    }
}

function formatDate(timestamp, state) {
    if (state === "running") return parseInt(timestamp) === 0 ? "Jamais" : new Date(parseInt(timestamp)).toLocaleString()
    return parseInt(timestamp) === 0 ? "" : new Date(parseInt(timestamp)).toLocaleString()
}

function formatTime(seconds) {
    if (seconds === 0) return ""
    seconds = Number(seconds);
    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor(seconds % (3600 * 24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);

    let dDisplay = d > 0 ? d + (d === 1 ? " jour " : " jours ") : "";
    let hDisplay = h > 0 ? h + (h === 1 ? " heure " : " heures ") : "";
    let mDisplay = m > 0 ? m + (m === 1 ? " minute " : " minutes ") : "";
    if (d >= 1) return dDisplay;
    else if (h >= 1) return hDisplay
    else return mDisplay;
}