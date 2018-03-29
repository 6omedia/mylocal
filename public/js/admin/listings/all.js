(function(PopUp, YeahAutocomplete){

	var nameInput = $('#business_name');
	var industryInput = $('#industry');
	var townInput = $('#town');
	var table = $('table');

	var industryAutocomplete = new YeahAutocomplete({
	    input: 'industry',
	    allowFreeType: true,
	    dataUrl: '/api/terms/search?term=',
	    method: 'GET',
	    arrName: 'terms',
	    property: ''
	});

	var townAutocomplete = new YeahAutocomplete({
	    input: 'town',
	    allowFreeType: true,
	    dataUrl: '/api/locations/search?term=',
	    method: 'GET',
	    arrName: 'locations',
	    property: ''
	});

	function refreshListings(listings){

		table.find("tr:gt(0)").remove();

		for(i=0; i<listings.length; i++){
			var listing = listings[i];
			var name = 'Not Claimed';
			if(listing.userId){
				name = listing.userId.name;
			}
			table.append(
				`<tr>
					<td>${listing.business_name}</td>
					<td>${name}</td>
					<td>${listing.industry}</td>
					<td>${listing.address.town}, ${listing.address.line_one}</td>
					<td>
						<a class="view" href="/listing/${listing.slug}" target="_blank"></a>
						<a class="edit" href="/admin/listings/edit/${listing._id}" target="_blank"></a>
						<span class="delete" data-listingid="${listing._id}"></span>
					</td>
				</tr>`
			);
		}

	}

	function deleteListing(listingId, callback){

		$.ajax({
			url: '/api/listings/' + listingId,
			method: 'DELETE',
			success: function(data){

				if(data.success){
					callback({success: 'Listing Removed', listings: data.listings, pagination: data.pagination});
				}else{
					callback({error: data.error || 'Something went wrong'});
				}
			},
			error: function(xhr, desc, err){
				callback({error: xhr.responseJSON.error || 'Something went wrong'});
			}
		});

	}

	function getListings(callback){
		$.ajax({
			url: '/api/listings/find/search',
			method: 'GET',
			data: {
				name: nameInput.val(),
				industry: industryInput.val(),
				town: townInput.val()
			},
			success: function(data){
				callback(null, data.listings);
			},
			error: function(a, b, c){
				callback(a);
			}
		});
	}

	$('#search').on('click', function(){
		getListings(function(err, listings){
			if(err){
				var msg = new Message(response.error, true, $('#msg'));
				msg.display(false);
			}else{
				refreshListings(listings);
			}
		});
	});

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
							getListings(function(err, listings){
								if(err){
									var msg = new Message(response.error, true, $('#msg'));
									msg.display(false);
								}else{
									refreshListings(listings);
								}
							})
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

})(PopUp, YeahAutocomplete);