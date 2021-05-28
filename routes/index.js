var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res){
	if( req.session.aid === undefined ){
		return res.render( 'login', { e: req.query.e || undefined } );
	}else if( req.session.aid === 0 ){
		return res.redirect( '/dorm' );
	}else if( req.session.aid > 0 ){
		return res.redirect( '/shsd' );
	}
});

module.exports = router;
