var mode = 0;
window.onload = function( ){
  fetch("/api/v1/shsd/drs_group", {
    method:"GET",
  }).then( res => {
    if( res.status == 401 ){
      alert("登入已失效");
      setTimeout( () => location.href = '/', 2000 );
      return false;
    }
    document.submit_form.onsubmit = tag_request;
    res.json().then( applyDataSelector )
  } );
  scan_nfc_tag( [{
    name:'#nfc-tag-value',
    value:'value',
    func: undefined
  }, {
    name:'#scan-res',
    value:'innerText',
    func: search_nfc_tag
  }] );
  document.querySelector("#scan_nfc").onclick = ( ) => {
    if (!("NDEFReader" in window)){
      alert( "裝置不支援 NFC" )
    }else{
      alert("直接掃描即可");
    }
  }
  document.querySelector("#scanner").onclick = ( ) => {
    if (!("NDEFReader" in window)){
      return alert( "裝置不支援 NFC" );
    }
    document.querySelector("#scan-name").innerText = "卡片名稱";
    document.querySelector("#scan-res").innerText  = "內碼";
    mode = 1;
    document.querySelector(".scanner-block").classList.add("scanner-block-enable");
    document.querySelector(".scanner-block").classList.remove("scanner-block-disable");
    document.querySelector(".scanner-block-enable").onclick = ( ) => {
      mode = 0;
      document.querySelector(".scanner-block").classList.remove("scanner-block-enable");
      document.querySelector(".scanner-block").classList.add("scanner-block-disable");
    }
  }

}

async function scan_nfc_tag( target ){
  if ("NDEFReader" in window) {
    const ndef = new NDEFReader();
    try {
      await ndef.scan();
      ndef.onreading = (event) => {
        let t = target[mode];
        let serialNumber = event.serialNumber.replace(/:/g, '').toUpperCase();
        document.querySelector( t['name'] )[t['value']] = serialNumber;
        if( t['func'] != undefined )
          t['func']( serialNumber );
      }
    } catch(error) {
      alert( error );
      console.log(error);
    }
  } else {
    console.log("Web NFC is not supported.");
  }
}

function waitMessage( txt ){
  console.log( 'txt', txt );
  if( typeof(txt) == "boolean" ){
    document.querySelector("#message-block").style.display = "none";
    return txt;    
  }else{
    document.querySelector("#screen-msg").style.display = txt;
    document.querySelector("#message-block").style.display = "inline-block";
  }
}

function search_nfc_tag( uid ){
  let uri = `/api/v1/shsd/nfc_tag/${uid}`;
  fetch( uri, {
    method:"GET"
  }).then( res => {
    if( res.state == 401 ){
      alert("登入失效");
      return location.href = '/';
    }
    res.json().then( data => {
      if( data.e ){
        document.querySelector('#scan-name').innerText = `${data.e}`;
      }else{
        document.querySelector('#scan-name').innerText = `名稱: ${data['tag_name']}`;
      }
    } );
  });
  // alert("search");
}

function tag_request( ){
  let form = document.submit_form;
  let msg = {
    "POST": "確定要新增嗎?",
    "PUT":"確定要更新嗎?",
    "DELETE":"確定要刪除嗎"
  }
  let method = form._method.value;
  if( confirm(msg[method]) ){
    let data = {
      gid: (form.group_id.value || undefined),
      name:(form['nfc-tag-name'].value || undefined),
      tid: (form['nfc-tag-value'].value || undefined)
    }
    console.log( data );

    let opt = {
      method,
      headers:{
        'content-type':'application/json'
      },
      body: JSON.stringify( data ),
    };
    // console.log(method);
    // return false;
    fetch( "/api/v1/shsd/nfc_tag", opt ).then( res => {
      if( res.status == 401 ){
        alert("登入憑證失效")
        return location.href = '/';
      }
      res.json().then( data => {
        if( data.e ){
          alert( data.e );
        }else{
          alert( data.m );
        }
      } )
    } );

  }
  return false;
}

function applyDataSelector( data ){
  let form = document.submit_form;

  form.group_id.innerHTML = "";
  form.group_id.onchange = ( ) => {

  }
  form.group_id.appendChild(createElement("option", { hidden:true, innerText: `請選擇項目`}));
  for( let d of data ){
    form.group_id.appendChild(createElement("option", { 
      value: d.dgs_id, innerText: `(${d.visible?"可選":"隱藏"}) ${d.dgs_id} - ${d.name}`,
      data_title: d.name
    }));
  }
  console.log( data );
}
