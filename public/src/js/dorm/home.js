window.onload = function(){

  setup();

  clock();
  setInterval( clock, 1000 ); // setup clock
}

function setup(){
  // GET /dorm/sheet
  fetch( new Request( "/api/v1/dorm/sheet" ) ).then( res => {
    res.json().then( data => {
      loadSheet( data, { target: "#sheet_table" } );
    } );
  }).catch( err => {
    console.error( err );
  });
  // /dorm/sheet done

  // GET bulletin
  // bulletin end
}

function createNewSheet(  ){
  fetch("/api/v1/dorm/sheet", {
    method:"POST",
    // body:encodeURI(JSON.stringify({ name:'sample' })),
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
  }).then(res => {
      return res.json();   // 使用 json() 可以得到 json 物件
  }).then(result => {
      console.log(result); // 得到 {name: "oxxo", age: 18, text: "你的名字是 oxxo，年紀 18 歲～"}
  });
}

function loadSheet( data, opt ){
  let { target } = opt;
  let block = document.querySelector( target );
  block.innerHTML = "";
  let ul = createElement( "ul", opt.ul );

  for(let d of data){
    let li = createElement( "li", {
      className: "list-element list-root-style"
    } );
    let a = createElement( "a", {
      innerText: `${d.sheet_id}: ${d.dorm} (${d.location})`,
      href: `/dorm/sheet/${d.sheet_id}`
    } );
    let sub = createElement( "sub", {
      innerText: `${d.time}`
    } )
    li.appendChild( a );
    // li.appendChild( document.createElement("br") );
    li.appendChild( sub );
    ul.appendChild( li );
  }
  block.appendChild( ul );
}

function clock(){
  let d = new Date();
  document.querySelector("#current-time").innerText = `${d.getFullYear()}/${format(d.getMonth()+1)}/${format(d.getDate())} ${format(d.getHours())}:${format(d.getMinutes())}:${format(d.getSeconds())}`;
}

function format( input ){
  return ( "0"+input ).substr( -2 );
}



