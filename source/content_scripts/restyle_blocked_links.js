import {getDomains} from "../options/storage"
import tinycolor from "tinycolor2"

function showDialog(url){
  let div = document.createElement('div');
  div.classList.add('domainblocker__dialog')
  div.innerHTML = `
      <h1>Are you sure you want to visit this url?</h1>
      <span>${url}</span>
      <div class="domainblocker__buttons">
        <button id="domainblocker__btn-no">No, take me back</button>
        <a href="${url}" class="domainblocker__blocked">Yes, take me there</a>
      </div>
    `
  document.body.append(div);
  document.querySelector(".domainblocker__dialog > .domainblocker__buttons > button").onclick = () => {
    document.body.removeChild(div);
  }
}


getDomains().then(domains=>{
  function blockLink(node) {
    if (node.nodeName === "A") {
      let url = new URL(node.href);
      if(url.hostname.endsWith(window.location.hostname)){
        return;
      }
      if(domains.map(d=>d.domain).includes(url.hostname)){
        if(!node.classList.contains('domainblocker__blocked')){
          node.classList.add('domainblocker__blocked');
          node.onclick = function(e){
            e.preventDefault();
            showDialog(node.href); 
            return false;
          };
          let color = "red";
          styles = `;
            background: 
              repeating-linear-gradient(
                135deg,
                ${tinycolor(color).lighten(20).toHexString()} ,
                ${tinycolor(color).lighten(20).toHexString()} 2px,
                #00000000 2px,
                #00000000 10px
              ),
              repeating-linear-gradient(
                45deg,
                ${tinycolor(color).lighten(20).toHexString()} ,
                ${tinycolor(color).lighten(20).toHexString()} 2px,
                ${tinycolor(color).lighten(40).toHexString()} 2px,
                ${tinycolor(color).lighten(40).toHexString()} 10px
              );
            border: 4px solid ${tinycolor(color).darken(20).toHexString()};
            color: ${tinycolor(color).darken(30).toHexString()};
            border-radius: 10px;
            padding: 5px 10px;
            `;

          node.style += styles;
        }
      }
    }
  }

// Start the recursion from the body tag.
for(let element of document.getElementsByTagName('a')){
blockLink(element);
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

