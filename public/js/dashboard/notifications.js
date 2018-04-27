(function(utils){

	var msgBox = new utils.Message();

	var inboxSpin = $('.spinBox');
	var replyMail = $('.reply-mail');

	var emailbody = $('#emailbody');
	var subject = $('#subject');
	var sendbtn = $('#send');
	var userEmail = $('#datablock').data('useremail');
	var toEmail = null;

	var modal = $('#replyModal');

	function spinToggle(loading){
		if(loading){
			sendbtn.addClass('spinBtn').addClass('disabled');
		}else{
			sendbtn.removeClass('spinBtn').removeClass('disabled');
		}
	}

	function markAsSeen(){

		var msgids = [];

		$('.dashboard-message').each(function(){
			msgids.push($(this).data('msgid'));
		});

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
				// loadingToggle(false);
				msgBox.display(a.responseText.error, true, true);
			}
		});

	}

	function sendEmail(){

		spinToggle(true);

		if(emailbody.val() != ''){

			// spinToggle(false);

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
					//	getMessageChain(data.chainid);
						emailbody.val('');
						subject.val('');
						modal.fadeOut(400);
						msgBox.display(data.success, false, true);
						return;
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

	markAsSeen();

	replyMail.on('click', function(){
		toEmail = $(this).data('toemail');
		modal.fadeIn(400);
	});

	$('#send').on('click', function(){
		if(!$(this).hasClass('disabled')){
			sendEmail($(this));
		}
	});

})(utils);