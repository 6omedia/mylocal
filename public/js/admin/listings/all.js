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
					<td>${listing.membership}</td>
					<td class="actions">
						<a class="view" href="/listing/${listing.slug}" target="_blank"></a>
						<span class="switch_membership" data-listingid="${listing._id}"></span>
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

	function updateMembership(listingid, membership, listings, callback){

		// console.log(listings);

		$.ajax({
			url: '/api/listings/switch-membership',
			method: 'POST',
			data: {
				listingid: listingid,
				listings: listings,
				membership: membership
			},
			success: function(data){
				// console.log(data);
				if(data.error){
					callback(data.error);
				}else{
					callback(null, data.listings);
				}
			},
			error: function(a, b, c){
				console.log(a,b,c);
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

	$('table').on('click', '.switch_membership', function(){

		var listingid = $(this).data('listingid');
		var membership = $(this).data('membership');

		var mpopup = new PopUp(function(){},function(){});

		var select = $('<select>');
		select.append('<option value="free">Free</option>');
		select.append('<option value="silver">Silver</option>');
		select.append('<option value="gold">Gold</option>');
		select.append('<option value="platinum">Platinum</option>');

		var htmlbox = $('<div>');
		var saveBtn = $('<button>', {"class": "yesBtn"}).html('Save').on('click', function(){
					
						htmlbox.addClass('spinFull');

						var listingTds = $('.switch_membership');

						let listings = [];

						for(i=0;i<listingTds.length;i++){
							listings.push($(listingTds[i]).data('listingid'));
						}

						updateMembership(listingid, $(select).val(), listings, function(err, listings){

							if(err){
								var msg = new Message(err, true, $('#msg'));
								msg.display(false);
							}else{
								refreshListings(listings);
							}

							htmlbox.removeClass('spinFull');
							mpopup.popDown();
						});
					});

		htmlbox.append(select);
		htmlbox.append(saveBtn);

		mpopup.popUp('Switch Membership', htmlbox);

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