var socket = io.connect('http://'+hostAddress+'/oddsSystem');
var easyMode = false;
var mark = '';
var num  = '　'
var passWord = '';
var backgroundColor = 'camera';
var tableInfo = {};
var config = {
	canvasWidth:  640,
	canvasHeight: 360,
	originalCardWidth:  48,
	originalCardHeight: 64,
	displayCardWidth:  36,
	displayCardHeight: 48,
	space: 8,
	boardWidthSpace:  6,
	boardHeightSpace: 6,
	cardFontSize: 26,
	fontSize: 12,
	visibility: 0.3,
	PlayersXY: [],
	nameFontMargin: 3
};
config.markFontSize = config.cardFontSize - 4;
config.markAdjust   = config.cardFontSize - parseInt(config.cardFontSize/3);
config.displayCardWidth  = config.cardFontSize*2-11;
config.displayCardHeight = config.cardFontSize;
config.displayWidth  = config.displayCardWidth*2;
config.nameBoxHeight = config.fontSize + config.nameFontMargin*2;
config.nameWinPerBoxWidth  = config.displayWidth;
config.nameWinPerBoxHeight = (config.fontSize + config.nameFontMargin*2) * 2;
config.displayHeight = config.displayCardHeight + config.nameWinPerBoxHeight;
config.boxWidth  = config.displayWidth;
config.boxHeight = config.displayHeight;
config.boardWidth  = config.displayCardWidth*5 + config.boardWidthSpace*2;
config.boardHeight = config.cardFontSize + config.boardHeightSpace*2;
config.tieFontSize = config.fontSize - 4;
config.dealerButtonRadius = parseInt(config.nameWinPerBoxHeight/2);

var cards = [
	'As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks',
	'Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh',
	'Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd',
	'Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc'
];
var cardsForEasyMode = [
	'Ta', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', 'Qa', 'Wa', 'Ea', 'Ra',
	'Ts', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Qs', 'Ws', 'Es', 'Rs',
	'Td', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Qd', 'Wd', 'Ed', 'Rd',
	'Tf', '2f', '3f', '4f', '5f', '6f', '7f', '8f', '9f', 'Qf', 'Wf', 'Ef', 'Rf'
];


function markClick(mark) {
	this.mark = mark;
	drawImage();
}

function numClick(num) {
	this.num = num;
	drawImage();
}

function sendImage(image) {
	socket.emit('imageSend', image);
	sound();
	$('#message').html('send '+image);
	this.mark = '';
	this.num  = '　';
	drawImage();
	drawSentImage(image);
	if (image == 'start') {
		for (var seatId=0; seatId<10; seatId++) {
			$('#inputPlayer'+seatId).val('');
		}
	}
}

function sendCard() {
	if (this.mark != 's' && this.mark != 'h' && this.mark != 'd' && this.mark != 'c') {
		$('#message').html('mark is invalid!');
		return;
	}
	if (this.num != '2' && this.num != '3' && this.num != '4' && this.num != '5' && this.num != '6' &&
		this.num != '7' && this.num != '8' && this.num != '9' && this.num != 'T' && this.num != 'J' &&
		this.num != 'Q' && this.num != 'K' && this.num != 'A') {
		$('#message').html('number is invalid!');
		return;
	}
	sendImage(this.num+this.mark);
}

function drawImage() {
	switch (this.mark) {
		case 's':
			$('#image').html('<span style="color:#000000;font-size:64px;">'+this.num+'♠</span>'); break;
		case 'h':
			$('#image').html('<span style="color:#ff0000;font-size:64px;">'+this.num+'♥</span>'); break;
		case 'd':
			$('#image').html('<span style="color:#0000ff;font-size:64px;">'+this.num+'♦</span>'); break;
		case 'c':
			$('#image').html('<span style="color:#00bb00;font-size:64px;">'+this.num+'♣</span>'); break;
		default:
			$('#image').html('<span style="color:#000000;font-size:64px;">'+this.num+'</span>'); break;
	}
}

function drawSentImage(sentImage) {
	switch (sentImage[1]) {
		case 's':
			$('#sentImage').html('<span style="color:#000000;font-size:64px;">'+sentImage[0]+'♠</span>'); break;
		case 'h':
			$('#sentImage').html('<span style="color:#ff0000;font-size:64px;">'+sentImage[0]+'♥</span>'); break;
		case 'd':
			$('#sentImage').html('<span style="color:#0000ff;font-size:64px;">'+sentImage[0]+'♦</span>'); break;
		case 'c':
			$('#sentImage').html('<span style="color:#00bb00;font-size:64px;">'+sentImage[0]+'♣</span>'); break;
		default:
			$('#sentImage').html('<span style="color:#000000;font-size:64px;">'+sentImage[0]+'</span>'); break;
	}
}

function keyDown() {
	var inputString = $('#inputArea').val().toUpperCase() + String.fromCharCode(event.keyCode).toLowerCase();
	if (easyMode == true) { // 簡易入力モード
		var indexOfResult = cardsForEasyMode.indexOf(inputString);
		if (indexOfResult >= 0) { // Hit!
			sendImage(cards[indexOfResult]);
			setTimeout(function(){ $('#inputArea').val(''); }, 100);
			return;
		}
		if (inputString == 'g') {
			sound();
			setTimeout(function(){ $('#inputArea').val(''); }, 100);
		}
	} else {
		if (cards.indexOf(inputString) >= 0) { // Hit!
			sendImage(inputString);
			setTimeout(function(){ $('#inputArea').val(''); }, 100);
		}
	}
}
function keyUpPlayer(seatId) {
	var updateName = $('#inputPlayer'+seatId).val();
	socket.emit('updatePlayerName', {
		seatId: seatId,
		name: updateName
	});
}
function deletePlayer(seatId) {
	$('#inputPlayer'+seatId).val('');
	socket.emit('updatePlayerName', {
		seatId: seatId,
		name: ""
	});
}
function moveDealerButton() {
	socket.emit('moveDealerButton', {});
}

$("#changeInputMode").change(function(){
	switch ($(this).val()) {
		case 'easy':
			easyMode = true;  break;
		case 'normal':
			easyMode = false; break;
		case 'qrCode':
			document.getElementById("inputArea").innerHTML = passWord;
			return;
	}
	document.getElementById("inputArea").innerHTML =
		'<input type="text" onkeydown="keyDown();" id="inputArea" class="form-control">';
});

$("#changeArrangement").change(function(){
	switch ($(this).val()) {
		case '上下':
			calcUpAndDownXYs();
			break;
		case '左右':
			calcLeftAndRightXYs();
			break;
	}
	drawTableInfo(tableInfo);
});

$("#changeBackground").change(function(){
	backgroundColor = $(this).val();
});

function sound() {
	var str = "";
	str = str + "<EMBED id = 'id_sound'";
	str = str + " SRC=/music/cursor6.wav";
	str = str + " AUTOSTART='true'";
	str = str + " HIDDEN='true'>";
	document.getElementById("id_sound").innerHTML = str;
}

$(function(){
	var canvasForVideo = $('#canvasForVideo').get(0);
	var canvas = $('#canvas').get(0);
	config.ctxForVideo = canvasForVideo.getContext("2d");
	config.ctx = canvas.getContext("2d");
	calcUpAndDownXYs();
});

socket.on('tableInfo', function(getTableInfo) {
	drawTableInfo(getTableInfo);
	tableInfo = getTableInfo;
});

socket.on('passWord', function(getPassWord) {
	passWord = getPassWord;
});

// ビデオの描画
setInterval(function(){
	if (backgroundColor === 'camera') {
		config.ctxForVideo.drawImage(video, 0, 0, config.canvasWidth, config.canvasHeight);
		return;
	}
	config.ctxForVideo.fillStyle = backgroundColor;
	config.ctxForVideo.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
}, 50);

// ここからフロント表示部分の関数
function drawTableInfo(getTableInfo) {
	var players = getTableInfo.players;
	var board = getTableInfo.board;
	drawBackGround();
	for (var key in players) {
		var player = players[key];
		if (!player) continue;
		// FOLD検知
		if (
			tableInfo.players &&
				tableInfo.players[key] &&
				tableInfo.players[key].isActive == true &&
				player.isActive == false
			) {
			tableInfo = getTableInfo;
			foldMovie(key, 0);
		}

		drawBox(player.seatId, player.isActive);
		if (player.isActive == true) {
			drawPlayerHands(player.seatId, player.hand);
		}
		drawPlayerWinperAndName(player.seatId, player.win, player.tie, player.name, player.isActive);
		if (board && board.length > 0) {
			drawBoard(board)
		}
	}
	drawDealerButton(getTableInfo.button);
}

function drawBackGround() {
	config.ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
}

function drawBox(seatId, isActive) {
	setColorAndFont('black', 0);
	if (isActive == false) {
		config.ctx.fillStyle = 'rgba(0, 0, 0, '+ config.visibility +')';
	}
	config.ctx.fillRect(
		config.PlayersXY[seatId].nameX,
		config.PlayersXY[seatId].nameY,
		config.boxWidth,
		parseInt(config.nameWinPerBoxHeight/2)
	);
	setColorAndFont('white', 0);
	if (isActive == false) {
		config.ctx.fillStyle = 'rgba(255, 255, 255, '+ (config.visibility + 0.1) +')';
	}
	config.ctx.fillRect(
		config.PlayersXY[seatId].winPerX,
		config.PlayersXY[seatId].winPerY,
		config.boxWidth,
		parseInt(config.nameWinPerBoxHeight/2)
	);
}
function drawDealerButton(seatId) {
	setColorAndFont('white', 0);
	config.ctx.beginPath();
	config.ctx.arc(
		config.PlayersXY[seatId].dealerButtonX + config.dealerButtonRadius,
		config.PlayersXY[seatId].dealerButtonY + config.dealerButtonRadius,
		config.dealerButtonRadius,
		0,
		Math.PI*2,
		false
	);
	config.ctx.fill();
	setColorAndFont('green', config.fontSize+8);
	config.ctx.fillText(
		'D',
		config.PlayersXY[seatId].dealerButtonX + config.dealerButtonRadius - parseInt(config.dealerButtonRadius/2),
		config.PlayersXY[seatId].dealerButtonY + parseInt(config.dealerButtonRadius*3/2)
	);
}

function drawPlayerHands(playerId, playerHands) {
	if (playerHands && playerHands[0]) {
		drawCard(playerHands[0], config.PlayersXY[playerId].handsX, config.PlayersXY[playerId].handsY);
	}
	if (playerHands && playerHands[1]) {
		drawCard(playerHands[1], config.PlayersXY[playerId].handsX + config.displayCardWidth, config.PlayersXY[playerId].handsY);
	}
}

var foldAnimationYs = [0,6,10,12,12,12,10,6,0,3,5,6,6,6,5,3,0,1,1,0,0,0,0];
function foldMovie(seatId, time) {
	drawTableInfo(tableInfo);
	if (time >= foldAnimationYs.length) return;

	setColorAndFont('red', config.fontSize*2);
	config.ctx.fillText(
		'Fold',
		config.PlayersXY[seatId].handsX + 2,
		config.PlayersXY[seatId].handsY + config.displayCardHeight - foldAnimationYs[time]
	);
	setTimeout(
		function(){ foldMovie(seatId, time+1); }, 50
	);
}

function drawPlayerWinperAndName(seatId, winPer, tiePer, playerName, isActive) {
	setColorAndFont('white', config.fontSize);
	if (isActive && isActive == false) {
		config.ctx.fillStyle = 'rgba(255, 255, 255, '+ config.visibility +')';
	}
	if (playerName) {
		config.ctx.fillText(
			playerName,
			config.PlayersXY[seatId].nameX,
			config.PlayersXY[seatId].nameY + config.fontSize + config.nameFontMargin
		);
	}
	if (typeof isActive == 'undefined') return;
	if (isActive == false) {
		config.ctx.fillStyle = 'rgba(0, 0, 0, '+ (config.visibility + 0.1) +')';
		config.ctx.fillText(
			'Fold',
			config.PlayersXY[seatId].winPerX + 2,
			config.PlayersXY[seatId].winPerY + config.fontSize + config.nameFontMargin
		);
		return;
	}
	setColorAndFont('black', config.fontSize);
	if (winPer) {
		var win = Math.round(Number(winPer.slice(0, -1)) * 10 ) / 10;
		var drawPercent = win + '％';
		if (tiePer) {
			var tie = Math.round(Number(tiePer.slice(0, -1)) * 10 ) / 10;
			if (tie >= 5) {
				drawPercent += '(' + tie +'％)';
				setColorAndFont('black', config.tieFontSize);
			}
		}
		config.ctx.fillText(
			drawPercent,
			config.PlayersXY[seatId].winPerX,
			config.PlayersXY[seatId].winPerY + config.fontSize + config.nameFontMargin
		);
	}
}

function drawBoard(board) {
	setColorAndFont('green', 0);
	var drawX = Number(config.canvasWidth/2)-Number(config.boardWidth/2);
	var drawY = config.canvasHeight - config.boxHeight - config.dealerButtonRadius*2 - config.boardHeight;
	config.ctx.fillRect(drawX, drawY, config.boardWidth, config.boardHeight);
	drawX += config.boardWidthSpace;
	drawY += config.boardHeightSpace;
	for (var key in board) {
		var card = board[key];
		drawCard(card, drawX, drawY);
		drawX += config.displayCardWidth;
	}
}

function drawCard(card,x,y) {
	setColorAndFont('white', 0);
	config.ctx.fillRect(x, y, config.cardFontSize*2-11, config.cardFontSize);
	drawX = x+2;
	drawY = y+config.cardFontSize-3;
	switch (card.charAt(1)) {
		case 's':
			setColorAndFont('black', config.cardFontSize);
			config.ctx.fillText(card.charAt(0), drawX, drawY);
			setColorAndFont('black', config.markFontSize);
			config.ctx.fillText('♠', drawX+config.markAdjust, drawY);
			return;
		case 'c':
			setColorAndFont('green', config.cardFontSize);
			config.ctx.fillText(card.charAt(0), drawX, drawY);
			setColorAndFont('green', config.markFontSize);
			config.ctx.fillText('♣', drawX+config.markAdjust, drawY);
			return;
		case 'd':
			setColorAndFont('blue', config.cardFontSize);
			config.ctx.fillText(card.charAt(0), drawX, drawY);
			setColorAndFont('blue', config.markFontSize);
			config.ctx.fillText('♦', drawX+config.markAdjust, drawY);
			return;
		case 'h':
			setColorAndFont('red', config.cardFontSize);
			config.ctx.fillText(card.charAt(0), drawX, drawY);
			setColorAndFont('red', config.markFontSize);
			config.ctx.fillText('♥', drawX+config.markAdjust, drawY);
			return;
	}
}

/**
 * 上下配置の座標計算。
 * 計算する座標は左上の座標
 */
function calcUpAndDownXYs() {
	var centerY = parseInt(config.canvasHeight/2);
	var contentsCenterY = centerY - parseInt((config.displayCardHeight + config.nameWinPerBoxHeight)/2);
	config.PlayersXY[0] = {x:0, y:contentsCenterY};
	config.PlayersXY[0].dealerButtonX = config.PlayersXY[0].x + config.displayCardWidth*2;
	config.PlayersXY[0].dealerButtonY = config.PlayersXY[0].y + config.displayCardHeight;
	for (var i=0; i<4; i++) {
		var seatId = i+1;
		var positionWidth = parseInt(config.canvasWidth / 4);
		var positionX     = i * positionWidth + parseInt(positionWidth/2) - parseInt(config.boxWidth/2);
		config.PlayersXY[seatId] = {x:positionX, y:0};
		config.PlayersXY[seatId].dealerButtonX = positionX + parseInt(config.boxWidth/2) - config.dealerButtonRadius;
		config.PlayersXY[seatId].dealerButtonY = config.boxHeight;
	}
	config.PlayersXY[5] = {x:config.canvasWidth-config.boxWidth, y:contentsCenterY};
	config.PlayersXY[5].dealerButtonX = config.PlayersXY[5].x - config.dealerButtonRadius*2;
	config.PlayersXY[5].dealerButtonY = config.PlayersXY[5].y + config.displayCardHeight;
	for (var i=0; i<4; i++) {
		var seatId = i+6;
		var positionWidth = parseInt(config.canvasWidth / 4);
		var positionX = (3-i) * positionWidth + parseInt(positionWidth/2) - parseInt(config.boxWidth/2);
		config.PlayersXY[seatId] = {x:positionX, y:config.canvasHeight - config.boxHeight};
		config.PlayersXY[seatId].dealerButtonX = positionX + parseInt(config.boxWidth/2) - config.dealerButtonRadius;
		config.PlayersXY[seatId].dealerButtonY = config.canvasHeight - config.boxHeight - config.dealerButtonRadius*2;
	}
	// ハンド座標と名前座標の計算
	for (var seatId=0; seatId<10; seatId++) {
		calcHandNameWinPerPositions(seatId);
	}
}

/**
 * 左右配置の座標計算。
 * 計算する座標は左上の座標
 */
function calcLeftAndRightXYs() {
	// 左側
	var positionHeight = parseInt(config.canvasHeight/5);
	for (var seatId=0; seatId<5; seatId++) {
		config.PlayersXY[seatId] = {x:0, y:(positionHeight*seatId)};
		config.PlayersXY[seatId].dealerButtonX = config.PlayersXY[seatId].x + config.displayCardWidth*2;
		config.PlayersXY[seatId].dealerButtonY = config.PlayersXY[seatId].y + config.displayCardHeight;
		calcHandNameWinPerPositions(seatId); // ハンド座標と名前座標の計算
	}
	// 右側
	for (var seatId=5; seatId<10; seatId++) {
		config.PlayersXY[seatId] = {
			x:(config.canvasWidth - config.boxWidth),
			y:(positionHeight*(seatId - 5))
		};
		config.PlayersXY[seatId].dealerButtonX = config.PlayersXY[seatId].x - config.dealerButtonRadius*2;
		config.PlayersXY[seatId].dealerButtonY = config.PlayersXY[seatId].y + config.displayCardHeight;
		calcHandNameWinPerPositions(seatId); // ハンド座標と名前座標の計算
	}
}

function calcCenterXYs() {
	var ringWidth  = config.canvasWidth  - config.displayCardWidth*2;
	var ringHeight = config.canvasHeight - (config.displayCardHeight + config.nameWinPerBoxHeight);
	// 端座標
	config.PlayersXY[0] = {x:parseInt(ringWidth*0/5), y:parseInt(ringHeight*2/4)};
	config.PlayersXY[1] = {x:parseInt(ringWidth*1/5), y:parseInt(ringHeight*1/4)};
	config.PlayersXY[2] = {x:parseInt(ringWidth*2/5), y:parseInt(ringHeight*0/4)};
	config.PlayersXY[3] = {x:parseInt(ringWidth*3/5), y:parseInt(ringHeight*0/4)};
	config.PlayersXY[4] = {x:parseInt(ringWidth*4/5), y:parseInt(ringHeight*1/4)};
	config.PlayersXY[5] = {x:parseInt(ringWidth*5/5), y:parseInt(ringHeight*2/4)};
	config.PlayersXY[6] = {x:parseInt(ringWidth*4/5), y:parseInt(ringHeight*3/4)};
	config.PlayersXY[7] = {x:parseInt(ringWidth*3/5), y:parseInt(ringHeight*4/4)};
	config.PlayersXY[8] = {x:parseInt(ringWidth*2/5), y:parseInt(ringHeight*4/4)};
	config.PlayersXY[9] = {x:parseInt(ringWidth*1/5), y:parseInt(ringHeight*3/4)};
	// 一部の箇所だけ特殊処理
	config.PlayersXY[1].x -= config.dealerButtonRadius;
	config.PlayersXY[1].y -= config.dealerButtonRadius;
	config.PlayersXY[4].x += config.dealerButtonRadius;
	config.PlayersXY[4].y -= config.dealerButtonRadius;
	config.PlayersXY[6].x += config.dealerButtonRadius;
	config.PlayersXY[6].y += config.dealerButtonRadius;
	config.PlayersXY[9].x -= config.dealerButtonRadius;
	config.PlayersXY[9].y += config.dealerButtonRadius;
	// ハンド座標と名前座標の計算
	for (var seatId=0; seatId<10; seatId++) {
		config.PlayersXY[seatId].x += config.displayCardWidth;
		config.PlayersXY[seatId].y += parseInt((config.displayCardHeight + config.nameWinPerBoxHeight) / 2) - 3;
		config.PlayersXY[seatId].handsX  = config.PlayersXY[seatId].x - config.displayCardWidth;
		config.PlayersXY[seatId].handsY  = config.PlayersXY[seatId].y - config.displayCardHeight;
		config.PlayersXY[seatId].nameX   = config.PlayersXY[seatId].x - config.displayCardWidth;
		config.PlayersXY[seatId].nameY   = config.PlayersXY[seatId].y + config.fontSize - 2;
		config.PlayersXY[seatId].winPerX = config.PlayersXY[seatId].x - config.displayCardWidth;
		config.PlayersXY[seatId].winPerY = config.PlayersXY[seatId].y + config.nameWinPerBoxHeight - 2;
	}
	// ディーラーボタンの左上座標
	config.PlayersXY[0].dealerButtonX = config.PlayersXY[0].x + config.displayCardWidth + config.dealerButtonRadius;
	config.PlayersXY[0].dealerButtonY = config.PlayersXY[0].y;
	config.PlayersXY[1].dealerButtonX = config.PlayersXY[1].x + config.dealerButtonRadius*2;
	config.PlayersXY[1].dealerButtonY = config.PlayersXY[1].y + config.nameWinPerBoxHeight;
	config.PlayersXY[2].dealerButtonX = config.PlayersXY[2].x;
	config.PlayersXY[2].dealerButtonY = config.PlayersXY[2].y + config.nameWinPerBoxHeight;
	config.PlayersXY[3].dealerButtonX = config.PlayersXY[3].x;
	config.PlayersXY[3].dealerButtonY = config.PlayersXY[3].y + config.nameWinPerBoxHeight;
	config.PlayersXY[4].dealerButtonX = config.PlayersXY[4].x - config.dealerButtonRadius*2;
	config.PlayersXY[4].dealerButtonY = config.PlayersXY[4].y + config.nameWinPerBoxHeight;
	config.PlayersXY[5].dealerButtonX = config.PlayersXY[5].x - config.displayCardWidth - config.dealerButtonRadius;
	config.PlayersXY[5].dealerButtonY = config.PlayersXY[5].y;
	config.PlayersXY[6].dealerButtonX = config.PlayersXY[6].x - config.dealerButtonRadius*2;
	config.PlayersXY[6].dealerButtonY = config.PlayersXY[6].y - config.displayCardHeight - config.dealerButtonRadius*2;
	config.PlayersXY[7].dealerButtonX = config.PlayersXY[7].x;
	config.PlayersXY[7].dealerButtonY = config.PlayersXY[7].y - config.displayCardHeight - config.dealerButtonRadius*2;
	config.PlayersXY[8].dealerButtonX = config.PlayersXY[8].x;
	config.PlayersXY[8].dealerButtonY = config.PlayersXY[8].y - config.displayCardHeight - config.dealerButtonRadius*2;
	config.PlayersXY[9].dealerButtonX = config.PlayersXY[9].x + config.dealerButtonRadius*2;
	config.PlayersXY[9].dealerButtonY = config.PlayersXY[9].y - config.displayCardHeight - config.dealerButtonRadius*2;
}

function calcHandNameWinPerPositions(seatId) {
	config.PlayersXY[seatId].handsX  = config.PlayersXY[seatId].x;
	config.PlayersXY[seatId].handsY  = config.PlayersXY[seatId].y;
	config.PlayersXY[seatId].nameX   = config.PlayersXY[seatId].x;
	config.PlayersXY[seatId].nameY   = config.PlayersXY[seatId].y + config.displayCardHeight;
	config.PlayersXY[seatId].winPerX = config.PlayersXY[seatId].x;
	config.PlayersXY[seatId].winPerY = config.PlayersXY[seatId].y + config.displayCardHeight + config.nameBoxHeight;
}

function setColorAndFont(color, size) {
	config.ctx.fillStyle = color;
	config.ctx.font = "bold "+size+"px \'ITC HIGHLANDER\'";
}
