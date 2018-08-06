(function(Form){

	var ratingForm = new Form('/api/reviews/add', [
			{ id: 'q_review', validation: '' }
		]);

	$('#submit-review').on('click', function(){

		var btnSubmit = $(this);
		var errorMsg = $('.error_msg');

		if(ratingForm.isValid()){
			btnSubmit.addClass('spinBtn');
			ratingForm.send({
				listingid: $('#datablock').data('listingid'),
				rating: $('input[name=rating]:checked').val() * 2,
				review: $('#q_review').val()
			}, function(data){
				
				console.log(data);

				if(data.responseJSON){
					errorMsg.text(data.responseJSON.error);
					errorMsg.show();
					// var msg = new Message(data.responseJSON.error, true, $('#yeahMsg'));
					// msg.display();
				}else{
					if(data.error){
						errorMsg.text(data.error);
						errorMsg.show();
						// var msg = new Message(data.error, true, $('#yeahMsg'));
						// msg.display();
					}else{
						errorMsg.hide();
						btnSubmit.replaceWith('<p class="success"><i class="fa fa-check"></i> Thank you, your message has been sent</p>');
						// var msg = new Message(data.success, false, $('#yeahMsg'));
						// msg.display();
					}
				}
				
				btnSubmit.removeClass('spinBtn');
		
			});
		}

	});

	// CONTACT FORM

	var contactForm = new Form('/api/listings/contact-form', [
		{ id: 'q_listing_name', validation: '' },
		{ id: 'q_listing_email', validation: '' },
		{ id: 'q_listing_postcode', validation: 'none' },
		{ id: 'q_listing_message', validation: '' }
	]);

	$('#submit_contact_form').on('click', function(){

		var btnSubmit = $(this);
		var errorMsg = $('.contact_form_error_msg');

		if(contactForm.isValid()){
			btnSubmit.addClass('spinBtn');
			contactForm.send({
				listingid: $('#datablock').data('listingid'),
				name: $('#' + contactForm.fields[0].id).val(),
				email: $('#' + contactForm.fields[1].id).val(),
				postcode: $('#' + contactForm.fields[2].id).val(),
				message: $('#' + contactForm.fields[3].id).val()
			}, function(data){
				console.log(data);
				if(data.responseJSON){
					errorMsg.text(data.responseJSON.error);
					errorMsg.show();
				}else{
					if(data.error){
						errorMsg.text(data.error);
						errorMsg.show();
					}else{
						errorMsg.hide();
						btnSubmit.replaceWith('<p class="success"><i class="fa fa-check"></i> Thank you for your review</p>');
					}
				}
				
				btnSubmit.removeClass('spinBtn');
			});
		}

	});

})(form.form);