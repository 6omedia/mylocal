(function(PopUp){

	// variables

	var body = $('body');
	var table = $('table');

	// functions

	function getPendingReviews(listingid, callback){

		var url = '/api/reviews/?approved=0';

		if(listingid != null){
			url = '/api/reviews/' + listingid + '/?approved=0';
		}

		$.ajax({
			url: url,
			method: 'GET',
			success: function(data){
				if(data.error){
					callback(data.error);
				}else{
					callback(null, data.reviews);
				}
			},
			error: function(a, b, c){
				callback(a);
			}
		});

	}

	function updateReviews(reviews){

		table.empty();

		table.append(`
			<tr>
				<th>Listing</th>
				<th>Author</th>
				<th></th>
			</tr>
		`);

		console.log(reviews);

		for(i=0; i<reviews.length; i++){
			table.append(`
				<tr>
					<th>${reviews[i].listing}</th>
					<th>Author</th>
					<th></th>
				</tr>
			`);
		}

	}

	// go

	body.addClass('spinFull');

	getPendingReviews(null, function(err, reviews){
		updateReviews(reviews);
		body.removeClass('spinFull');
	});

})(PopUp);