const pvea = require("./utils/pvea");

async function test () {
let ip = await pvea.getCurrentQemuVmState("epyc6515", 5262029)

console.log(ip)
}
test()