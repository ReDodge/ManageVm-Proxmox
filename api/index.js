const express = require("express")
const cors = require("cors")


const dns = require("dns").promises

const app = express()
const port = 3000

const bodyParser = require('body-parser')

const getVmsRouter = require("./routers/getVms")
const getLogsRouter = require("./routers/getLogs")
const getVmsListRouter = require("./routers/vmList")

const subscribeRouter = require("./routers/subscribe")
const logsRouter = require("./routers/postLogs")
const shutdownRouter = require("./routers/shutdown")
const extendRouter = require("./routers/extend")

app.use(cors())
app.use(bodyParser.json())


// Reverse dns pour trouver le nom de la machine cliente
app.use(async (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.ip;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    try {
        req.domain = (await dns.reverse(ip))[0]
    } catch {
        req.domain = "Unknown"
    }

    next()
});

app.get("/getVms", getVmsRouter)
app.get("/getLogs", getLogsRouter)
app.get("/getVmsList", getVmsListRouter)

app.post("/postLogs", logsRouter)
app.post("/shutdown", shutdownRouter)
app.post("/subscribe", subscribeRouter)
app.post("/extend", extendRouter)

app.listen(port, () => {
    console.log(`Application listening at http://localhost:${port}`)

    require("./tasks")
})