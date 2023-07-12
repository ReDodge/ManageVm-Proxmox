const express = require('express');
const path = require("path");
const app = express()
const cors = require('cors')
const port = 5000

app.use(cors())

app.use("/utils", express.static('./utils/'));
app.use("/component", express.static('./component/'));

app.get("/logs",(req, res) => {
    res.sendFile(path.join(__dirname, "/page/logs.html"));
})

app.get("/",(req, res) => {
    res.sendFile(path.join(__dirname, "/page/index.html"));
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});