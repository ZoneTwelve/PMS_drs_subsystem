var page = 0, unsaved = false;
window.onload = ( ) => {
  downloadBulletin( );
}

window.addEventListener("beforeunload", function (e) {
  if( !unsaved )
    return undefined;
  var confirmationMessage = `尚有資料還未存檔，確定要離開嗎?`;

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});

function downloadBulletin( ){
  request( `/api/v1/shsd/bulletin?page=${ (parseInt(page) || 0) * 10 }`, { method:"GET" } ).then( data => nextAction( data, "#bulletin_list", updateBulletinColumns ) );
}

function updateBulletinColumns( data ){
  // create sheet columns 
  let block = document.querySelector("#bulletin_list");
  let sheet = createElement("ul", { className: "list-group pt-3 lead" });
  block.innerHTML = "";

  for( let d of data ){
    let a = createElement("a", { className: "sheet-columns text-decoration-none", onclick: () => editBulletin( d ) }),
        li = createElement("li", { className: "list-group-item" }),
        sub = createElement("sub", { innerText: d.time }),
        span = createElement("span", { innerText: `${d.bulletin_id}. ${d.poster} ` });
    li.appendChild( span );
    li.appendChild( sub );
    a.appendChild( li );
    sheet.appendChild( a );
  }
  block.appendChild( sheet );

  // if data is empty create a message "No Data" with animation
  document.querySelector("#new_bulletin_btn").onclick = ( ) => {
    request("/api/v1/shsd/bulletin", {
      method:"POST"
    }).then( data => nextAction( data, null, downloadBulletin ) );
  }
  if( data.length == 0 )
    block.appendChild( createElement("h2", { innerText:"No Data", className: "dotdotdot" }) );

  let selectPage = createElement("div", { className: "row list-of-page pt-3" });
  selectPage.appendChild( createElement("div", { className: "col-2", innerText: '﹤' , onclick: () => {
    page = (page || 1) - 1;
    downloadBulletin( );
  }}) );
  for( let i = (page || 1) - 1 ; i < (page || 1) + 3 ; i++ ){
    let active = ( page == i ) ? ' active' : '';
    selectPage.appendChild( createElement("div", { className: `col-2 ${active}`, innerText: (data.length < 10 && (i || 0) > page)?"...":`${i + 1}`, onclick: ( self ) => {
      let p = (parseInt( self.target.innerText )) || null;
      if( data.length < 10 && p > page || p === null )
        return ;
      page = p - 1;
      downloadBulletin( );
    } }) );
  }
  selectPage.appendChild( createElement("div", { className: "col-2", innerText: '﹥', onclick: () => {
    page = data.length < 10 ? page : page+1;
    downloadBulletin( );
  } }) );
  block.appendChild( selectPage );
}

function editBulletin( data ){
  let block = document.querySelector("#edit_bulletin"),
      lists = document.querySelector("#bulletin_list"),
      form  = block.querySelector("form");
  lists.classList.add("hidden-block");
  block.classList.remove("hidden-block");
  block.querySelector("h2").innerText = `${data.bulletin_id} - ${ data.title || "無標題" }`;
  block.querySelector(".author").innerText = `${data.poster}, 於 ${data.m_time}`;
  
  form.bulletin_id.value = data.bulletin_id;
  form.title.value       = data.title;
  form.content.value     = data.content;
  form.title.oninput   = unsavedAction;
  form.content.oninput = unsavedAction;
  form.querySelector(".cancel-btn").onclick = ( ) => {
    if( unsaved && !confirm("尚未存檔，確定要取消編輯？") )
      return;
    lists.classList.remove("hidden-block");
    block.classList.add("hidden-block");
    unsaved = false;
    downloadBulletin();
  }
  form.querySelector(".delete-btn").onclick = ( ) => {
    if( !confirm("確定要刪除?") )
      return;
    lists.classList.remove("hidden-block");
    block.classList.add("hidden-block");
    unsaved = false;
    request("/api/v1/shsd/bulletin", {
      method:"DELETE",
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( { bid: form.bulletin_id.value } )
    } ).then( res => {
      unsaved = false;
      downloadBulletin();
    } )
  }
  form.onsubmit = ( ) => {
    let bid     = form.bulletin_id.value,
        title   = form.title.value,
        content = form.content.value;
    let final_form = { bid, title, content };
    request( '/api/v1/shsd/bulletin', {
      method:"PUT",
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( final_form ),
    } ).then( () => {
      unsaved = false;
      form.querySelector(".cancel-btn").onclick();
      downloadBulletin();
    } );
    return false;
  }

  console.log( data );
}

function unsavedAction(){
  unsaved = true;
}

function request( uri, opt ){
  const alertError = ( d ) => alert( d.e );
  const reason = {
    401:{ e: "登入憑證失效", f: () => location.href = '/?e=0' },
    404:{ e: "Error 404\n找不到資源，請告知網管。\nCode: sb01" },
    500:{ e: "伺服器錯誤" },
  }
  const seCode = "sb01";
  return fetch( uri, opt).then( res =>{
    if( res.status != 200 ){
      let result = reason[ res.status ] || { e:"Not support error status", f:() => alert(`發生錯誤，需要回報給網管時，請紀錄錯誤代碼。\nSomething failed QwQ\nError Code: ${seCode}-${res.status}`) };
      result['f'] = result['f'] || alertError;
      return result;
    }
    return res.json();
  });
}

function nextAction( data, target, next ){
  if( data.e ){
    return ( data.f || (( ) => {}) )( data ); // execute function LOL
  }
  if( target != null )
    document.querySelector( target ).classList.remove("loading");
  next( data );
}