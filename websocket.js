var remove = require('./plugin/array.remove.js');
var user = [];
module.exports = function(socket){
	socket.on('connection', function(client){
		user.push(client);
		client.emit('news', {msg: '為同婚合法化歡呼~~'});

		client.on('disconnect', function(data){
			console.log("someone leave");
			user.remove(client);
		});
	});
}