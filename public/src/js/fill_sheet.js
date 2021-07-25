var unsaved = false;
window.onload = function(){
  get( { url: "/api/v1/shsd/drs_group" }, applyGroupSelector );
  updateSheetForm();

  document.querySelector("#scanner").onclick = scannerView;

}

window.addEventListener("beforeunload", function (e) {
  if( !unsaved )
    return undefined;
  var confirmationMessage = `尚有資料還未存檔，確定要離開嗎?`;

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});

function scannerView( ){
  // let container = createElement("div", { className: "container camera-view" });
  let video     = document.querySelector("video");
  //createElement("video", { className: "camera-preview" });
  // container.appendChild( video );
  // document.body.appendChild( container );

  let scanner = new Instascan.Scanner({ video });
  scanner.addListener('scan', function (content) {
    console.log(content);
  });
  Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
      scanner.start(cameras[0]);
    } else {
      console.error('No cameras found.');
    }
  }).catch(function (e) {
    console.error(e);
  });
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
  let block = createElement( "div", {className: "drag-block"} );
  for( let i = 0 ; i < data.length ; i++ ){
    let d = data[ i ];
    let chunk = createElement("div", { className: "info-block drag-items", title:"拖動可調換順序" });

    chunk.draggable = true;
    // chunk.addEventListener("dragstart", dragStart);
    // chunk.addEventListener("drop", dropped);
    // chunk.addEventListener("dragenter", cancelDefault);
    // chunk.addEventListener("dragover", cancelDefault);
    // "G"+d.form_id+" - "+d.title  → Original method
    // `G${d.form_id} - ${d.title}` → Javascript ES6
    // "G$d.form_id - $d.title" → PHP 
    console.log( d );
    let head = createElement("div", {className:"row item-head"});
    let idlen = -(data.length > 9 ? 2 : 1);
    let oid   = ("0"+(i+1)).substr( idlen ); // order id
    console.log( idlen );
    head.appendChild( 
      createElement("span",  { innerText:`(${oid}) G${d.form_id} - ${d.title}`, className:"title lead px-2 col-11" })
      // createElement("div", {className:"col-8"}).appendChild(
      // )
    );
    head.appendChild(
      createElement("span", {className:"close-btn col-1", onclick: removeThisItem })
      // createElement("div", {className:"col-2"}).appendChild(
      // )
    );

    chunk.appendChild( head );
    chunk.appendChild(createElement("input", { type:"hidden", name:"colid[]", value:d.col_id, className:"db" }))
    chunk.appendChild(createElement("input", { type:"hidden", name:"newid[]", value:d.col_id, className:"db" }))
    chunk.appendChild(createElement("input", { placeholder: "狀態", name:"state[]", className:"db form-control pt-a", value: (d.state || "") }));
    chunk.appendChild(createElement("input", { placeholder: "備註", name:"notes[]", className:"db form-control pt-a", value: (d.notes || "") }));
    block.appendChild( chunk );
  }
  form.appendChild( block );

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

  if( !mobileDetect( ) )
    dragItems();
}

function dragItems( ){
  const draggables = document.querySelectorAll('.drag-items');
  const containers = document.querySelectorAll('.drag-block');

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
      draggable.classList.add('dragging')
    });
  
    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('dragging')
    });
  });
  
  containers.forEach(container => {
    container.addEventListener('dragover', e => {
      e.preventDefault()
      const afterElement = getDragAfterElement(container, e.clientY)
      const draggable = document.querySelector('.dragging')

      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement)
      }
    })
  })


}

function getDragAfterElement( container, y ){
  const draggableElements = [...container.querySelectorAll('.drag-items:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 4
    if (offset < 0 && offset > closest.offset) {
      unsaved = true;
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}


function closest( el, target, params ){
  params = params || { };
  while( el != null ){
    console.log( el );
    if(  el.tagName.toLowerCase() == target.toLowerCase() ){
      let keys = Object.keys( params );
      let same = true && keys.length > 0;
      for(let key of keys){
        if( el[ key ].indexOf( params[ key ] ) == -1 ){
          same = false;
          console.log( key );
        }
      }
      if( same )
        return el;
    }
    el = el.parentElement;
  }
  return el;
}

function removeThisItem( el = undefined ){
  el = el || this;
  let uri = `/api/v1${location.pathname}`;
  let block = closest( this, "div", {className:"info-block"} );
  
  if( block != null ){
    let title = block.querySelector('span.title').innerText;
    let colid = block.querySelector('[name="colid[]"]').value;
    console.log( "remove this item", colid );
    Swal.fire({
      title,
      icon: 'warning',
      html: `確定要刪除此項目嗎`,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: '刪除',
      confirmButtonAriaLabel: '刪除！',
      cancelButtonText: '取消'
    }).then( res => {
      if( res.isConfirmed ){
        request(uri, {
          headers: { 'Content-Type': 'application/json' },
          method:"DELETE",
          body: JSON.stringify( { col: colid } )
        }).then( ( res ) => {
          if( res.e != undefined ){
            return alert("Failed!");
          }else{
            return updateSheetForm();
          }
        });
      }
    });

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
      if( res.e )
        alert( res.e );
      updateSheetForm();
      // alert( JSON.stringify(res) );
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