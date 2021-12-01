fetch('http://your-server:3000/getVms', {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    },
})
    .then(function (response) {
        return response.json();
    })
    .then(function (vms) {
        renderVmList(vms);
    })
    .catch(function (err) {
        console.log('error: ' + err);
    });

function renderVmList(vms) {

    let table = $("#list").html;

    setTimeout(function () {
        window.location.reload(1)
    }, 300000);

    vms.forEach(vm => {

        if (vm.status === "running" && vm.stoppingAt === 0 && vm.owner !== "")
            vm.status = "stopping"
        let actions = $("<td class='align-middle justify-content-center'>")
        let extend = $("<td class=\"d-flex\">")
        let extendButton = $("<div style=\"margin-top: 8px\">" + formatDate(vm.stoppingAt, vm.status) + "</div>" + "<button class=\"btn btn-primary px-3\" style=\'margin-left: 10px;\'> <ion-icon name=\"create-outline\" size='' style=\"color: white;font-weight: 25px\"></ion-icon></button>")

        let row = $("<tr>")
        row.append("<td data-toggle=\"tooltip\" data-placement='top' title=" + vm.vmId + " class='align-middle'>" + vm.vmName + "</td>")
        row.append("<td class='align-middle'>" + vm.node + "</td>")
        row.append("<td class='align-middle'>" + (formatTime(vm.uptime)) + "</td>")
        if (vm.status === "running") {
            extend.append(extendButton)
            extendButton.data("vmId", vm.vmId)
            extendButton.data("node", vm.node)
            extendButton.on("click", () => {
                new bootstrap.Modal($("#extend")).toggle(extendButton)
            })
            row.append(extend)
        } else {
            row.append("<td class='align-middle'>" + (formatDate(vm.stoppingAt)) + "</td>")
        }
        if (vm.status === "stopped") {
            row.append("<td class='text-center align-middle'>" + ("") + "</td>")
        } else {
            row.append("<td class='text-center align-middle'>" + (vm.ownerName || "") + "</td>")
        }
        if (vm.status === "stopped") {

            let button = $("<button type=\"button\" class=\"btn btn-success btn-block\" style=\"width: 80%\" >Démarrer</button>")
            button.data("vmId", vm.vmId)
            button.data("node", vm.node)
            button.on("click", () => {
                new bootstrap.Modal($("#modal")).toggle(button)
            })
            actions.append(button)

        } else if (vm.status === "running" || vm.status === "stopping") {
            // let extendButton = $("<button class=\"btn btn-primary\"><ion-icon name=\"create-outline\" style=\"color: white\"></ion-icon></button>")
            let shutdownButton = $("<button class=\"btn btn-danger btn-block\" style=\"width: 80%\">Suspendre</button>")


            shutdownButton.data("vmId", vm.vmId)
            shutdownButton.data("node", vm.node)
            shutdownButton.on("click", () => {
                new bootstrap.Modal($("#confirm-delete")).toggle(shutdownButton)
            })
            actions.append(shutdownButton)
            //actions.append(extendButton)

        }
        row.append(actions)
        $('table').append(row)
    })
}

$(document).ready(() => {

    $("#name").val(Cookies.get("name"))

    $("#confirm-delete").on("show.bs.modal", (event) => {
        let vmId = event.relatedTarget.data("vmId")
        let node = event.relatedTarget.data("node")
        let name = Cookies.get("name")
        $("#stop").off("click").on("click", async () => {
            $('#confirm-delete').modal('hide')
            $("#stopToast").toast("show");
            $('#stopToast').on('hidden.bs.toast', function () {
                window.location.reload();
            })
            await shutdownVm(vmId, node, name, "suspension")
        });
    })
    $("#extend").on("show.bs.modal", (event) => {
        let vmId = event.relatedTarget.data("vmId")
        let node = event.relatedTarget.data("node")
        $("#nom").val(Cookies.get("name"))
        $("#extend-confirm").off("click").on("click", async () => {
            let name = $("#nom").val()

            let jours = $("#jours").val() || 0
            if (jours >= 0) {
                $('#extend').modal('hide')
                $("#extendToast").toast("show");
                $('#extendToast').on('hidden.bs.toast', function () {
                    window.location.reload();
                })
                await enableVm(vmId, node, name, jours, "prolongation")
            } else {
                $('#extend').modal('hide')
                $("#errorToast").toast("show");
            }
        })
    })
    $("#modal").on("show.bs.modal", (event) => {
        let vmId = event.relatedTarget.data("vmId")
        let node = event.relatedTarget.data("node")
        $("#name").val(Cookies.get("name"))

        $("#modal-confirm").off("click").on("click", async () => {
            let name = $("#name").val()
            Cookies.set("name", name, {
                SameSite: "Lax",
                expires: 31
            })

            let days = ($("#days").val()) || 0
            if (days >= 0) {
                $('#modal').modal('hide')
                $("#startToast").toast("show");
                $('#startToast').on('hidden.bs.toast', function () {
                    window.location.reload();
                })
                await subscribeVm(vmId, node, name, days, "démarrage")
            } else {
                $('#extend').modal('hide')
                $("#errorToast").toast("show");
            }
        })
    })
})