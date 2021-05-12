var express = require('express');
const session = require('express-session');
var router = express.Router();

/* Dormitory Repory System → Database name prefix: DRS_*/

// Required login code:
router.all("*", (req, res, next)=>{
  if( !(req.session.uid) )
    return res.redirect("/?e=0");
  next();
});


router.get('/', function(req, res, next){
  res.render("home");
});

module.exports = router;
