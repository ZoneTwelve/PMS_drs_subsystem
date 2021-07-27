window.onload = function(){
  for(let el of document.querySelectorAll('.func_label'))
    el.onclick = openLabel;
  document.querySelector('.func_label').onclick(); // init open label

  for(let el of document.querySelectorAll('.req-form'))
    el.onsubmit = request2api;
}

const loadingEvenet = {
  new   : updateGroupSelector,
  modify: ( form, next ) => {
    var count = 2;
    form.sheet_select.onchange = ( self ) => {
      let { target } = self;
      let opt = target.options[ target.selectedIndex ];
      let title = opt.data_title,
          state = opt.data_state,
          dt    = opt.data_dt,
          fid   = opt.data_fid;
      form.sheet_name.value = title || "";
      form.sheet_def_value.value = state || "";
      form.datatype.value = {
        boolean: 0,
        integer: 1,
        string:  2
      }[dt];
      for( let el of form.group_select.options){
        console.log( el, el.value, fid );
        if( el.value == fid ){
          el.selected = true;
        }
      }
    }
    updateSelector( form, () => { if( (--count) == 0 )next(); });
    updateGroupSelector( form, () => { if( (--count) == 0 )next(); } );
  },
  delete: updateSelector, // (form, next)
}

// i don't waana waste time to merge updateGroupSelector & updateSelector
function updateGroupSelector( form, next ){
  loadGroupInfo( ( data )=>{
    let selector = form.group_select;
    // clean select option
    selector.innerHTML = "";
    selector.appendChild( createElement("option", {innerText:"請選擇要操作的項目"}) );

    // apply every option
    for( let d of data ){
      console.log( d );
      selector.appendChild( createElement("option", {
        value:        d.dgs_id,
        innerText: `${d.dgs_id} - ${d.name}`,
      }) );
    }
    
    next( form, next );
  });
}

function updateSelector( form, next ){
  loadSheetInfo( ( data )=>{
    let selector = form.sheet_select;
    selector.innerHTML = "";
    selector.appendChild( createElement("option", {innerText:"請選擇要操作的項目"}) );
    for( let d of data ){
      console.log( d );
      selector.appendChild( createElement("option", {
        value:        d.dsc_id,
        innerText: `${d.dsc_id} - ${d.title}`,
        data_title: (d.title || ""),
        data_dt: (d.datatype || ""),
        data_state: (d.state || ""),
        data_fid: (d.group_id || ""),
        // data_title: d.title,
        // data_dt: d.datatype,
        // data_state: d.state,
      }) );
    }
    // append data into form selector
    
    next( form, next );
  });
}

function loadSheetInfo( callback ){
  fetch( '/api/v1/shsd/drs_sheet' ).then( res => {
    res.json().then( data => callback( data ) );
  } );
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
  let target  = document.querySelector(`#${name}-func`);
  let label   = document.querySelector(`[data-target="${name}"]`);
  let form    = document.querySelector(`#${name}-func > form`);
  let msg     = document.querySelector(`#${name}-func > .message`);


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
  // using for debug request2api( document.querySelector("#form-id") );
  let data, opt;
  form = ( form.action === undefined && form._method === undefined ) ? this : form;

  data = { 
          gid:    ((form.group_select && form.group_select.value) || undefined), 
          sid:    (form.sheet_select && parseInt(form.sheet_select.value) || undefined),
          title:  ((form.sheet_name && form.sheet_name.value) || undefined ),
          status: ((form.sheet_def_value && form.sheet_def_value.value) || undefined),
          datatype: ((form.datatype && form.datatype.value) || undefined),
        };
  opt = {
    method:form._method.value,
    headers:{
      'content-type':'application/json'
    },
    body: JSON.stringify( data ),
  };
  // console.log( opt )
  // return false;
  fetch( form.action, opt ).then( res => {
    if( res.status == 401 ){
      alert("");
      return false;
    }
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
