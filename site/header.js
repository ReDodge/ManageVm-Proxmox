const template = document.createElement('template');
template.innerHTML = `
  <nav class="navbar navbar-light bg-light-blue justify-content-between fixed-top navbar-expand-lg " style="background-color: #4863ff;">
  <div class="container-fluid d-flex justify-content-start">
        <ion-icon name="tv-outline" style="font-size: 30px; padding-right: 5px; color: white"></ion-icon>
        <a class="navbar-brand text-white" href="/">VM Manager</a>
        <div class=" collapse navbar-collapse">
            <ul class="navbar-nav mr-auto mt-5 mt-lg-2 d-inline-flex p-0">
                <li class="nav-item active d-inline-flex p-l-2">
                   <ion-icon name="document-text-outline align-middle" style="color: white" ></ion-icon>
                    <a class="nav-link p-l-2 text-white" href="/logs.html">Logs</a>
                </li>
            </ul>
            <div class=".d-none">
                <img class="position-absolute top-0 end-0 .d-none" style="height: 100%; padding: 10px;" src="Qubes.jpg">              
            </div>
       </div>
   </div>
   <input class="form-control position-fixed" id="tableSearch" style="margin-top: 100px;" type="text"  placeholder="Recherche..">
</nav>
`
document.body.appendChild(template.content);