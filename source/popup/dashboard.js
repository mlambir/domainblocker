import {saveDomains, getDomains, saveCategories, getCategories} from "../options/storage"

document.querySelector("#options-button").addEventListener("click", (e) => {
    browser.runtime.openOptionsPage();
})

document.querySelector("#block-domain").addEventListener("click", (e) => {
  browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
  .then(tabs => browser.tabs.get(tabs[0].id))
  .then(tab => {
    let url = new URL(tab.url);
    document.getElementById("domain-input").value = url.hostname;
    document.getElementById("add-domain").hidden = false;
  });
})


document.querySelector("#add-domain").addEventListener("click", (e) => {
  getDomains().then(domains=>{
    let domain = {domain: document.getElementById('domain-input').value, 
                  category: document.getElementById('category-select').value, 
                  enabled:true};
    domains.push(domain);
    saveDomains(domains)
  })
})



window.onload = () =>{
  getCategories().then((categories)=>{
    let categorySelect = document.getElementById("category-select");
    categories.forEach(category => {
      let o = document.createElement('option');
      o.innerText = category.name;
      o.value = category.name;
      categorySelect.add(o)
    });
  });
}
