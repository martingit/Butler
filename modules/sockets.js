var socketio = {};
module.exports = {
	set: function(io){
		socketio = io;
		socketio.sockets.on('connection', function (socket) {
	        console.log('client connected ' + socket);
	    });
	},
	get: function(){
		return socketio;
	}
}