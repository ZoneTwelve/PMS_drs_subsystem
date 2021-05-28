const express = require('express');
const router = express.Router();

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
      res.redirect('/');
    }else{
      req.session.id = null;
      res.redirect("/?e=1")
    }
  } );
});

// router.get('/logout/', (req, res)=>res.send("Token not found", 401));

router.get('/logout/:token', (req, res)=>{
  let { token } = req.params;
  if( token === req.session.ssrf ){
    req.session.destroy();
    return res.redirect('/');
  }else{
    res.setHeader( "Refresh", "3 ; url='/'" );
    
    res.send("Error", 401);
  }
})


// login required api: ↓

router.all("*", (req, res, next)=>{
  if( !( req.session.uid ) ){
    res.setHeader("Refresh", "3 ; url=/?e=0")
    res.send("<h1>401 unauthorized</h1>", 401);
  }else{
    next();
  }
});

router.get('/dorm/sheet', (req, res)=>{
  // mysql include format the datetime columns
  let page = parseInt(req.query.page) || 0;
  res.database.query( `SELECT * FROM DRS_sheets WHERE 1!=1 UNION SELECT sheet_id, DATE_FORMAT(time, "%Y/%m/%d %H:%i:%s"), dorm, location, reporter FROM DRS_sheets ORDER BY sheet_id desc LIMIT ${page}, 10;`, (e, data, f) => {
    if( e ){
      res.send( 'Error', 500 );
    }else{
      res.json( data );
    }
  });
});


// create net sheet
router.post('/dorm/sheet', (req, res)=>{ 
  res.database.query( `INSERT INTO DRS_sheets (sheet_id, time, dorm, location, reporter) VALUE ( NULL, NOW(), 'dorm', 'location', 'reporter' );`, (e, _d, _f) => {
    res.database.query(`SELECT LAST_INSERT_ID();`, (_e, d, _f)=>{
      if( e ){
        console.error( e );
        res.send({error:"Insert or get last insert id failed"}, 500);
      }else{
        let sid = d[0]['LAST_INSERT_ID()'];
        res.redirect(`/dorm/sheet/${ sid }`);
      }

    });
  });
});

router.get('/dorm/sheet/:id', (req, res) => {
  res.send( "Send sheets cols, id="+req.params.id );
});

router.get('/shsd/drs_group', (req, res)=>{
  res.database.query(`SELECT * FROM DRS_def_groups`, ( e, d, f )=>{
    if( e ){
      return res.send({error:"SQL Error"}, 500);
    }else{
      return res.json( d );
    }
  });
});

router.post('/shsd/drs_group', (req, res)=>{
  res.database.query( `INSERT INTO DRS_def_groups (dgs_id, name) VALUES (NULL, "?");`, [ req.body.name ], (e, r, d)=>{
    if( e ){
      return res.send({error:"group insert failed"}, 500);
    }else{
      return res.json({message:"OK"});
    }
  });
});

router.put('/shsd/drs_group', (req, res)=>{
  res.database.query( `UPDATE DRS_def_groups SET name = ? WHERE dgs_id = ?;`, [ req.body.name, req.body.id ], (e, r, d)=>{
    if( e ){
      return res.send({error:"Update failed"}, 500);
    }else{
      return res.json( r );
    }
  });
});



module.exports = router;
