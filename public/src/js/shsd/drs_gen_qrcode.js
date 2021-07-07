var qrcode;
window.onload = function(){
  qrcode = new QRCode(document.querySelector("#qrcode"), {
    width : 1024,
    height: 1024
  });
  qrcode.makeCode(`${location.origin}/SampleHere`);
}



function makeCode(){		
	
}