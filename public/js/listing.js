(function(Form){

	var ratingForm = new Form('/api/reviews/add', [
			{ id: 'q_review', validation: '' }
		]);

	$('#submit-review').on('click', function(){

		var btnSubmit = $(this);
		var errorMsg = $('.error_msg');
		btnSubmit.addClass('spinBtn');

		if(ratingForm.isValid()){
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
						btnSubmit.replaceWith('<p class="success"><i class="fa fa-check"></i> Thank you for your review</p>');
						// var msg = new Message(data.success, false, $('#yeahMsg'));
						// msg.display();
					}
				}
				
				btnSubmit.removeClass('spinBtn');
		
			});
		}

	});

})(form.form);