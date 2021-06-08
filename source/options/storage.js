/*
{
domains: [
    {domain: something, category: something, enabled:true}
],
categories: [
          {
            name: something,
            color: soething,
            icon: something,
            enabled: true
          }
    ]
}
  
*/

function saveDomains(domains){
  browser.storage.sync.set({domains});
}
function saveCategories(categories){
  browser.storage.sync.set({categories});
}
function getDomains(){
  return browser.storage.sync.get('domains').then(res=>res.domains);
}
function getCategories(){
  return browser.storage.sync.get("categories").then(res=>res.categories);
}

