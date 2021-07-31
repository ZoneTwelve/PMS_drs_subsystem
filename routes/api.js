const express = require('express');
const router = express.Router();
const api_version = "v1";
/* GET home page. */
router.get('/', (req, res) => {
  res.end( res.database==null  ? 'failed' : 'success' );
});

router.post("/login", (req, res)=>{
  let { ACC, PWD } = req.body;

  res.database.query( `SELECT * FROM SMS_member WHERE username=? AND password=?`,
  [ACC, PWD], (err, r, fields) => {
    if( err ){
      return res.status( 500 ).send( { error:"" } );
    }

    if( r.length > 0 ){
      req.session.uid = String( r[0]['no'] );
      req.session.aid = parseInt( r[0]['authority'] );
      req.session.name = String( r[0]['name'] );
      req.session.uname = String( r[0]['username'] );
      req.session.ssrf = (~~(Math.random() * 0xffffffff + 0x10000000)).toString( 16 );
      return res.redirect('/');
    }else{
      req.session.id = null;
      return res.redirect("/?e=1")
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
    res.status(401).send("<h1>401 unauthorized</h1>");
  }else{
    next();
  }
});



//******************************/
//* DRS dorm group RESTful API */
//******************************/
// GET - /dorm/sheet
// parameter:
//   unknow ( because i'm lazy )
// ------------------------------

// GET sheet list
router.get('/dorm/sheet', (req, res)=>{
  // mysql include format the datetime columns
  let page = (parseInt(req.query.page) || 0);
  let defCol = ["sheet_id", "time", "owner", "location"],
      rulCol = ["sheet_id", 'DATE_FORMAT(time, "%Y/%m/%d %H:%i:%s")', "owner", "location"];
  if( defCol.length != rulCol.length )
    return res.status(500).send({e:`Server 的設定錯誤, 於 /api/${ api_version }/dorm/sheet`});
  res.database.query( `SELECT ${defCol.join(", ")} FROM DRS_sheets WHERE 1!=1 UNION SELECT ${rulCol.join(", ")} FROM DRS_sheets ORDER BY sheet_id desc LIMIT ${page}, 10;`, 
  (e, data, f) => {
    if( e ){
      console.log( e );
      res.send( 'Error', 500 );
    }else{
      res.json( data );
    }
  });
});


// CREATE new sheet
router.post('/dorm/sheet', (req, res)=>{ 
  res.database.query( `INSERT INTO DRS_sheets (sheet_id, time, owner, location, reporter) VALUE ( NULL, NOW(), ?, 'location', ? );`,
  [ req.session.name, req.session.uname ], 
  (e, _d, _f) => {
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

const authorizedSheetOwner = ( req, res, next ) => {
  res.database.query("SELECT * FROM DRS_sheets WHERE sheet_id = ? AND reporter = ?", 
  [ parseInt( req.params.id ), req.session.uname ],
  (e, data, f)=>{
    if( e ){
      return res.status( 500 ).send( {e:"Server side error"} );
    }else if( data.length ==1 && data[0].reporter === req.session.uname ){
      return next();
    }else{
      return res.status( 403 ).send({ e:"Unauthorized failed ( 無權限 )" });
    }
  });
}

// GET sheet content
router.get('/dorm/sheet/:id', (req, res) => {
  // res.send( "Send sheets cols, id="+req.params.id );
  res.database.query(`SELECT * FROM DRS_sheet_cols WHERE sheet_id = ? ORDER BY order_id ASC;`, 
    [ req.params.id ], ( e, d, f ) => {
    if( e ){
      return res.status( 500 ).json( { e: "GET sheet columns failed" } );
    }else{
      return res.json( d );
    }
  });
});

// CREATE sheet content ( from groups subcontent)
router.post("/dorm/sheet/:id", authorizedSheetOwner);
router.post('/dorm/sheet/:id', (req, res) => {
  // please check currect user & reporter are the same person
  let sheet_id = parseInt( req.params.id  ) || undefined, // when sheet_id is a string, he will got undefined
      group_id = parseInt( req.body.group ) || undefined;

  if( group_id == undefined || sheet_id == undefined){
    return res.status( 400 ).send({ e:"group or sheet id is not found" });
  }else{
    res.database.query( `SELECT * FROM DRS_def_sheet_cols WHERE group_id = ?`, [ group_id ], (e, data, f) => {
      // INSERT INTO drs_sql.DRS_sheet_cols (col_id, sheet_id, form_id, title, state, notes) VALUES (NULL, 1, 1, 'A', NULL, ''), (NULL, 1, 1, 'B', '123', ''); 
      let params = [];
      let sqlc = `INSERT INTO drs_sql.DRS_sheet_cols (col_id, sheet_id, form_id, title, state, notes, datatype) VALUES ${data.map( v=> "(NULL, ?, ?, ?, ?, '', ?)").join(', ')};`;
      data = data.map( v => [sheet_id, group_id, v.title, v.state, v.datatype] );
      for( let d of data ){
        params = params.concat( d );
      }

      res.database.query( sqlc, params, ( err, d, f ) => {
        if( err ){
          return res.status( 500 ).send({e:"Insert failed"});
        }else{
          return res.send({m:"OK"});
        }
      } )
    } );
  }
});

router.put("/dorm/sheet/:id", authorizedSheetOwner);
router.put('/dorm/sheet/:id', (req, res) => {
  /*
    INSERT INTO TABLE (a,b,c) VALUES 
    (1,2,3), 
    (2,5,7), 
    (3,3,6), 
    (4,8,2) 
    ON DUPLICATE KEY UPDATE b=VALUES( b )
    
    INSERT INTO drs_sql.DRS_sheet_cols (col_id, sheet_id, form_id, title, state, notes) VALUES
    ${req.body['colid[]'].map()}
    ON DUPLICATE KEY UPDATE 
    title = VALUES( title ), state = VALUES( state ), notes = VALUES( notes )
  */
  let sheet_id = parseInt( req.params.id ) || undefined;
  let pattern = '( ?, NULL, NULL, NULL, ?, ?, ? )';
  let sqlc = `INSERT INTO DRS_sheet_cols ( col_id, sheet_id, form_id, title, state, notes, order_id ) 
                                  VALUES ${req.body['colid[]'].map( v => pattern ).join(", ")}
              ON DUPLICATE KEY UPDATE 
                state = VALUES( state ), notes = VALUES( notes ), order_id = VALUES(order_id);`


  let data = [];

  for( let i = 0 ; i < req.body['colid[]'].length ; i++ ){
    let colid = req.body['colid[]'][ i ],
        state = String(req.body['state[]'][ i ]),
        notes = String(req.body['notes[]'][ i ]),
        newid = req.body['newid[]'][ i ];
    data.push( colid );
    data.push( state );
    data.push( notes );
    data.push( newid );
  }
  
  res.database.query( sqlc, data, ( e, d, f ) => {
    if( e ){
      return res.status( 500 ).send({e:"UPDATE failed"});
    }else{
      return res.send( {m:"OK"} );
    }
  });
});

router.delete('/dorm/sheet/:id', authorizedSheetOwner);
router.delete('/dorm/sheet/:id', (req, res) => {
  let sheet_id = parseInt( req.params.id ) || undefined,
      col_id = parseInt( req.body.col ) || undefined;

  if( sheet_id == undefined || col_id == undefined ){
    return res.status( 400 ).send( { e:"Can not found sheets id or columns id" } )
  }else{
    res.database.query("DELETE FROM DRS_sheet_cols WHERE col_id = ?;", [ col_id ], ( e, d, f ) => {
      if( e ){
        return res.status( 500 ).send({e: "DELETE Failed!"});
      }else{
        return res.send( { m:"OK" } );
      }
    });
  }
});

//******************************/
//* management DRS Group's API */
//******************************/
// GET - /shsd/drs_group
// parameter:
//   - index:  INT
//     - Start value
//   - length: INT
//     - How many item
// ------------------------------
router.get('/shsd/drs_group', (req, res)=>{
  res.database.query(`SELECT * FROM DRS_def_groups`, ( e, d, f )=>{
    if( e ){
      return res.send({error:"SQL Error"}, 500);
    }else{
      return res.json( d );
    }
  });
});

// POST - /shsd/drs_group
// Group is using for add element list into sheets
// parameter:
//   - name: String
//     - group title
// ------------------------------
router.post('/shsd/drs_group', (req, res)=>{
  res.database.query( `INSERT INTO DRS_def_groups (dgs_id, name, visible) VALUES (NULL, ?, ?);`, [ req.body.name, req.body.visible==1?1:0 ], (e, r, d)=>{
    if( e ){
      return res.send({error:"group insert failed"}, 500);
    }else{
      return res.json({message:"OK"});
    }
  });
});

// GET - /shsd/drs_group
// parameter:
//   - index:  INT
//     - Start value
//   - length: INT
//     - How many item
// ------------------------------
router.put('/shsd/drs_group', (req, res)=>{
  res.database.query( `UPDATE DRS_def_groups SET name = ?, visible = ? WHERE dgs_id = ?;`, [ req.body.name, req.body.visible==1?1:0, req.body.id ], (e, r, d)=>{
    if( e ){
      return res.send({error:"Update failed"}, 500);
    }else{
      return res.json( r );
    }
  });
});

router.delete('/shsd/drs_group', (req, res)=>{
  res.database.query( "DELETE FROM DRS_def_groups WHERE dgs_id = ?;", [ req.body.id ], ( e, r, f ) => {
    if( e )
      return res.status( 500 ).send( { error:"Failed" } );
    return res.send({msg:"OK"});
  } );
})

router.get('/shsd/drs_sheet', ( req, res ) => {
  res.database.query( `SELECT * FROM DRS_def_sheet_cols`, (e, r, d) => {
    if( e )
      return res.status( 500 ).send( { e:"Can not find sheet columns correctly" } )
    return res.send( r );
  } );
});

router.post('/shsd/drs_sheet', ( req, res ) => {
  let datatype = [ 'boolean', 'integer', 'string' ],
      dt = datatype[parseInt( req.body.datatype )];
  res.database.query( `INSERT INTO DRS_def_sheet_cols ( dsc_id, group_id, title, state, datatype ) VALUE ( NULL, ?, ?, ?, ? )`, 
                      [parseInt(req.body.gid), req.body.title, req.body.status, dt], (e, r, f) => {
    if( e ){
      return res.status( 500 ).send( { e:"Insert failed" } );
    }else{
      return res.send( { msg: "Insert successful" } );
    }
  } );
} );

router.put('/shsd/drs_sheet', ( req, res ) => {
  let datatype = [ 'boolean', 'integer', 'string' ],
      dt = datatype[parseInt( req.body.datatype )];

  res.database.query( `UPDATE drs_sql.DRS_def_sheet_cols SET group_id=?, title=?, state=?, datatype=? WHERE dsc_id = ?; `, 
                      [ parseInt(req.body.gid), req.body.title, req.body.status, dt, req.body.sid ], 
  ( e, r, f ) => {
    if( e ){
      return res.status( 500 ).send( { e:"Update failed!" } );
    }else{
      return res.send( { msg:"OK" } );
    }
  } );
});

router.delete('/shsd/drs_sheet', ( req, res ) => {
  res.database.query( `DELETE FROM DRS_def_sheet_cols WHERE dsc_id = ?`, 
                        [ req.body.sid ], 
  ( e, r, f ) => {
    if( e ){
      return res.status( 500 ).send( {e: "delete failed"} );
    }else{
      return res.send({ msg:"Delete successful!" });
    }
  } )
});

router.get("/shsd/nfc_tag/:id", ( req, res ) => {
  let tagid = req.params.id;
  if( !/^[0-9A-F]/.test(tagid) ){
    return res.status(400).send({e:"Not allow this tag id"});
  }else{
    res.database.query("SELECT * FROM DRS_etag_link WHERE tag_hash = ?;", [tagid], (e, d, f)=>{
      if( e || d.length == 0 ){
        return res.status(500).send({e:"Search failed or not exist"});
      }else{
        return res.send( d[0] );
      }
    });
  }
});

router.post("/shsd/nfc_tag", (req, res) => {
  let gid = ( parseInt(req.body.gid) || undefined ),
      tid = ( req.body.tid || undefined )
      tname = req.body.name || undefined;
  if( gid == undefined || tid == undefined || tname == undefined ){
    return res.status( 400 ).send({e:"Missing parameters"});
  }else if( !/^[A-F0-9]/.test( tid ) ){
    return res.status( 400 ).send({e:"Wrong pattern"});
  }else{
    res.database.query( "INSERT INTO DRS_etag_link (tag_id, tag_name, form_id, tag_hash) VALUES ( NULL, ?, ?, ?);", 
                        [ tname, gid, tid ], 
    (e, d, f) => {
      if( e ){
        console.log( e );
        res.status(500).send( {e:"Failed, 請確定該卡未使用"} );
      }else{
        res.send({m:"OK"});
      }
    } );
  }
});

router.put("/shsd/nfc_tag", (req, res)=>{
  let gid = ( parseInt(req.body.gid) || undefined ),
      tid = ( req.body.tid || undefined ),
      tname = req.body.name || undefined;
  if( gid == undefined || tid == undefined || tname == undefined ){
    return res.status( 400 ).send({e:"Missing parameters"});
  }else if( !/^[A-F0-9]/.test( tid ) ){
    return res.status( 400 ).send({e:"Wrong pattern"});
  }else{
    res.database.query("UPDATE DRS_etag_link SET tag_name = ?, form_id = ? WHERE tag_hash = ?;",
                        [ tname, gid, tid ], 
    (e, d, f)=>{
      if( e ){
        console.log( e );
        return res.status( 500 ).send({e:"UPDATE Failed"});
      }else{
        return res.send( {m:"OK"} );
      }
    });
  }
});

router.delete("/shsd/nfc_tag", (req, res)=>{
  let tid = ( req.body.tid || undefined );
  if( tid == undefined ){
    return res.status(400).send({e:"Missing parameter"});
  }else if( !/^[A-F0-9]/.test( tid ) ){
    return res.status(400).send({e:"Not allow"});
  }else{
    res.database.query("DELETE FROM DRS_etag_link WHERE tag_hash = ?;", [ tid ], 
    (e, d, f)=>{
      if( e ){
        return res.status(500).send({m:"DELETE failed!"});
      }else{
        return res.send({m:"OK"});
      }
    });
  }
});


module.exports = router;