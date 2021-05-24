var express = require('express');
const session = require('express-session');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.end( res.database==null  ? 'failed' : 'success' );
});

router.post("/login", (req, res)=>{
  let { ACC, PWD } = req.body;

  res.database.query( `SELECT * FROM SMS_member WHERE username="${encodeURIComponent(ACC)}" AND password="${PWD}"`, (err, r, fields) => {
    if( r.length > 0 ){
      req.session.uid = String( r[0]['no'] );
      req.session.aid = parseInt( r[0]['authority'] );
      req.session.ssrf = (~~(Math.random() * 0xffffffff + 0x10000000)).toString( 16 );
      console.log( req.session );
      res.redirect('/');
    }else{
      req.session.id = null;
      res.redirect("/?e=1")
    }
  } );
});

router.get('/logout/:token', (req, res)=>{
  let { token } = req.params;

  if( token === req.session.token ){
    req.session.destroy();
    return res.redirect('/');
  }else{
    res.send("Error", 401);
  }
})


// login required api: ↓

router.all("*", (req, res, next)=>{
  if( !( req.session.uid ) ){
    console.log("401 unauthorized");
    res.redirect("/?e=0");
  }else{
    next();
  }
});

router.get('/dorm/sheet', (req, res)=>{
  // mysql include format the datetime columns
  res.database.query( `SELECT * FROM DRS_sheets WHERE 1!=1 UNION SELECT sheet_id, DATE_FORMAT(time, "%Y/%m/%d %H:%i:%s"), dorm, location, reporter FROM DRS_sheets ORDER BY sheet_id desc limit 0, 10;`, (e, data, f) => {
    if( e ){
      res.send( 'Error', 500 );
    }else{
      res.json( data );
    }
  });
});

router.get('/dorm/sheet/:id', () => {
  res.send( "Send sheet cols" );
});

// create net sheet
router.post('/dorm/sheet', (req, res)=>{ 
  res.database.query( `INSERT INTO DRS_sheets (sheet_id, time, dorm, location, reporter) VALUE ( NULL, NOW(), 'dorm', 'location', 'reporter' );`, (e, _d, _f) => {
    res.database.query(`SELECT LAST_INSERT_ID();`, (_e, d, _f)=>{
      if( e ){
        console.error( e );
        res.send("Error", 500);
      }else{
        let sid = d[0]['LAST_INSERT_ID()'];
        res.redirect(`/dorm/sheet/${ sid }`);
      }

    });
  });
});



module.exports = router;
