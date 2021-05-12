var express = require('express');
const session = require('express-session');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
  res.end( res.database==null  ? 'failed' : 'success' );
});

router.post("/login", (req, res)=>{
  let { ACC, PWD } = req.body;
  res.database.query( `SELECT * FROM SMS_member WHERE username="${encodeURIComponent(ACC)}" AND password="${PWD}"`, (err, res, fields) => {
    if( res.length > 0 ){
      req.session.id = res[0]['no'];
    }else{
      req.session.id = null;
    }
    res.redirect("/home/dashboard");
  } );

});

module.exports = router;
