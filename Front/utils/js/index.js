function reload() {
    fetch('https://managevm.creative-it.fr/api/getVms', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((vms) => renderVmList(vms))
        .catch((err) => {
            console.log(`error: ${err}`);
        });
}

reload();

function renderVmList(vms) {
    const success = document.getElementById('toast-success');
    const error = document.getElementById('toast-danger');

    function checkError(response, modal) {
        if (response.status === 200) {
            modal.style.display = 'none';
            success.style.display = 'flex';
            window.setTimeout(function() {
                $('#list').load(location.href + ' #list');
                reload();
            }, 8000);
            setTimeout(function() {
                success.style.display = 'none';
            }, 5000);
            return false;
        } else {
            modal.style.display = 'none';
            error.style.display = 'flex';
            setTimeout(function() {
                error.style.display = 'none';
            }, 5000);
        }
    }

    vms.forEach((vm) => {
        let actions = $("<td class='text-center'>")
        let extend = $("<td class='flex mt-2.5 justify-center'>")
        let extendButton = $("<div style=\"margin-top: 8px\">" + formatDate(vm.stoppingAt, vm.status) + "</div>" + "<button class='text-white bg-[#2980b9] hover:bg-purple-800 focus:outline-none ml-3 focus:ring-4 focus:ring-purple-300 font-medium rounded-md text-sm px-3 py-1.5 text-center mb-2 dark:bg-[#2980b9] dark:hover:bg-purple-700 dark:focus:ring-purple-900'><ion-icon name='create-outline' size='' style='color: white;font-weight: 25px'></ion-icon></button>")
        let row = $("<tr class='border-b-2 border-gray-100 hover:bg-gray-200'>")
        row.append("<td  data-placement='top' title=" + vm.vmId + " + class='align-middle  w-[5%] pl-2.5 text-black font-semibold '>" + vm.vmName + "</td>")
        row.append("<td class='align-middle text-black font-semibold text-center w-[14%]'>" + vm.node + "</td>")
        row.append("<td class='text-center align-middle w-[22%]'>" + formatTime(vm.uptime) + "</td>")

        if (vm.status === 'running') {
            const modal = document.getElementById('extend-modal');
            extend.append(extendButton);
            extendButton.on('click', () => {
                const vmId = vm.vmId;
                const node = vm.node;
                let days = Date.now() + 7 * 86400000;
                const jour = parseInt(document.querySelector('#extend-days').value) * 86400000;
                const action = 'prolongation';

                modal.style.display = 'block';
                document.querySelector('#extend-name').value = Cookies.get('name') || '';
                document.querySelector('#extend-date').textContent = new Date(Date.now() + jour).toLocaleString();
                $('#extend-days').on('keyup', function() {
                    document.querySelector('#extend-date').innerHTML = new Date(Date.now() + parseInt(document.querySelector('#extend-days').value) * 86400000).toLocaleString();
                    days = Date.now() + parseInt(document.querySelector('#extend-days').value) * 86400000;
                });
                document.getElementById('extend-cross').addEventListener('click', function() {
                    modal.style.display = 'none';
                });
                document.getElementById('extend-close').addEventListener('click', function() {
                    modal.style.display = 'none';
                });
                $('#extend-form').on('submit', async () => {
                    const name = document.querySelector('#extend-name').value;
                    Cookies.set('name', name, {
                        SameSite: 'Lax',
                        expires: 31,
                    });
                    const response = await fetch(`${API_URL}/extend`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            vmId,
                            node,
                            name,
                            days,
                            action,
                        }),
                    });
                    checkError(response, modal);
                });
            });
            row.append(extend)
        } else {
            row.append("<td class='align-middle'>" + (formatDate(vm.stoppingAt)) + "</td>")
        }
        if (vm.status === "stopped") {
            row.append("<td class='text-center align-middle'>" + ("") + "</td>")
        } else {
            row.append("<td class='text-center align-middle'>" + (vm.ownerName || "") + "</td>")
        }
        if (vm.status === 'stopped') {
            const modal = document.getElementById('start-modal');
            const startButton = $('<button type="button" class="w-40 focus:outline-none mt-1.5 text-white bg-[#27ae60] hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-1.5 dark:bg-[#27ae60] dark:hover:bg-green-700 dark:focus:ring-green-800">Démarrer</button>');
            startButton.attr('data-modal-toggle', 'defaultModal');
            startButton.on('click', () => {
                const vmId = vm.vmId;
                const node = vm.node;
                let days = Date.now() + 14 * 86400000;
                const action = 'démarrage';
                const jour = parseInt(document.querySelector('#start-days').value) * 86400000;

                modal.style.display = 'block';
                document.querySelector('#start-name').value = Cookies.get('name') || '';
                document.querySelector('#start-date').textContent = new Date(Date.now() + jour).toLocaleString();
                document.getElementById('start-days').addEventListener('keyup', function() {
                    document.querySelector('#start-date').innerHTML = new Date(Date.now() + parseInt(document.querySelector('#start-days').value) * 86400000).toLocaleString();
                    days = Date.now() + parseInt(document.querySelector('#start-days').value) * 86400000;
                });
                document.getElementById('start-cross').addEventListener('click', function() {
                    modal.style.display = 'none';
                });
                document.getElementById('start-close').addEventListener('click', function() {
                    modal.style.display = 'none';
                });
                document.getElementById("startForm").onsubmit = async () => {
                    let name = document.getElementById("start-name").value;
                    Cookies.set("name", name, {
                        SameSite: "Lax",
                        expires: 31
                    });
                    const response = await fetch(API_URL + "/start", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            vmId,
                            node,
                            name,
                            days,
                            action
                        })
                    });
                    checkError(response, modal);
                };
            })
            actions.append(startButton);
        } else if (vm.status === 'running' || vm.status === 'stopping') {
            const shutdownButton = document.createElement('button');
            shutdownButton.type = 'button';
            shutdownButton.className =
                'w-40 mt-1.5 focus:outline-none text-white bg-[#c0392b] hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-1.5 text-center dark: bg-[#c0392b] dark:hover:bg-red-700 dark:focus:ring-red-900 ';
            shutdownButton.innerText = 'Suspendre';
            shutdownButton.dataset.vmId = vm.vmId;
            shutdownButton.dataset.node = vm.node;
            const modal = document.getElementById('stop-modal');
            document.getElementById('closeModal').addEventListener('click', function() {
                modal.style.display = 'none';
            });
            document.getElementById('cross').addEventListener('click', function() {
                modal.style.display = 'none';
            });
            shutdownButton.addEventListener('click', () => {
                const name = Cookies.get('name');
                const vmId = vm.vmId;
                const node = vm.node;
                document.getElementById('stop').addEventListener('click', async () => {
                    const response = await fetch(API_URL + '/shutdown', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            vmId,
                            node,
                            name,
                        }),
                    });
                    checkError(response, modal);
                });
                modal.style.display = 'block';
            });
            actions.append(shutdownButton);
        }
        row.append(actions);
        $('table').append(row)
    })
}