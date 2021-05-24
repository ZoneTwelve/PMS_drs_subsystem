var express = require('express');
const session = require('express-session');
var router = express.Router();

// when user didn't login, kick him ass.
router.all("*", (req, res, next)=>{
  if( !(req.session.uid && req.session.aid !== 0) )
    return res.redirect("/?e=0");
  next();
});


// Resource: 
router.get('/', function(req, res, next){
  res.render("shsd/index", {});
});


module.exports = router;
