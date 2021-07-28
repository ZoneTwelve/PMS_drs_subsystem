var qrcode;
window.onload = function(){
  qrcode = new QRCode(document.querySelector("#qrcode"), {
    width : 360,
    height: 360
  });
  document.querySelector("#generate").onclick = makeQRCode;
  makeQRCode(`Sample Here`);
  fetch("/api/v1/shsd/drs_group", {
    method:"GET",
  }).then( res => {
    if( res.status == 401 ){
      alert("出事啦");
      setTimeout( () => location.href = '/', 2000 );
      return false;
    }
    
    res.json().then( applyDataSelector );
  } );
  document.querySelector("#scanner").onclick = scanner;
}

function applyDataSelector( data ){
  let form = document.qr_form;

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

function makeQRCode( text ){
  let form = document.qr_form;
  let data = {
    title: (form.group_id.options[ form.group_id.selectedIndex ] || {innerText:"sample"}).data_title,
    value: form.group_id.value,
  };
  let buf = btoa(unescape(encodeURIComponent(JSON.stringify( data ))));
  console.log( data, buf );
  qrcode.makeCode( buf );
  document.querySelector("#content").innerText = (form.group_id.options[ form.group_id.selectedIndex ] || {innerText:"範本 QRCode"}).innerText;
}

function scanner(){
  let scanner = new Instascan.Scanner({ video: document.querySelector("video#preview") });
  document.querySelector(".scanner-block").classList.add("scanner-block-enable");
  document.querySelector(".scanner-block").classList.remove("scanner-block-disable");
  document.querySelector(".scanner-block-enable").onclick = ( ) => {
    document.querySelector(".scanner-block").classList.remove("scanner-block-enable");
    document.querySelector(".scanner-block").classList.add("scanner-block-disable");
  }
  scanner.addListener('scan', function (content) {
    document.querySelector("#qr-res").innerText = content;
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