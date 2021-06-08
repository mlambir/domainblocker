let btn = document.querySelector("#options_button");
console.log(saveDomains);
saveDomains([{domain: 'github.com', category: ''}]);

btn.addEventListener("click", (e) => {
    getDomains().then(domains => console.log(domains));
    //browser.runtime.openOptionsPage();
})
