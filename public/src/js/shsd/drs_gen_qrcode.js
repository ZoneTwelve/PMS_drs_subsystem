var qrcode;
window.onload = function(){
  qrcode = new QRCode(document.querySelector("#qrcode"), {
    width : 1024,
    height: 1024
  });
  document.querySelector("#generate").onclick = makeQRCode;
  makeQRCode(`Sample Here`);
  fetch("/api/v1/shsd/drs_group", {
    method:"GET",
  }).then( res => {
    if( res.status == 401 ){
      alert("出事啦");
      return false;
    }

    res.json().then( applyDataSelector )
  } );
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
  console.log( data );
  let buf = btoa(unescape(encodeURIComponent(JSON.stringify( data ))));
  qrcode.makeCode( buf );
  // document.querySelector("#content").innerText = text;
}