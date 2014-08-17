var async = require('async');

var clients = {};


function connect(socketId)
{
	if (!clients[socketId]) {
		gotStart(socketId);
	}
}

function gotImage(socketId, image)
{
	switch (image) {
		case 'start': gotStart(socketId); break;
		case 'preFlop': gotPreFlop(socketId); break;
		case 'nextGame': gotNextGame(socketId); break;
		default : gotCard(socketId, image); break;
	}
}

function updatePlayerName(socketId, seatId, name) {
	if (typeof clients[socketId].frontObj.players[seatId] == 'undefined') {
		clients[socketId].frontObj.players[seatId] = {
			seatId: seatId,
			hand: []
		};
	}
	clients[socketId].frontObj.players[seatId].name = name;
	if (name == "") {
		delete clients[socketId].frontObj.players[seatId];
	}
}

function moveDealerButton(socketId) {
	clients[socketId].frontObj.button = findNextDealerButton(socketId, clients[socketId].frontObj.button);
}

function getTableInfo(socketId, callback)
{
	callback(clients[socketId].frontObj);
}

module.exports = {
	connect: connect,
	gotImage: gotImage,
	updatePlayerName: updatePlayerName,
	moveDealerButton: moveDealerButton,
	getTableInfo: getTableInfo

};

// 以下エクスポートしない関数

// 初期化
// スタートカードを受け取った時の処理。
function gotStart(socketId) {
	clients[socketId] = {
		frontObj: {
			state: 'start',
			allPlayersNum: 0,
			playingPlayersNum: 0,
			button: 0,
			board: [],
			players: []
		},
		gotCards: []
	};
}

// プリフロップカードを受け取った時の処理。
function gotPreFlop(socketId) {
	if (clients[socketId].frontObj.state === 'start') {
		clients[socketId].frontObj.state = 'preFlop';
		clients[socketId].frontObj.allPlayersNum = clients[socketId].gotCards.length/2;
		clients[socketId].frontObj.playingPlayersNum = clients[socketId].frontObj.allPlayersNum;
		for (var key in clients[socketId].frontObj.players) {
			var player = clients[socketId].frontObj.players[key];
			if (!player) continue;
			var seatId = player.seatId;
			clients[socketId].frontObj.players[seatId].isActive = true;
			clients[socketId].frontObj.players[seatId].win = null;
			clients[socketId].frontObj.players[seatId].tie = null;
		}
		winPerApiMock(clients[socketId].frontObj.players);
	}
}

// ネクストゲームカードを受け取った時の処理。
function gotNextGame(socketId) {
	clients[socketId].frontObj.state = 'start';
	clients[socketId].frontObj.allPlayersNum = 0;
	clients[socketId].frontObj.playingPlayersNum = 0;
	clients[socketId].frontObj.board = [];
	moveDealerButton(socketId); // ディーラーボタンの移動
	clients[socketId].gotCards = [];
	for (var key in clients[socketId].frontObj.players) {
		var player = clients[socketId].frontObj.players[this.key];
		if (!player) continue;
		var seatId = player.seatId;
		clients[socketId].frontObj.players[seatId].hand = [];
		clients[socketId].frontObj.players[seatId].isActive = true;
		clients[socketId].frontObj.players[seatId].win = null;
		clients[socketId].frontObj.players[seatId].tie = null;
	}
}

// トランプのカードを受け取った時の処理。
function gotCard(socketId, card) {
	switch (clients[socketId].frontObj.state) {
		case 'start': gotCardInStart(socketId, card); break;
		case 'preFlop': gotCardInPreFlop(socketId, card); break;
		case 'flop': gotCardInFlop(socketId, card); break;
		case 'turn': gotCardInTurn(socketId, card); break;
		case 'river': gotCardInRiver(socketId, card); break;
	}
}

function gotCardInStart(socketId, card) {
	var checkingSeatId = clients[socketId].frontObj.button;
	for (var key in clients[socketId].frontObj.players) {
		var player = clients[socketId].frontObj.players[key];
		if (!player) continue;
		checkingSeatId = findNextDealerButton(socketId, checkingSeatId);
		if (!clients[socketId].frontObj.players[checkingSeatId].hand[0]) {
			clients[socketId].frontObj.players[checkingSeatId].hand[0] = card;
			clients[socketId].frontObj.players[checkingSeatId].isActive = true;
			return;
		}
	}
	for (var key in clients[socketId].frontObj.players) {
		var player = clients[socketId].frontObj.players[key];
		if (!player) continue;
		checkingSeatId = findNextDealerButton(socketId, checkingSeatId);
		if (!clients[socketId].frontObj.players[checkingSeatId].hand[1]) {
			clients[socketId].frontObj.players[checkingSeatId].hand[1] = card;
			return;
		}
	}
}

// プリフロップでカード情報を受け取った時の処理。
function gotCardInPreFlop(socketId, card) {
	for (var key in clients[socketId].frontObj.players) {
		var player = clients[socketId].frontObj.players[key];
		if (!player) continue;
		var indexNum = player.hand.indexOf(card);
		if (indexNum != -1) { // 同じカードがみつかった場合降りたと認識
			foldedAndRecalculation(socketId, player.seatId);
			return;
		}
	}
	// 同じカードがない場合
	clients[socketId].frontObj.board.push(card);
	if (clients[socketId].frontObj.board.length == 3) { // フロップに３枚が来たのを確認
		clients[socketId].frontObj.state = 'flop'; // フロップになったことを認識
		winPerApiMock(clients[socketId].frontObj.players);
	}
}
// フロップでカード情報を受け取った時の処理。
function gotCardInFlop(socketId, card) {
	for (var key in clients[socketId].frontObj.players) {
		var player = clients[socketId].frontObj.players[key];
		if (!player) continue;
		var indexNum = player.hand.indexOf(card);
		if (indexNum != -1) { // 同じカードがみつかった場合降りたと認識
			foldedAndRecalculation(socketId, player.seatId);
			return;
		}
	}
	// 同じカードがない場合
	clients[socketId].frontObj.board.push(card);
	clients[socketId].frontObj.state = 'turn'; // ターンになったことを認識
	winPerApiMock(clients[socketId].frontObj.players);
}
// ターンでカード情報を受け取った時の処理。
function gotCardInTurn(socketId, card) {
	for (var key in clients[socketId].frontObj.players) {
		var player = clients[socketId].frontObj.players[key];
		if (!player) continue;
		var indexNum = player.hand.indexOf(card);
		if (indexNum != -1) { // 同じカードがみつかった場合降りたと認識
			foldedAndRecalculation(socketId, player.seatId);
			return;
		}
	}
	// 同じカードがない場合
	clients[socketId].frontObj.board.push(card);
	clients[socketId].frontObj.state = 'river'; // リバーになったことを認識
	winPerApiMock(clients[socketId].frontObj.players);
}
// リバーでカード情報を受け取った時の処理。
function gotCardInRiver(socketId, card) {
	for (var key in clients[socketId].frontObj.players) {
		var player = clients[socketId].frontObj.players[key];
		if (!player) continue;
		var indexNum = player.hand.indexOf(card);
		if (indexNum != -1) { // 同じカードがみつかった場合降りたと認識
			foldedAndRecalculation(socketId, player.seatId);
			return;
		}
	}
}

function findNextDealerButton(socketId, button) {
	var firstSeatId = null;
	for (var key in clients[socketId].frontObj.players) {
		var player = clients[socketId].frontObj.players[key];
		if (!player) continue;
		if (firstSeatId === null) firstSeatId = player.seatId;
		if (player.seatId > button) {
			return player.seatId
		}
	}
	return firstSeatId;
}


// 降りたプレーヤーが出た時に勝率を再計算する。
function foldedAndRecalculation(socketId, seatId) {
	if (clients[socketId].frontObj.players[seatId].isActive == false) return;
	clients[socketId].frontObj.players[seatId].isActive = false;
	clients[socketId].frontObj.players[seatId].win = 0;
	clients[socketId].frontObj.players[seatId].tie = 0;
	clients[socketId].frontObj.playingPlayersNum -= 1;
	winPerApiMock(clients[socketId].frontObj.players);
}

function winPerApiMock(players) {
	for (var key in players) {
		var player = players[key];
		if (!player) continue;
		if (player.isActive == true) {
			player.win = '10%';
			player.tie = '0.3%';
		}
	}
}
