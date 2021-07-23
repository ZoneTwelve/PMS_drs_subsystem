const express = require('express');
const router = express.Router();

const rootView = 'dorm';
/* Dormitory Repory System → Database name prefix: DRS_*/

// Required login code:
router.all("*", (req, res, next)=>{
  if( !(req.session.uid) )
    return res.redirect("/?e=0");
  next();
});


router.get('/', (req, res) => {
  let requirement = { access_id: req.session.aid, ssrf_token: req.session.ssrf, navtitle:"首頁" };
  res.render(`${rootView}/index`, requirement);
});

router.get('/sheet/:sheet_id', ( req, res ) => {
  let { sheet_id } = req.params;
  let ssrf_token = req.session.ssrf;
  let navtitle = "填寫表單";
  res.render( `${rootView}/fill_sheet`, { sheet_id, ssrf_token, navtitle } );
});


module.exports = router;
