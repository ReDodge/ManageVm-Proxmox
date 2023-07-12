const API_URL = "https://managevm.creative-it.fr/api"
function getStatusColor(status) {
    switch (status) {
        case "démarrage":
            return "bg-[#27ae60]"
        case "suspension":
            return "bg-[#c0392b]"
        case "prolongation":
            return "bg-[#2980b9]"
        case "Supression":
            return "bg-[#7f8c8d]"
    }
}

function formatDate(timestamp, state) {
    if (state === "running") return parseInt(timestamp) === 0 ? "Jamais" : new Date(parseInt(timestamp)).toLocaleString()
    if (timestamp === null) return ""
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