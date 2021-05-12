var express = require('express');
const session = require('express-session');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
  res.end( res.database==null  ? 'failed' : 'success' );
});

router.post("/login", (req, res)=>{
  let { ACC, PWD } = req.body;
  res.database.query( `SELECT * FROM SMS_member WHERE username="${encodeURIComponent(ACC)}" AND password="${PWD}"`, (err, r, fields) => {
    if( r.length > 0 ){
      req.session.uid = String( r[0]['no'] );
      res.redirect("/dorm/");
    }else{
      req.session.id = null;
      res.redirect("/?e=1")
    }
  } );

});


// login required api: ↓

router.all("*", (req, res, next)=>{
  if( !(req.session.uid) ){
    console.log("Other need login action");
    res.redirect("/?e=0");
  }else{
    next();
  }
});

router.get('/dorm/sheet', (req, res)=>{
  res.json([ {sheet_id:1, time:"2021-05-12 16:46:32", dorm:"G14", location:"空間", reporter:"Fucking hell", formid:1} ]);
});

module.exports = router;
