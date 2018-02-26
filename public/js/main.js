(function(YeahAutocomplete){

	var searchResults = $('#searchResults');
	var inputIndustry = $('#industry');
	var inputTown = $('#town');

	var industryAutocomplete = new YeahAutocomplete({
	    input: 'industry',
	    allowFreeType: true,
	    dataUrl: '/api/locations/search?term=',
	    method: 'GET',
	    arrName: 'results',
	    property: 'name'
	});

	var townAutocomplete = new YeahAutocomplete({
	    input: 'town',
	    allowFreeType: true,
	    dataUrl: '/api/locations/search?term=',
	    method: 'GET',
	    arrName: 'locations',
	    property: ''
	});

	// /find/Restaurants/Bournemouth?page=1

	$('#hFind').on('click', function(){

		if($('#industry').val() != '' && $('#town').val() != ''){
			location.href = '/find/' + $('#industry').val() + '/' + $('#town').val() + '?page=1';
		}

	});

})(YeahAutocomplete);