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
			if( io.profile == undefined )
				return io.emit("response", {e:"failed", key});
			if( typeof(msg) == "string" && msg != "" ){
				let currect_time = NOW( 'time' );
				io.emit("response", { name:`${io.profile.name}(You)`, m: msg, key });
				io.to("chat").emit( "chat", {
					name: io.profile.name, m: msg, time:currect_time 
				} );
				server.database.query("INSERT INTO DRS_chat_record ( msg_id, from_uid, msg_from, msg_to, msg, time ) VALUES ( NULL, ?, ?, 'ALL', ?, ? )", 
				[io.profile.no, io.profile.name, msg, NOW()], (e, d, f) => {
					if( e ){
						console.log( e );
						// return io.emit("response", {e:"Failed to insert"});
					}else{
						return;
					}
				});
			}
		})

		io.on('disconnect', function(data){
			console.log(`CONN ${ io.id } leave`);
		});
	});
	console.log("io server is ready")
}

function NOW( format = "datetime" ){
	let d = new Date();
	let formats = {
		date:`${d.getFullYear()}/${d.getMonth()}/${d.getDate()}`,
		time:`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
	}
	formats['datetime'] = `${formats['date']} ${formats['time']}`;
	return formats[ format ];
}