(function(utils){

	var msgBox = new utils.Message();

	function send(data){
		$.ajax({
			url: '/api/sendnotification',
			method: 'POST',
			data: data,
			success: function(data){
				console.log(data);
				if(data.error){
					return msgBox.display(data.error, true, true);
				}

				if(data.success){
					return msgBox.display(data.success, false, true);
				}

				msgBox.display('Something went wrong', true, true);
			},
			error: function(a, b, c){

			}
		});
	}

	$('#email1').on('click', function(){
		send({
			template_type: 'Subscriber Templates',
			template_name: 'register',
			email_to: 'hulk@6omedia.co.uk',
			email_from: 'mail@mylocal.co',
			email_respond: 'mail@6omedia.co.uk'
		});
	});

	$('#email2').on('click', function(){
		send({
			template_type: 'Subscriber Templates',
			template_name: 'reviewed',
			email_to: 'hulk@6omedia.co.uk',
			email_from: 'mail@mylocal.co',
			email_respond: 'mail@6omedia.co.uk'
		});
	});

	$('#email3').on('click', function(){
		send({
			template_type: 'Business Owner Templates',
			template_name: 'goodreview',
			email_to: 'hulk@6omedia.co.uk',
			email_from: 'mail@mylocal.co',
			email_respond: 'mail@6omedia.co.uk'
		});
	});

	$('#email4').on('click', function(){
		send({
			template_type: 'Business Owner Templates',
			template_name: 'badreview',
			email_to: 'hulk@6omedia.co.uk',
			email_from: 'mail@mylocal.co',
			email_respond: 'mail@6omedia.co.uk'
		});
	});

	$('#email5').on('click', function(){
		send({
			htmlBody: $('#yeah').val(),
			template_type: '',
			template_name: '',
			subject: 'THISSSONEEEE',
			email_to: 'thor@6omedia.co.uk',
			email_from: 'hulk@6omedia.co.uk',
			email_respond: 'hulk@6omedia.co.uk'
		});
	});

})(utils);