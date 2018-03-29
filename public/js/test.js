(function(){

	$('button').on('click', function(){
		$.ajax({
			url: '/api/sendmail',
			method: 'POST',
			success: function(data){
				console.log(data);
			},
			error: function(a, b, c){

			}
		});
	});

})();