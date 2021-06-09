/*
{
domains: [
    {
    	domain: something,
    	category: something,
    	enabled:true
    }
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

export function saveDomains(domains){
  return browser.storage.sync.set({domains});
}
export function saveCategories(categories){
  return browser.storage.sync.set({categories});
}
export function getDomains(){
  return browser.storage.sync.get('domains').then(res=>res.domains);
}
export function getCategories(){
  return browser.storage.sync.get("categories").then(res=>res.categories);
}

