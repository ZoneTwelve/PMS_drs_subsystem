/**
 * @typedef {Object} createElementOptionsChildren
 * @property {HTMLElementTagNameMap|String} createElementOptionsChildren.childNodeTag 
 * @property {HTMLAnchorElement} createElementOptionsChildren.anchor
 * @property {createElementOptions=} createElementOptionsChildren.options
 */
/**
 * @typedef {Object} createElementOptions
 * @property {Array<createElementOptionsChildren>} createElementOptions.objChildren
 * @property {Array<{eventName:String,linster:Function}>} createElementOptions.eventEmitters
 */
/**
 * 建立HTML DOM包裝函式
 * @param {HTMLElementTagNameMap | String} tag -HTML Element Tag Name
 * @param {HTMLAnchorElement} obj -Anchor
 * @param {createElementOptions} Option -Nested Child HTML Element Node
 * @returns {HTMLElement} A HTML Element
 */
const createElement = (tag, obj, Option={objChildren:undefined, eventEmitters:undefined}) => {
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
    if ( Option ) {
        if (typeof (Option.eventEmitters) === "object" && Array.isArray(Option.eventEmitters)) {
            for (let i in Option.eventEmitters) {
                if (typeof (Option.eventEmitters[i]["linster"]) === "function") {
                    el.addEventListener(Option.eventEmitters[i]["eventName"],Option.eventEmitters[i]["linster"]);
                }
            }
        }
        if (typeof (Option.objChildren) === "object" && Array.isArray(Option.objChildren)) {
            for (let i in Option.objChildren) {
                let child = createElement(Option.objChildren[i]["childNodeTag"],Option.objChildren[i]["anchor"],Option.objChildren[i]["options"]);
                el.append(child);
            }
        }
    }
    return el;
}

const mobileDetect = ( ua ) => {
  ua = ua || navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( ua );
}
