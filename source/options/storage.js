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
export function getDomainsFull(){
  return browser.storage.sync.get().then(res=>{
    categories = {}
    for (const category of res.categories) {
      categories[category.name] = category;
    }
    return res.domains.map(d=>{
      let category = categories[d.category];
      if(category){
        d.color = category.color;
        d.icon = category.icon;
        return d;
      }
    })
  });
}
