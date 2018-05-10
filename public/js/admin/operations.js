(function(){

	function showResults(msg){
		var results = $('#results');
		results.text(msg);
	}

	$('#doit1').on('click', function(){

		showResults('');

		var btn = $(this);
		btn.addClass('spinBtn');

		$.ajax({
			url: '/api/operations/terms-form-industries',
			method: 'POST',
			data: {
				type: $('#termtype').val()
			},
			success: function(data){
				console.log(data);
				btn.removeClass('spinBtn');
				if(data.error){
					showResults(data.error);
				}else if(data.success){
					showResults(data.success);
				}else{
					showResults('this simply should not have happened');
				}
			},
			error: function(){
				btn.removeClass('spinBtn');
				showResults('Something went wrong');
			}
		});

	});

})();