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
  res.render( "shsd/index", { ssrf_token: req.session.ssrf } );
});


// management drs groups
router.get("/drs_groups", (req, res)=>{
  res.render( "shsd/drs_groups", { ssrf_token: req.session.ssrf } );
});

// management drs sheets
router.get("/drs_sheets", ( req, res ) => {
  res.render( "shsd/drs_sheets", { ssrf_token: req.session.ssrf } );
});


module.exports = router;
