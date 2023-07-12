const template = document.createElement('template');
template.innerHTML = `
    <nav class="navbar bg-[#2c3e50] px-2 sm:px-4 py-2.5 fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <div class="flex flex-row items-center">
            <a href="/" class="flex items-center w-1/5">
                <ion-icon name="tv-outline" title="false" style="font-size: 30px; padding-right: 5px; color: white"></ion-icon>
                <span class="self-center text-xl font-semibold whitespace-nowrap text-white">ManageVM</span>
            </a>
            <div class="items-center justify-between hidden md:flex md:w-600 md:order-1 w-3/5" id="navbar-sticky">
                <ul class="flex w-full justify-center flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-[#2c3e50] md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 dark:bg-[#2c3e50] md:dark:bg-[#2c3e50] dark:border-cyan-700">
                    <li>
                        <a href="/logs" class=" mt-5 block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-white md:p-0 dark:text-white" aria-current="page">Logs</a>
                    </li>
                    <li>
                    <input id="tableSearch" type="search"  class="block w-[500px] p-4 pl-10 text-sm border rounded-lg bg-gray-700 border-gray-600 placeholder-gray-400 text-white" placeholder="Recherche...">
                    </li>
                </ul>
            </div>
            <div class=" md:flex md:w-1/5 md:order-1 justify-end">  
            </div>
        </div>
    </nav>
`
document.body.appendChild(template.content);