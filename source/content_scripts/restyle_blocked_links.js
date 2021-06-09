import {getDomains} from "../options/storage"

getDomains().then(domains=>{

  function replaceText (node) {
    if (node.nodeName === "A") {
      let url = new URL(node.href);
      if(domains.map(d=>d.domain).includes(url.hostname)){
        node.classList.add('domainblocker__blocked');
      }
    }
  }

// Start the recursion from the body tag.
for(let element of document.getElementsByTagName('a')){
replaceText(element);
};

// Now monitor the DOM for additions and substitute emoji into new nodes.
// @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
const observer = new MutationObserver((mutations) => {
mutations.forEach((mutation) => {
if (mutation.addedNodes && mutation.addedNodes.length > 0) {
// This DOM change was new nodes being added. Run our substitution
        // algorithm on each newly added node.
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const newNode = mutation.addedNodes[i];
          replaceText(newNode);
        }
      }
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})

