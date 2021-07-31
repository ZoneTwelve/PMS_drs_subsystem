var page = 0;
window.onload = ( ) => {
  downloadSheets( );
}

function downloadSheets(){
  console.log( 'Page:', page );
  request( `/api/v1/dorm/sheet?page=${parseInt( page ) * 10}`, {
    method: "GET",
    headers:{
      "User-Agent": "Fetch API Agent"
    }
  }).then( data =>{
    if( data.e ){
      return ( data.f || (( ) => {}) )( data ); // execute function LOL
    }
    document.querySelector("#sheet-list").classList.remove("loading");
    updateSheetColumns( data );
  });
}

function updateSheetColumns( data ){
  // create sheet columns 
  let block = document.querySelector("#sheet-list");
  let sheet = createElement("ul", { className: "list-group pt-3 lead" });

  block.innerHTML = "";

  document.querySelector("#new-sheet-btn").onclick = ( ) => document.new_sheet.submit();
  if( data.length == 0 )
    block.appendChild( createElement("h2", { innerText:"No Data", className: "dotdotdot" }) );

  for( let d of data ){
    let a = createElement("a", { className: "sheet-columns text-decoration-none" }),
        li = createElement("li", { className: "list-group-item", onclick: () => {
          location.href = `/dorm/sheet/${d.sheet_id}`;
        } }),
        sub = createElement("sub", { innerText: d.time }),
        span = createElement("span", { innerText: `${d.sheet_id}. ${d.owner} ` });
    li.appendChild( span );
    // li.appendChild( createElement("br") );
    li.appendChild( sub );
    a.appendChild( li );
    sheet.appendChild( a );
    console.log( d );
  }
  block.appendChild( sheet );

  let selectPage = createElement("div", { className: "row list-of-page pt-3" });
  selectPage.appendChild( createElement("div", { className: "col-2", innerText: '﹤' , onclick: () => {
    page = (page || 1) - 1;
    downloadSheets( );
  }}) );
  for( let i = (page || 1) - 1 ; i < (page || 1) + 3 ; i++ ){
    let active = ( page == i ) ? ' active' : '';
    selectPage.appendChild( createElement("div", { className: `col-2 ${active}`, innerText: (data.length < 10 && (i || 0) > page)?"...":`${i + 1}`, onclick: ( self ) => {
      let p = (parseInt( self.target.innerText ) - 1) || null;
      if( data.length < 10 && p > page || p == null )
        return;
      page = p;
      downloadSheets( );
    } }) );
  }
  selectPage.appendChild( createElement("div", { className: "col-2", innerText: '﹥', onclick: () => {
    page = data.length < 10 ? page : page+1;
    downloadSheets( );
  } }) );
  block.appendChild( selectPage );
}

// because i was trying every idea on fetch, so i didn't write to base_function.js
// Error code dh01 using for request function
function request( uri, opt ){
  const alertError = ( d ) => alert( d.e );
  const reason = {
    401:{ e: "登入憑證失效", f: () => location.href = '/?e=0' },
    404:{ e: "Error 404\n找不到資源，請告知網管。\nCode: dh01" },
    500:{ e: "伺服器錯誤" },
  }
  return fetch( uri, opt).then( res =>{
    if( res.status != 200 ){
      let result = reason[ res.status ] || { e:"Not support error status", f:() => alert(`發生錯誤，需要回報給網管時，請紀錄錯誤代碼。\nSomething failed QwQ\nError Code: dh01-${res.status}`) };
      result['f'] = result['f'] || alertError;
      return result;
    }
    return res.json();
  });
}