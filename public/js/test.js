(function(utils){

	var msgBox = new utils.Message();

	function send(data){
		$.ajax({
			url: '/api/sendmail',
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
			type: 'Subscriber Templates',
			template: 'register',
			emailto: 'bruce@6omedia.co.uk',
			emailfrom: 'mail@mylocal.co'
		});
	});

	$('#email2').on('click', function(){
		send({
			type: 'Subscriber Templates',
			template: 'reviewed',
			emailto: 'hulk@6omedia.co.uk',
			emailfrom: 'mail@mylocal.co'
		});
	});

	$('#email3').on('click', function(){
		send({
			type: 'Business Owner Templates',
			template: 'goodreview',
			emailto: 'bruce@6omedia.co.uk',
			emailfrom: 'mail@mylocal.co'
		});
	});

	$('#email4').on('click', function(){
		send({
			type: 'Business Owner Templates',
			template: 'badreview',
			emailto: 'bruce@6omedia.co.uk',
			emailfrom: 'mail@mylocal.co'
		});
	});

	$('#email5').on('click', function(){
		send({
			type: null,
			template: null,
			emailto: 'thor@6omedia.co.uk',
			emailfrom: 'hulk@6omedia.co.uk', // 'mail@mylocal.co',
			emailbody: $('#yeah').val(),
			fbdf: 'vbfdbvd'
		});
	});

})(utils);