(function(YeahAutocomplete, Form){

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

	// var searchIcon = $('.icon-search');
	// var searchBox = $('.searchBox');
	// var header = $('header');

	// searchIcon.on('click', function(){

	// 	if(searchIcon.hasClass('mobile-menu')){
	// 		searchIcon.removeClass('mobile-menu');
	// 		searchBox.removeClass('mobile-menu');
	// 		header.removeClass('heroSearch');
	// 	}else{
	// 		closeAll();
	// 		searchIcon.addClass('mobile-menu');
	// 		searchBox.addClass('mobile-menu');
	// 		header.addClass('heroSearch');
	// 	}

	// });

	// function closeAll(){
	// 	searchIcon.removeClass('mobile-menu');
	// 	searchBox.removeClass('mobile-menu');
	// 	header.removeClass('heroSearch');
	// 	burger.removeClass('mobile-menu');
	// 	menu.removeClass('mobile-menu');
	// }

	/////////////////////////////////////////////

    var errorBox = $('#error');

    function toggleLoading(btn, loading){

        if(loading){
            btn.addClass('spinBtn');
            btn.attr('disabled', 'disabled');
        }else{
            btn.removeClass('spinBtn');
            btn.attr('disabled', '');
        }

    }

    var loginForm = new Form('/api/login', [
            { id: 'q_email', validation: 'email' },
            { id: 'q_password', validation: '' },
        ]);

    var registerForm = new Form('/api/register', [
            { id: 'r_name', validation: '' },
            { id: 'r_email', validation: 'email' },
            { id: 'r_password', validation: '' },
            { id: 'r_passwordconfirm', validation: 'password', message: 'Passwords Do Not Match' }
        ]);
	
    $('#btn_login').on('click', function(e){

        e.preventDefault();
        var btn = $(this);

        if(loginForm.isValid()){

            toggleLoading(btn, true);

            var data = {
                email: $('#' + loginForm.fields[0].id).val(),
                password: $('#' + loginForm.fields[1].id).val()
            };

            loginForm.send(data, function(data){
                toggleLoading(btn, false);
                if(data.error){
                    errorBox.append('<p>' + data.error + '</p>');
                    return;
                }
                if(data.success){
                    if(data.redirect){
                        window.location.replace(data.redirect);
                    }else{
                        window.location.reload(window.location.href);
                    }
                }
            });

        }else{
            errorBox.empty();
            errorBox.append('<p>' + loginForm.message + '</p>');
        }

    });

    $('#btn_register').on('click', function(e){

        e.preventDefault();
        var btn = $(this);

        if(registerForm.isValid()){

            toggleLoading(btn, true);

            var data = {
                name: $('#' + registerForm.fields[0].id).val(),
                email: $('#' + registerForm.fields[1].id).val(),
                password: $('#' + registerForm.fields[2].id).val(),
                confirm_password: $('#' + registerForm.fields[3].id).val()
            };

            registerForm.send(data, function(data){
                toggleLoading(btn, false);
                if(data.error){
                    errorBox.append('<p>' + data.error + '</p>');
                    return;
                }
                if(data.success){
                    window.location.replace(data.redirect);
                }
            });

        }else{
            errorBox.empty();
            errorBox.append('<p>' + registerForm.message + '</p>');
        }

    });

    var searchBox = $('.ml-search');

    $('.ml-search .close').on('click', function(){
        searchBox.fadeOut(400);
    });

    $('.show-search-button').on('click', function(){
        searchBox.fadeIn(400);
    });

})(YeahAutocomplete, form.form);