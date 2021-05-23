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


router.get('/', (req, res, next) => {
  let requirement = { access_id: req.session.aid, ssrf_token: req.session.ssrf };
  console.log( requirement );
  res.render("home", requirement);
});

router.get('/sheets', ( req, res ) => {
  res.send("list");
});


module.exports = router;
