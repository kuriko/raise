var lastTableInfo = {}; // 直前に取得したテーブル情報
var oddsList = [];

// socket:tableInfo イベント処理
function drawTableInfo(tableInfo) {
	var players = tableInfo.players;
	var board = tableInfo.board;

	displayInit();

	displayDealerButton(tableInfo.button);
	displayBoard(board);
	for (var key in players) {
		var player = players[key];
		if (!player) continue;

		if(isActive(player)) {
			resetPlayerBox(player.seatId);
		}

		displayName(player.seatId, player.name);
		displayHand(player.seatId, player.hand, player.isActive);
		displayOdds(player.seatId, player.win, player.tie);

		// FOLD検知
		if (
				lastTableInfo.players &&
				lastTableInfo.players[key] &&
 				isActive(lastTableInfo.players[key]) &&
 				!isActive(player)
			) {
				displayFold(player.seatId);
		}
	}
	calculateOddsStyle();
	updateInputPlayerNames(players);

	lastTableInfo = tableInfo;
}

addUpdateTableInfoListener(drawTableInfo);

function displayInit() {
	$('.playerBox').hide(); // 名前を消したプレイヤーのplayerBoxを表示しないための初期化
}

function resetPlayerBox(seatId) {
	// アクションをクリア
	$('#player'+seatId+'Folded').hide();
	$('#player'+seatId+'Box').css({opacity:"1.0"}); // Fold（半透明）状態を解除
}

function isActive(target) {
	// 文字列の場合があるのでラップする
	return target.isActive == true;
}

function displayDealerButton(seatId) {
	$('.dealer').removeClass('on');
	$('#player'+seatId+'Dealer').addClass('on');
}

function displayBoard(board) {
	if (!board || board.length <= 0) {
		// clear
		$('.board').fadeOut(200, function() {
			$('.board.card').removeClass('color_s color_h color_d color_c mark_s mark_h mark_d mark_c').text('');
		});

	} else {
		// show
		$('#board').show();
		for (var key in board) {
			var code = board[key];
			$selector = $('#board'+key);
			$selector.fadeIn();
			$selector.text(code.charAt(0));
			$selector.addClass('color_'+code.charAt(1));
			$selector.addClass('mark_'+code.charAt(1));
		}
	}
}

function displayHand(playerId, playerHands, isActive) {
	$leftCard = $('#player'+playerId+'HandLeft');
	$rightCard = $('#player'+playerId+'HandRight');
	if (!isActive) {
		hideCard($leftCard);
		hideCard($rightCard);
		return;
	}
	if (playerHands && playerHands[0]) {
		displayCard($leftCard, playerHands[0]);
	} else {
		hideCard($leftCard);
	}
	if (playerHands && playerHands[1]) {
		displayCard($rightCard, playerHands[1]);
	} else {
		hideCard($rightCard);
	}
}
function hideCard($selector) {
	$selector.hide();
	$selector.removeClass('color_s color_h color_d color_c mark_s mark_h mark_d mark_c').text('');
}
function displayCard($selector, code) {
	$selector.text(code.charAt(0));
	$selector.addClass('color_'+code.charAt(1));
	$selector.addClass('mark_'+code.charAt(1));
	$selector.fadeIn();
}

function displayName(seatId, playerName) {
	if(!playerName) return;
	$('#player'+seatId+"Box").show();
	$('#player'+seatId+"Name").text(playerName);
}

function displayFold(seatId) {
	$('#player'+seatId+'Folded')
		.show()
		.textillate({
			in: { effect: 'swing' },
			callback: function() {
				$('#player'+seatId+'Box').stop().animate({ opacity: "0.5"}, 600);
			}
		})
		.textillate('start');
}

function displayOdds(seatId, winPer, tiePer) {
	var $playerOdds = $('#player'+seatId+"Odds");
	if(!winPer) {
		// clear
		$playerOdds.hide();

	} else {
		//show
		var win = createWinOdds(winPer);
		var tie = createTieOdds(tiePer);
		if(tie) { $playerOdds.addClass('withTie'); } else { $playerOdds.removeClass('withTie'); }
		oddsList.push(win);
		$playerOdds
		.attr('data-win', win)
		.text(win + tie + '%')
		.show()
	}
}
function createWinOdds(winPer) {
	return roundOdds(winPer);
}
function createTieOdds(tiePer) {
	var tie = roundOdds(tiePer);
	if (tie < 5) return "";
	return '(' + tie +')';
}
function roundOdds(odds) {
	if(!odds) return;
	return (Math.round(Number(odds.replace('%','')) * 10 ) / 10);
}

function calculateOddsStyle() {
	var $odds = $('.odds');
	$odds.removeClass('max win');
	var max = Math.max.apply(null, oddsList);
	$(".odds[data-win='"+max+"']").addClass('max');
	$(".odds[data-win='100']").addClass('win');
	oddsList = [];
}

// プレイヤー書き込み一覧の書き換え
function updateInputPlayerNames(players) {
	for (var seatId=0; seatId<10; seatId++) {
		if (players[seatId]) {
			var player = players[seatId];
			$('#inputPlayer'+seatId).val(player.name);
		} else {
			$('#inputPlayer'+seatId).val('');
		}
	}
}