window.onload = function(){
  get( { url: "/api/v1/shsd/drs_group" }, applyGroupSelector );
  updateSheetForm();
}

function updateSheetForm(){
  let uid = location.href.split("/").pop();
  request( `/api/v1/dorm/sheet/${ uid }`, {
    method: "GET"
  }).then( data => {
    if( !data.e ){
      return applySheetColumns( data );
    }else{
      return alert("Loading failed!");
    }
  } );
}

function applySheetColumns( data ){
  let form = document.checklist;
  form.innerHTML = "";
  for( let i = 0 ; i < data.length ; i++ ){
    let d = data[ i ];
    let chunk = createElement("div", { className: "info-block drag-block" });

    chunk.draggable = true;
    chunk.addEventListener("dragstart", dragStart);
    chunk.addEventListener("drop", dropped);
    chunk.addEventListener("dragenter", cancelDefault);
    chunk.addEventListener("dragover", cancelDefault);
    // "G"+d.form_id+" - "+d.title  → Original method
    // `G${d.form_id} - ${d.title}` → Javascript ES6
    // "G$d.form_id - $d.title" → PHP 
    console.log( d );
    chunk.appendChild(createElement("span",  { innerText:`G${d.form_id} - ${d.title}`, className:"lead px-2" }));
    chunk.appendChild(createElement("input", { type:"hidden", name:"colid[]", value:d.col_id, className:"db" }))
    chunk.appendChild(createElement("input", { placeholder: "狀態", name:"state[]", className:"db form-control pt-a", value: (d.state || "") }));
    chunk.appendChild(createElement("input", { placeholder: "備註", name:"notes[]", className:"db form-control pt-a", value: (d.notes || "") }));
    form.appendChild( chunk );
  }

  form.appendChild( data.length == 0 ? 
                    createElement("h1", {innerText:"No Data"}) :
                    createElement("button", {className:"btn btn-success pt-a", innerText:"送出"}) 
                  );

  form.onsubmit = ( ) => {
    let uri = `/api/v1${location.pathname}`;
    let dataElement = document.querySelectorAll('.db');
    let data = new Object(); // { 'colid[]': [], 'state[]': [], 'notes[]': [] };
    for( let i = 0 ; i < dataElement.length ; i += 3 ){
      let column = dataElement[ i ],
          status = dataElement[i+1],
          note   = dataElement[i+2];
      
      data[ column.name ] = data[ column.name ] || [];
      data[ status.name ] = data[ status.name ] || [];
      data[  note.name  ] = data[  note.name  ] || [];

      data[ column.name ].push(column.value);
      data[ status.name ].push(status.value);
      data[  note.name  ].push( note.value );
    }
    form.innerHTML = "<h1>Loading...</h1>"
    request(uri, {
      headers: { 'Content-Type': 'application/json' },
      method: "PUT",
      body: JSON.stringify( data )
    }).then( (res) => {
      updateSheetForm();
    } )

    return false;
  }
}

function dragStart( e ){
  let index = 0;
}

function applyGroupSelector( json ){
  let form = document.groupSelector;
  form.sel_group.innerHTML = "";
  // let optGroup = createElement("optgroup", {label:"請選擇一個項目"});
  form.sel_group.appendChild( createElement("option", { innerText:"請選擇一個項目", hidden:true}) );
  for( let obj of json ){
    console.log( obj );
    form.sel_group.appendChild( createElement("option", {
      innerText: `${obj.dgs_id} - ${obj.name}`,
      value: obj.dgs_id,
    }));
  }

  document.groupSelector.onsubmit = function( ){
    let body = JSON.stringify({ group: this.sel_group.value });
    let uri = `/api/v1${location.pathname}`;

    request(uri, {
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: this._method.value, 
      body
    }).then( ( res ) => {
      updateSheetForm();
      alert( JSON.stringify(res) );
    } );
    return false;
  }
}

// just using for transfer data into json
function request( url, opt ){
  return fetch( url, opt ).then( res => res.json() );
}

function get( opt, callback ){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = ( ) => {
    console.log( xhr.readyState, xhr.status );
    if( xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)){
      callback( JSON.parse(xhr.responseText) );
    }
    else if( xhr.readyState == 4 ){
      callback( { error:"Failed", code: xhr.status } );
    }
  }
  xhr.open("GET", opt.url, true);
  xhr.send();
}