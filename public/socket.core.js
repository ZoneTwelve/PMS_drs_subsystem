var socket = io("https://"+location.host);
socket.on('news', function(data){
	console.log(data);
	socket.emit('event', {msg:"恭喜!!"});
});