(function(YeahAutocomplete){

	var searchResults = $('#searchResults');
	var inputIndustry = $('#industry');
	var inputTown = $('#town');

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

	// /find/Restaurants/Bournemouth?page=1

	$('#hFind').on('click', function(){

		if($('#industry').val() != '' && $('#town').val() != ''){
			location.href = '/find/' + $('#industry').val() + '/' + $('#town').val() + '?page=1';
		}

	});

	/*=== Mobile Menu ===*/

	var burger = $('.burger');
	var menu = $('.menu_main');

	burger.on('click', function(){

		if(burger.hasClass('mobile-menu')){
			burger.removeClass('mobile-menu');
			menu.removeClass('mobile-menu');
		}else{
			closeAll()
			burger.addClass('mobile-menu');
			menu.addClass('mobile-menu');
		}

	});

	/*=== Search ===*/

	var searchIcon = $('.icon-search');
	var searchBox = $('.searchBox');
	var header = $('header');

	searchIcon.on('click', function(){

		if(searchIcon.hasClass('mobile-menu')){
			searchIcon.removeClass('mobile-menu');
			searchBox.removeClass('mobile-menu');
			header.removeClass('heroSearch');
		}else{
			closeAll();
			searchIcon.addClass('mobile-menu');
			searchBox.addClass('mobile-menu');
			header.addClass('heroSearch');
		}

	});

	function closeAll(){
		searchIcon.removeClass('mobile-menu');
		searchBox.removeClass('mobile-menu');
		header.removeClass('heroSearch');
		burger.removeClass('mobile-menu');
		menu.removeClass('mobile-menu');
	}

})(YeahAutocomplete);