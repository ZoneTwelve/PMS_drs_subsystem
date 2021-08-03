var page = 0;
var profile = null;
const socket = io( location.origin );
window.onload = ( ) => {
  downloadSheets( );
  downloadBulletin( );
  loadChatroom( );
}


window.addEventListener('load', function () {
  Notification.requestPermission(function (status) {
    if (Notification.permission !== status) {
      Notification.permission = status;
      console.log( status );
    }
  });
});

function downloadSheets(){
  request( `/api/v1/dorm/sheet?page=${parseInt( page ) * 10}`, {
    method: "GET",
    headers:{
      "User-Agent": "Fetch API Agent"
    }
  }).then( ( data ) => nextAction( data, "#sheet-list", updateSheetColumns ));
}

function updateSheetColumns( data ){
  // create sheet columns 
  let block = document.querySelector("#sheet-list");
  let sheet = createElement("ul", { className: "list-group pt-3 lead" });
  block.innerHTML = "";

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
  }
  block.appendChild( sheet );

  // if data is empty create a message "No Data" with animation
  document.querySelector("#new-sheet-btn").onclick = ( ) => document.new_sheet.submit();
  if( data.length == 0 )
    block.appendChild( createElement("h2", { innerText:"No Data", className: "dotdotdot" }) );

  let selectPage = createElement("div", { className: "row list-of-page pt-3" });
  selectPage.appendChild( createElement("div", { className: "col-2", innerText: '﹤' , onclick: () => {
    page = (page || 1) - 1;
    downloadSheets( );
  }}) );
  for( let i = (page || 1) - 1 ; i < (page || 1) + 3 ; i++ ){
    let active = ( page == i ) ? ' active' : '';
    selectPage.appendChild( createElement("div", { className: `col-2 ${active}`, innerText: (data.length < 10 && (i || 0) > page)?"...":`${i + 1}`, onclick: ( self ) => {
      let p = (parseInt( self.target.innerText )) || null;
      if( data.length < 10 && p > page || p === null )
        return ;
      page = p - 1;
      downloadSheets( );
    } }) );
  }
  selectPage.appendChild( createElement("div", { className: "col-2", innerText: '﹥', onclick: () => {
    page = data.length < 10 ? page : page+1;
    downloadSheets( );
  } }) );
  block.appendChild( selectPage );
}

function downloadBulletin( ){
  request( "/api/v1/shsd/bulletin", {
    method:"GET"
  } ).then( ( data ) => nextAction( data, "#bulletin", updateBulletinColumns ) );
}

function updateBulletinColumns( data ){
  let block = document.querySelector("#bulletin");
  let columns = createElement("ul", { className: "list-group pt-3 lead" });
  block.innerHTML = "";
  for( let d of data ){
    let a = createElement("a", { className: "sheet-columns text-decoration-none", title: `${d.poster} ${d.time}` }),
        li = createElement("li", { className: "list-group-item", onclick: () => alertBulletin( d ) }),
        span = createElement("span", { innerText: `${d.bulletin_id}. ${(d.title || "無標題")}` });
    li.appendChild( span );
    a.appendChild( li );
    columns.appendChild( a );
  }
  block.appendChild( columns );
}

function loadChatroom( ){
  let chatMsg = document.querySelector("#chat-msgs");
  socket.on("chat", ( data ) => {
    
    let msg = createElement("p");
    msg.appendChild(createElement("b", { innerText: `${data.name}:`, className:"msg-content text-right" } ));
    msg.appendChild(createElement("span", { innerText: data.m }));
    chatMsg.appendChild( msg );
    var notification = new Notification(`DRS 收到來自 ${data.name} 的新訊息`, {
        body: data.m
        // icon: 'image'
    });
    
    notification.onclick = function() {
        // text.innerHTML = "msg";
        notification.close();    
    };
  });
  socket.on("response", ( data ) => {
    switch( data.key ){
      case 'register':
        if( data.e ){
          chatMsg.innerHTML = "<p class='msg-content text-right' style='color:red;'>連線失敗</p>";
        }else{
          chatMsg.innerHTML += "<p class='msg-content text-right'>已連上聊天室</p>";
          document.querySelector("#chat-msgs").scrollTop = document.querySelector("#chat-msgs").scrollHeight;
          initChatPanel( );
        }
      break;
      default:
        if( data.name && data.m ){
          let msg = createElement("p");
          msg.appendChild(createElement("b", { innerText: `${data.name}:`, className:"msg-content text-right" + (data.name.indexOf("You")?" youself":"") } ));
          msg.appendChild(createElement("span", { innerText: data.m }));
          chatMsg.appendChild( msg );
          document.querySelector("#chat-ctrl > input.send-msg").value = "";
          document.querySelector("#chat-msgs").scrollTop = document.querySelector("#chat-msgs").scrollHeight;

          // document.querySelector("#chat-msgs").scrollTop = document.querySelector("#chat-msgs").scrollHeight;
          // chatMsg.scrollTop = chatMsg.scrollHeight;
          // chatMsg.scrollingElement.scrollTop = chatMsg.scrollHeight;
        }
    }
    
  });
  document.querySelector("#chat").classList.remove( "loading" );
  // chatMsg.scrollTop = chatMsg.scrollHeight;
  chatMsg.innerHTML = "";
  request( `/api/v1/profile`, {
    method: "GET",
    headers:{
      "User-Agent": "Fetch API Agent"
    }
  }).then( ( profile_data ) => {
    profile = profile_data;
    profile_data['key'] = "register"
    socket.emit("register", profile_data);
    request("/api/v1/chat_record", {
      method: "GET",
      headers:{
        "User-Agent": "Fetch API Agent"
      }
    }).then( d => {
      // loading chat history
      console.log( d );
      if( d.length > 0 )
      for( let i = (d.length-1) ; i > -1 ; i-- ){
        let data = d[i];
        try{
          // console.log( data );
          if( data.from_uid == profile.no ){
            data.msg_from += "(You)";
          }

          
          let msg = createElement("p");
          msg.appendChild(createElement("b", { innerText: `${data.msg_from}:`, className:"msg-content text-right" + (data.msg_from.indexOf("You")>-1?" youself":"") } ));
          msg.appendChild(createElement("span", { innerText: data.msg }));
          document.querySelector("#chat-msgs").appendChild( msg );
        }catch(e){
          
          console.log( e );
          
          return;
        }
      }
      document.querySelector("#chat-msgs").scrollTop = document.querySelector("#chat-msgs").scrollHeight;
    });
  });
}

function initChatPanel( ){
  let form = document.querySelector("#chat-ctrl");
  let msg = form.querySelector("input.send-msg"),
      btn = form.querySelector("button.send-btn")
  btn.onclick = ( ) => {
    let m = msg.value;
    if( m.replace(/\s/g, '') != "" )
      socket.emit("chat", {msg:m, key:~~(Math.random()*0xffffff).toString(16)});
  }
  form.submit = ( ) => {
    btn.onclick();
    return false;
  }

}

function alertBulletin( data ){
  if( 'Swal' in window ){
    Swal.fire(
      `<h1 style="text-align:left;"><b>標題</b>:${data.title}</h1>`,
`<div class="container" style="text-align:left;">
<p><span class="lead b-post-content">內文</span>： ${data.content}</p>
<p><span class="b-post-time">時間</span>： ${data.time}</p>
<p><span class="b-post-author">作者</span>： ${data.poster}</p>
</div>`
    )
  }else{
    let msg =
`標題: ${data.title}

內文： ${data.content}
時間： ${data.time}
作者： ${data.poster}`
    alert( msg );
  }
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

function nextAction( data, target, next ){
  if( data.e ){
    return ( data.f || (( ) => {}) )( data ); // execute function LOL
  }
  document.querySelector( target ).classList.remove("loading");
  next( data );
}