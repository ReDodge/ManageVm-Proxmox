const express = require('express');
const dns = require("dns").promises

const app = express();

app.use(async (req, res) => {

    let ip = req.headers['x-forwarded-for'] || req.ip;
    if (ip.substr(0, 7) == "::ffff:") {
      ip = ip.substr(7)
    }

    const domains = await dns.reverse(ip)
    console.log(domains)
    res.send(domains)
});

app.listen(3000, () =>
    console.log('Server started on port 3000')
);