var express = require('express');
const session = require('express-session');
var router = express.Router();

let rootView = 'dorm';
/* Dormitory Repory System → Database name prefix: DRS_*/

// Required login code:
router.all("*", (req, res, next)=>{
  if( !(req.session.uid) )
    return res.redirect("/?e=0");
  next();
});


router.get('/', (req, res) => {
  let requirement = { access_id: req.session.aid, ssrf_token: req.session.ssrf };
  console.log( requirement );
  res.render(`${rootView}/index`, requirement);
});

router.get('/sheet/:sheet_id', ( req, res ) => {
  let { sheet_id } = req.params;
  res.render( `${rootView}/fill_sheet`, { sheet_id } );
});


module.exports = router;
