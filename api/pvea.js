const pveajs = require("pvea")

const pvea = new pveajs("your-server-proxmox", "user_proxmox", "password_proxmox")

pvea.run()

module.exports = pvea