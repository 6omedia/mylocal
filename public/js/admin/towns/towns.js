(function(YeahAutocomplete, utils){

	var msg = new utils.Message();

	function addCapital(town, callback){
		$.ajax({
			url: '/api/towns/addcapital',
			method: 'POST',
			data: {
				town: town
			},
			success: function(data) {
				callback();
				if(data.error){
					return msg.display(data.error, true, false);
				}
				if(data.success){
					updateCapitalTowns(data.towns, data.pagination);
					return msg.display(data.success, false, false);
				}
				return msg.display('Something may have gone wrong', true, false);
			}
		});
	}

	function removeCapital(town, callback){
		$.ajax({
			url: '/api/towns/removecapital',
			method: 'POST',
			data: {
				town: town
			},
			success: function(data) {
				callback();
				if(data.error){
					return msg.display(data.error, true, false);
				}
				if(data.success){
					updateCapitalTowns(data.towns, data.pagination);
					return msg.display(data.success, false, false);
				}
				return msg.display('Something may have gone wrong', true, false);
			}
		});
	}

	function updateCapitalTowns(towns, pagination) {

		console.log(towns);

		var list = $('#capital_list');

		list.empty();
		for(i=0; i<towns.length; i++){
			list.append(`
				<li>
					<span class="x">x</span>
					<p>${towns[i].name}</p>
				</li>
			`);
		}

		// list.insertAfter(pagination);

	}

	// auto complete
	var townsAutocomplete = new YeahAutocomplete({
		input: 'town_name',
		allowFreeType: true,
		dataUrl: '/api/towns/search?term=',
		method: 'GET',
		arrName: 'towns',
		property: 'name'
	});

	// on add click

	$('#add').on('click', function(){
		
		var thisBtn = $(this);
		thisBtn.addClass('spinBtn');
		var town = $('#town_name').val();

		if(town != ''){
			addCapital(town, function(){
				thisBtn.removeClass('spinBtn');
			});
		}
		
	});

	// unassign capital town
	$('#capital_list').on('click', '.x', function(){
		
		var thisBtn = $(this);
		thisBtn.addClass('spinBtn');
		var town = $(this).next().text();

		if(town != ''){
			removeCapital(town, function(){
				thisBtn.removeClass('spinBtn');
			});
		}

	});

})(YeahAutocomplete, utils);