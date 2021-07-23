var qrcode;
window.onload = function(){
  qrcode = new QRCode(document.querySelector("#qrcode"), {
    width : 1024,
    height: 1024
  });
  makeQRCode(`${location.origin}/SampleHere`);
}


function makeQRCode( text ){
  qrcode.makeCode( text );
  document.querySelector("#content").innerText = text;
}
