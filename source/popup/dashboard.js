import {saveDomains, getDomains, saveCategories, getCategories} from "../options/storage"

saveDomains([{
  domain: 'github.com',
  category: 'Frula',
  enabled: true
}]);

saveCategories([{
  name: "distraction",
  color: "#CC0000",
  icon: 'skull-crossbones',
  enabled: true
}])

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


document.onLoad = () =>{
  getCategories().then(categories=>{
    let categorySelect = document.getElementById("category-select");
    console.log(categories);
    categories.forEach(category => {
      console.log("cat");
      let o = document.createElement('option');
      o.innerText = category.name;
      o.value = category.name;
      categorySelect.add(o)
    });
  });
}
