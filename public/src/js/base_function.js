/**
* Create HTML Element Function
* @param {HTMLElementTagNameMap | String} tag -HTML Element Tag Name
* @param {HTMLAnchorElement} obj -Anchor
* @returns {HTMLElement} A HTML Element
*/
const createElement = (tag, obj) => {
  let el = document.createElement(tag);
  if(typeof obj=="object"){
    let list = Object.keys(obj);
    for(var i=0;i<list.length;i++){
      let key = list[i];
      if(typeof obj[key]!='object'){
        el[key] = obj[key];
      }else
        for(let k of Object.keys(obj[key])){
          el[key][k] = obj[key][k];
        }
    }
  }
  return el;
}

const mobileDetect = ( ua ) => {
  ua = ua || navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( ua );
}
