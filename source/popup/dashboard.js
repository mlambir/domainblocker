import {saveDomains, getDomains, saveCategories} from "../options/storage"

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
    browser.runtime.openOptionsPage();
})
