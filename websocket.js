module.exports = function(server){
	require('dotenv').config(); // loading .env config files

	// database connection start
	const mysql    = require('mysql2');
	const connection = mysql.createConnection({
			host         : process.env.DB_HOST,
			port         : process.env.DB_PORT,
			user         : process.env.DB_USER,
			password     : process.env.DB_PASS,
			database     : process.env.DB_BASE || process.env.DB_HOST,
			insecureAuth : true,
	});
	
	
	connection.connect(function(err) {
		if (err) {
			console.error('Error connecting: ' + err.stack);
			console.error("Cloud not connect to SQL Server");
			return process.exit( 1 );
		} 
		console.log('io thread ' + connection.threadId);
	});
	server.database = connection;
	// database connection end
	
	server.on('connection', function( io ){
		io.on("register", ( data ) => {
			let { name, username, no } = data;

			server.database.query("SELECT * FROM SMS_member WHERE no=? AND username = ? AND name = ?", [ no, username, name ], 
			(e, d, f) => {
				if( e || !d ){
					io.emit("response", {e:"failed"});
				}else{
					io.profile = data;
					io.join("chat");
					io.emit("response", {m:"OK", key:"register"});
				}
			});
		});
		io.on("chat", ( { msg, key } ) => {
			if( typeof(msg) == "string" && msg != "" ){
				io.emit("response", { name:"You", m: msg, key });
				io.to("chat").emit( "chat", {
					name: io.profile.name, m: msg
				} );
			}
		})

		io.on('disconnect', function(data){
			console.log(`${ io.id } leave`);
		});
	});
	console.log("io server is ready")
}