(function(utils){

	var msgBox = new utils.Message();
	var msgchainSection = $('.msgchain');
	var notificationList = $('.notifications');
	var notificationItems = $('.notifications li');
	var theForm = $('.form');
	var emailbody = $('#emailbody');
	var loadmore = $('.loadmore');
	var sendbtn = $('#send');
	var userEmail = $('#datablock').data('useremail');
	var toEmail = null;

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

	function getMessageChain(chainid, skip = 0){

		if(chainid === 'undefined'){
			return alert('Not part of message chain, should not be a problem');
		}

		msgchainSection.addClass('spinBtn');

		$.ajax({
			url: '/api/messages/chain/' + chainid + '?skip=' + skip,
			method: 'GET',
			success: function(data){
				console.log(data);
				msgchainSection.removeClass('spinBtn');
				if(data.error){
					return msgBox.display(data.error, true, true);
				}
				if(data.msgchain){
					$('#send').removeClass('disabled');
					prependMsgChain(data.msgchain.messages, true);
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
						return msgBox.display(data.success, false, true);
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

		msgs.forEach(function(msg){

			var msgClass;

			if(msg.from.email == userEmail){
				msgClass = 'you';
			}else{
				msgClass = 'sender';
			}

			msgchainSection.prepend(`
				<div class="msg ${msgClass}">
					${msg.body}
				</div>
			`);

		});

	}

	/* Start =================*/

	$('#send').addClass('disabled');
	getNotifications(0);

	var msgBox = document.querySelector('.msgchain');

	var observer = new MutationObserver(function(){
		msgBox.scrollTop = msgBox.scrollHeight;
	});

	var config = {childList: true};
	observer.observe(msgBox, config);

	loadmore.on('click', function(){
		if(!$(this).hasClass('disabled')){
			getNotifications($('.notifications li').length);
		}
	});

	$('.notifications').on('click', 'li', function(){
		toEmail = $(this).data('toemail');
		getMessageChain($(this).data('chainid'));
	});

	$('#send').on('click', function(){
		if(!$(this).hasClass('disabled')){
			send($(this));
		}
	});

	// TODO:
		// - load more messages from mesage chain when scrolled to the top 
		// - when message clicked it scrolls to the correct position in the chain
		// - when new message send it reloads messages and scrolls to bottom

})(utils);