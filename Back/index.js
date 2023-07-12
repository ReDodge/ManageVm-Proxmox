const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require("cors")
const path = require('path');
const dns = require("dns").promises
const app = express()
const port = 4000
const bodyParser = require('body-parser')
const cron = require('node-cron');
const StoppingAt = require('./checker/stoppingAt')
const VmExist = require('./checker/vmExist')


const getProxmoxRouter = require("./routers/get/getProxmox")
const getLogsRouter = require("./routers/get/getLogs")
const getVmsDbRouter = require("./routers/get/getVmsDb")
//const getLockedVmsRouter = require("./routers/get/getLockedVms")

const startRouter = require("./routers/actions/start")
const shutdownRouter = require("./routers/actions/shutdown")
const extendRouter = require("./routers/actions/extend")

app.use(cors())
app.use(bodyParser.json())
// Reverse dns pour trouver le nom de la machine cliente
app.use(async (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.ip;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    try {
        req.domain = (await dns.reverse((ip + ",").split(",")[0]))[0]
    } catch {
        req.domain = "Unknown"
    }
    next()
});

app.get("/api/getProxmox", getProxmoxRouter)
app.get("/api/getLogs", getLogsRouter)
app.get("/api/getVms", getVmsDbRouter)

//app.post("/postLogs", logsRouter)
app.post("/api/shutdown", shutdownRouter)
app.post("/api/start", startRouter)
app.post("/api/extend", extendRouter)

setInterval(function() {
    fetch('http://managevm.cit.local:4000/api/getProxmox')
        .then((response) => response.json())
    StoppingAt()
    VmExist()
}, 300000);

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});