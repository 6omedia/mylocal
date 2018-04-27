(function(utils){

	// var msgBox = new utils.Message();
	// var msgchainSection = $('.msgchain');
	// var notificationList = $('.notifications');
	// var notificationItems = $('.notifications li');
	// var theForm = $('.form');
	// var emailbody = $('#emailbody');
	// var subject = $('#subject');
	// var loadmore = $('.loadmore');
	// var sendbtn = $('#send');
	// var userEmail = $('#datablock').data('useremail');
	// var toEmail = null;
	// var chainId = null;
	// var msgids = [];

	var msgBox = new utils.Message();
	var msgchainSection = $('.msgchain');
	var notificationList = $('.notifications');
	var notificationItems = $('.notifications li');
	var theForm = $('.form');
	var emailbody = $('#emailbody');
	var subject = $('#subject');
	var loadmore = $('.loadmore');
	var sendbtn = $('#send');
	var userEmail = $('#datablock').data('useremail');
	var toEmail = null;
	var chainId = null;
	var msgids = [];

	function loadingToggle(loading){
		if(loading){
			loadmore.addClass('loading').addClass('disabled');
		}else{
			loadmore.removeClass('loading').removeClass('disabled');
		}
	}

	function spinToggle(loading){
		if(loading){
			sendbtn.addClass('spinBtn').addClass('disabled');
		}else{
			sendbtn.removeClass('spinBtn').removeClass('disabled');
		}
	}

	function getNotifications(skip){

		loadingToggle(true);

		$.ajax({
			url: '/api/messages?skip=' + skip,
			method: 'GET',
			success: function(data){
				console.log(data);
				loadingToggle(false);
				if(data.error){
					return msgBox.display(data.error, true, true);
				}
				if(data.messages){
					appendNotifications(data.messages);
					return;
				}
			},
			error: function(a, b, c){
				console.log(a);
				loadingToggle(false);
				msgBox.display(a.responseText.error, true, true);
			}
		});

	}

	function markAsSent(){

		console.log(msgids);

		$.ajax({
			url: '/api/messages/mark-seen',
			method: 'POST',
			data: {
				msgids: msgids
			},
			success: function(data){
				console.log(data);
				if(data.error){
					return msgBox.display(data.error, true, true);
				}
			},
			error: function(a, b, c){
				console.log(a);
				loadingToggle(false);
				msgBox.display(a.responseText.error, true, true);
			}
		});

	}

	function getMessageChain(chainid, skip = 0, msgId = null){

		if(chainid === 'undefined'){
			return alert('Not part of message chain, should not be a problem');
		}

		msgchainSection.addClass('spinBtn');
		// msgchainSection.addClass('msgLoading');

		var msgSection = document.querySelector('.msgchain');
		msgSection.scrollTop = msgSection.scrollHeight;

		$.ajax({
			url: '/api/messages/chain/' + chainid + '?skip=' + skip,
			method: 'GET',
			success: function(data){
				console.log(data);
				msgchainSection.removeClass('spinBtn');
				// msgchainSection.removeClass('msgLoading');
				if(data.error){
					return msgBox.display(data.error, true, true);
				}
				if(data.msgchain){
					$('#send').removeClass('disabled');
					prependMsgChain(data.msgchain.messages, true);
					markAsSent();
					var msgSection = document.querySelector('.msgchain');
					msgSection.scrollTop = msgSection.scrollHeight;
					return;
				}
			},
			error: function(a, b, c){
				console.log(a);
				msgchainSection.removeClass('spinBtn');
				msgBox.display(a.responseText.error, true, true);
			}
		});

	}

	function loadPrevMessages(chainid, skip){

		msgchainSection.addClass('spinBtn');

		$.ajax({
			url: '/api/messages/chain/' + chainid + '?skip=' + skip,
			method: 'GET',
			success: function(data){
				console.log(data);
				msgchainSection.removeClass('spinBtn');
				// msgchainSection.removeClass('msgLoading');
				if(data.error){
					return msgBox.display(data.error, true, true);
				}
				if(data.msgchain){
					$('#send').removeClass('disabled');
					prependMsgChain(data.msgchain.messages, false);
					return;
				}
			},
			error: function(a, b, c){
				console.log(a);
				msgchainSection.removeClass('spinBtn');
				msgBox.display(a.responseText.error, true, true);
			}
		});

	}

	function send(btn){

		spinToggle(true);

		if(emailbody.val() != ''){

			$.ajax({
				url: '/api/messages/send',
				method: 'POST',
				data: {
					htmlBody: emailbody.val(),
					subject: $('#subject').val(),
					email_to: toEmail,
					email_from: userEmail,
					email_respond: userEmail
				},
				success: function(data){
					console.log(data);

					spinToggle(false);

					if(data.error){
						return msgBox.display(data.error, true, true);
					}

					if(data.success){
						getMessageChain(data.chainid);
						emailbody.val('');
						subject.val('');
						return; // msgBox.display(data.success, false, true);
					}

					msgBox.display('Something went wrong', true, true);
				},
				error: function(a, b, c){
					btn.removeClass('spinBtn');
				}
			});

		}else{

			alert('No email body');

		}

	}

	function appendNotifications(notifications){

		notifications.forEach(function(notification){

			notificationList.append(`
				<li data-chainid="${notification.chain}" data-toemail="${notification.from.email}">
					<h5>${notification.from.name}</h5>
					<span class="date">${notification.created_at}</span>
					<p>${notification.preview}</p>
				</li>
			`);

		});

	}

	function prependMsgChain(msgs, empty = false){

		if(empty){
			msgchainSection.empty();
		}

		var count = $('.msgchain .msg').length;

		msgids = [];

		msgs.forEach(function(msg){

			var msgClass = '';

			console.log('MSG');
			console.log(msg);

			if(msg.from){
				if(msg.from.email == userEmail){
					msgClass = 'you';
				}else{
					msgClass = 'sender';
					msgids.push(msg._id);
				}
			}

			msgchainSection.prepend(`
				<div class="msg ${msgClass}" id="msg_${count}">
					${msg.body}
				</div>
			`);

			count++;

		});

	}

	/* Start =================*/

	$('#send').addClass('disabled');
	getNotifications(0);

	// var observer = new MutationObserver(function(){
	// 	msgSection.scrollTop = msgSection.scrollHeight;
	// });

	// var config = {childList: true};
	// observer.observe(msgSection, config);

	loadmore.on('click', function(){
		if(!$(this).hasClass('disabled')){
			console.log('cdsc ', $('.notifications li').length);
			getNotifications($('.notifications li').length);
		}
	});

	$('.notifications').on('click', 'li', function(){
		toEmail = $(this).data('toemail');
		chainId = $(this).data('chainid');
		// getMessageChain($(this).data('chainid'), 0, $(this).attr('id'));
		getMessageChain($(this).data('chainid'), 0);
	});

	$('#send').on('click', function(){
		if(!$(this).hasClass('disabled')){
			send($(this));
		}
	});

	msgchainSection.scroll(function() {
	    var pos = msgchainSection.scrollTop();
	    if(pos == 0){
 			// console.log(chainId, ' ', $('.msgchain .msg').length);
	    	loadPrevMessages(chainId, $('.msgchain .msg').length);
	    }
	});

	// TODO:
		// - when message clicked it scrolls to the correct position in the chains

})(utils);