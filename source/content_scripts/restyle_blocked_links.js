import {getDomainsFull} from "../options/storage"
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
  document.querySelector(".domainblocker__dialog > .domainblocker__buttons > a").onclick = () => {
    document.body.removeChild(div);
  }
  document.querySelector(".domainblocker__dialog > .domainblocker__buttons > button").onclick = () => {
    document.body.removeChild(div);
  }
}

function blockLink(domains, node) {
  if (node.nodeName === "A") {
    let url = new URL(node.href);
    if(url.hostname == "" || url.hostname.endsWith(window.location.hostname)){
      return;
    }

    let d = domains.find(dom => dom && dom.domain && url.hostname.endsWith(dom.domain));
    if(!d) return;
    if(!node.classList.contains('domainblocker__blocked')){
      node.classList.add('domainblocker__blocked');
      node.onclick = function(e){
        e.preventDefault();
        showDialog(node.href); 
        return false;
      };
      let color = d.color;
      let icon = d.icon;

      styles = `;
          background: ${tinycolor(color).lighten(40).setAlpha(.7).toRgbString()};
          border-right: 4px solid ${tinycolor(color).darken(20).toHexString()};
          border-left: 4px solid ${tinycolor(color).darken(20).toHexString()};
          color: ${tinycolor(color).darken(30).toHexString()};
          padding: 0 10px;
        `;

      node.style += styles;
      node.innerHTML = `<svg class="domainblocker__icon">
          <use xlink:href="${browser.extension.getURL("./static/solid.svg")}#${icon}" fill="currentColor"></use>
        </svg>` + node.innerHTML;
    }
  }
}
getDomainsFull().then(domains=>{
  for(let element of document.getElementsByTagName('a')){
    blockLink(domains, element);
  };
});

const observer = new MutationObserver((mutations) => {
  getDomainsFull().then(domains=>{
    mutations.forEach((mutation) => {
      blockLink(domains, mutation.target);
    });
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["href"]
});
