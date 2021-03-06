var oddsSystem = require('../modules/oddsSystem.js');

var createOddsSystemSocket = function(io) {
	var oddsSystemSocket = io.of('/oddsSystem').on('connection', function (socket) {

		oddsSystem.connect(socket);

		socket.on('imageSend', function(image) {
			oddsSystem.gotImage(socket.id, image);
		});

		socket.on('updatePlayerName', function(data) {
			oddsSystem.updatePlayerName(socket.id, data.seatId, data.name);
		});

		socket.on('moveDealerButton', function(data) {
			oddsSystem.moveDealerButton(socket.id);
		});

		socket.on('disconnect', function() {
			oddsSystem.disconnect(socket.id);
		});
	});

	return oddsSystemSocket;
};

module.exports = createOddsSystemSocket;
