var page = 0;
window.onload = ( ) => {
  request( `/api/v1/dorm/sheet?s=${parseInt( page )}`, {
    method: "GET",
    headers:{
      "User-Agent": "Fetch API Agent"
    }
  }).then( data =>{
    if( data.e ){
      return ( data.f || (( ) => {}) )( data ); // execute function LOL
    }
    document.querySelector("#sheet-list").classList.remove("loading");
        
  });
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