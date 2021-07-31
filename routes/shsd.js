var express = require('express');
var router = express.Router();

// when user didn't login, kick him ass.
router.all("*", (req, res, next)=>{
  if( !(req.session.uid && req.session.aid !== 0) )
    return res.redirect("/?e=0");
  next();
});


// Resource: 
router.get("/", function(req, res){
  res.render( "shsd/index", { ssrf_token: req.session.ssrf, navtitle:"首頁" } );
});

router.get("/drs_bulletin", (req, res) => {
  res.render( "shsd/drs_bulletin", { ssrf_token: req.session.ssrf, navtitle:"公告" });
});

// management drs groups
router.get("/drs_groups", (req, res)=>{
  res.render( "shsd/drs_groups", { ssrf_token: req.session.ssrf, navtitle:"組別管理" } );
});

// management drs sheets
router.get("/drs_sheets", ( req, res ) => {
  res.render( "shsd/drs_sheets", { ssrf_token: req.session.ssrf, navtitle:"項目管理" } );
});

router.get("/generate_qrcode", ( req, res ) => {
  res.render( "shsd/gen_qrcode", { ssrf_token: req.session.ssrf, navtitle:"QRCode生成" } );
});

router.get("/set_nfc_tag", ( req, res )=>{
  res.render( "shsd/set_nfc_tag", { ssrf_token: req.session.ssrf, navtitle:"NFC 掃描設定"});
});


module.exports = router;
