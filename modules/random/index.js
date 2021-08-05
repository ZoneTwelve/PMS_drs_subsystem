const pattc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=+";
module.exports = ( { pattern ,length } ) => {
  pattern = pattern || pattc;
  let res = "";
  while( length-- ){
    res += pattc[ ~~(Math.random() * pattern.length)  ];
  }
  return res;
}