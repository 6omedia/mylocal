(function(PopUp){

	$.urlParam = function (name) {
	    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
	                      .exec(window.location.href);

	    if(results)
	    	return results[1] || 0;
	}

	function deleteListing(listingId, callback){

		var getUrl = '/api/listings';
		var page = $.urlParam('page');

		if(page){
			getUrl = getUrl + '?page=' + page;
		}

		$.ajax({
			url: '/api/listings/' + listingId,
			method: 'DELETE',
			success: function(data){

				console.log(data);

				if(data.success){

					$.ajax({
						url: getUrl, // + userId,
						method: 'GET',
						success: function(data){

							console.log(data);

							if(data.listings){
								callback({success: 'Listing Removed', listings: data.listings, pagination: data.pagination});
							}else{
								callback({error: data.error || 'Something went wrong'});
							}

						},
						error: function(xhr, desc, err){
							callback({error: xhr.responseJSON.error || 'Something went wrong'});
						}
					});

				}else{
					callback({error: data.error || 'Something went wrong'});
				}
			},
			error: function(xhr, desc, err){
				callback({error: xhr.responseJSON.error || 'Something went wrong'});
			}
		});

	}

	function refreshListings(listings){

		var table = $('table');

		table.find("tr:gt(0)").remove();

		for(i=0; i<listings.length; i++){

			var owner = 'Not Claimed';

			if(listings[i].userId){
				owner = listings[i].userId.name;
			}

			var row = `
				<tr>
				    <td>${listings[i].business_name}</td>
				    <td>${owner}</td>
				    <td>${listings[i].industry}</td>
				    <td>${listings[i].address.town}</td>
				    <td>
				        <a class="view" href="/listing/${listings[i].slug}"></a>
				        <a class="edit" href="/admin/listings/edit/${listings[i]._id}"></a>
				        <span class="delete" data-listingid="${listings[i]._id}"></span>
				    </td>
				</tr>
			`;

			table.append(row);
		}

	}

	$('table').on('click', '.delete', function(){

		var listingId = $(this).data('listingid');

		var areYouSure = new PopUp(
				function(){
					
					$('.c_modal').addClass('.spinBtn');

					deleteListing(listingId, function(response){
						if(response.error){
							var msg = new Message(response.error, true, $('#msg'));
							msg.display(false);
						}else{
							var msg = new Message(response.success, false, $('#msg'));
							msg.display(false);
							refreshListings(response.listings);
							$('.paginationDiv').empty();
							$('.paginationDiv').append(response.pagination);
						}
						$('.c_modal').removeClass('.spinBtn');
						areYouSure.popDown();
					});

				},
				function(){
					areYouSure.popDown();
				}
			);

		areYouSure.popUp('Are you sure you want to delete this listing?');

	});

})(PopUp);