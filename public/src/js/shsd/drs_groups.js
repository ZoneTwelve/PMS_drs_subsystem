window.onload = function(){
  for(let el of document.querySelectorAll('.func_label'))
    el.onclick = openLabel;
  for(let el of document.querySelectorAll('.req-form'))
    el.onsubmit = request2api;
}

const loadingEvenet = {
  modify: ( form, next ) => {
    updateSelector( form, () => {
      form.group_name.value = "";
      form.visible.checked = false;
      form.group_select.onchange = () => {
        let el = form.group_select.options[form.group_select.selectedIndex];
        console.log( el.data_name );
        form.group_name.value = el.data_name;
        form.visible.checked = el.visible;
      }
      next();
    } )
  },
  delete: updateSelector, // (form, next)
}

function updateSelector( form, next ){
  loadGroupInfo( ( data )=>{
    let selector = form.group_select;
    selector.innerHTML = "";
    selector.appendChild( createElement("option", {innerText:"請選擇要操作的項目", hidden:true}) );
    for( let d of data ){
      console.log( d );
      selector.appendChild( createElement("option", {
        value:     d.dgs_id,
        innerText: `${d.dgs_id} - ${d.name}`,
        data_name: d.name,
        visible: d.visible
      }) );
    }
    // append data into form selector
    
    next();
  });
}

function loadGroupInfo( callback ){
  fetch( '/api/v1/shsd/drs_group' ).then( res => {
    res.json().then( data => {
      callback( data );
    } )
  });
}

function openLabel( name ){
  name = (this.getAttribute && this.getAttribute("data-target")) || name;

  for(let el of document.querySelectorAll(".func_content"))
    el.classList.remove("func_content_show");
    for(let el of document.querySelectorAll(".func_label"))
    el.classList.remove("func_label_show");
  
  let loadFun = loadingEvenet[ name ];
  let target = document.querySelector(`#${name}-func`);
  let label  = document.querySelector(`[data-target="${name}"]`);
  let form   = document.querySelector(`#${name}-func > form`);
  let msg    = document.querySelector(`#${name}-func > .message`);


  label.classList.add("func_label_show");
  target.classList.add("func_content_show");
  
  if( loadFun !== undefined ){
    msg.style.display = "inline-block";
    form.style.display = "none";
    loadFun( form, () => {
      form.style.display = "inline-block";
      msg.style.display = "none";
    } );
  }
}

function request2api( form, callback ){ 
  // using for debug request2api( document.querySelector("#form-id") ); // document.form_name
  let data, opt;
  form = ( form.action === undefined && form._method === undefined ) ? this : form;

  data = { 
          name: ((form.group_name && form.group_name.value) || undefined), 
          id:(form.group_select && parseInt(form.group_select.value) || undefined), 
          visible: form._method!='DELETE' ? (form.visible && form.visible.checked) : undefined
        };
  opt = {
    method:form._method.value,
    headers:{
      'content-type':'application/json'
    },
    body: JSON.stringify( data ),
  };
  
  if( form._method.value!="POST" && data.id == undefined ){
    alert("缺少選擇項目")
    return false;
  }
  fetch( form.action, opt ).then( res => {
    res.json().then( data => {
      if( data.error ){
        alert( data.error );
      }else{
        alert("請求成功");
      }
      openLabel("new");
    })
  } );

  return false;
}
