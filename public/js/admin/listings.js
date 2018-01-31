(function(PopUp, YeahAutocomplete, ImageLibrary, Form, YeahTextEditor){

	// functions

	function Services(){
		this.services = [];
		this.box = $('#selected_services');
		var thisServices = this;
		this.box.on('click', '.x', function(){
			thisServices.services.splice($(this).parent().index, 1);
			$(this).parent().remove();
		});	
	}

	Services.prototype.updateServices = function() {
		
		this.box.empty();
		var theBox = this.box;

		$(this.services).each(function(){
			theBox.append('<span>' + this + '<span class="x">x</span></span>');
		});

	};

	Services.prototype.addService = function(name){
		this.services.push(name);
		this.updateServices();
	};

	// function getGallery(){
	// 	$('#galleryInput').data('images').split(',');
	// }

	// Variables
	var input_industries = $('#industry');
	var input_services = $('#services');
	var services = new Services();
	var socialStyleBtn = $('#social_style');
	var galleryBtn = $('#galleryInput');
	var gallery;
	if(galleryBtn.data('images')){
		gallery = galleryBtn.data('images').split(',') || [];
	}else{
		gallery = [];
	}

	var txtEditor = new YeahTextEditor();
	// var openingTimes;

	function updateGallery(){
		$('#galleryInput .imgCount').text(gallery.length + ' ');
		$('.galleryUl').empty();
		for(i=0; i<gallery.length; i++){
			$('.galleryUl').append(`
					<li>
						<img src="${gallery[i]}" />
					</li>
				`);
		}
	}

	/* START */

	// yeahcomplete

	if($('#industry').val() == ''){
		input_services.attr('disabled', 'disabled')
	}

	var industryAutocomplete = new YeahAutocomplete({
		input: 'industry',
		allowFreeType: false,
		dataUrl: '/api/industries/search?term=',
		method: 'GET',
		arrName: 'results',
		property: 'name'
	});

	input_industries.on('resultSelected', function(hmm){
		
		input_services.attr('disabled', false);

		var servicesAutocomplete = new YeahAutocomplete({
			input: 'services',
			allowFreeType: true,
			dataUrl: '/api/industries/services/' + input_industries.val() + '/search?term=',
			method: 'GET',
			arrName: 'results',
			property: ''
		});

	});

	$('#services + .btn').on('click', function(){

		if(input_services.val() != ''){
			services.addService(input_services.val());
			input_services.val('');
		}

	});

	// icon style picker

	var socialPopUp = new PopUp(
		function(){
			console.log('vdf');
		},
		function(){
			console.log('gfbfdgbvdf', '<div class="">YEASHHHH</div>');
		},
		{
			custom_class: 'social'
		}
	);

	var socialIconSets = $('<div>', {"class": "social_icon_sets"});
	socialIconSets.append(`
		<h1>Social Media Icon Styles</h1>
		<ul class="list">
			<li>
				<label>Standard</label>
				<div class="a_social_style standard"></div>
			</li>
			<li>
				<label>Black</label>
				<div class="a_social_style black"></div>
			</li>
			<li>
				<label>No Circle</label>
				<div class="a_social_style nocircle"></div>
			</li>
			<li>
				<label>Black No Circle</label>
				<div class="a_social_style blacknocircle"></div>
			</li>
			<li>
				<label>White No Circle</label>
				<div class="a_social_style whitenocircle"></div>
			</li>
		</ul>
	`);

	socialStyleBtn.on('click', function(){
		socialPopUp.popUp('', socialIconSets);
	});

	$('body').on('click', '.social_icon_sets li', function(){
		var theClass = $(this).find('.a_social_style').attr('class').split(' ')[1];
		socialStyleBtn.data('style', theClass);
		socialStyleBtn.data('readable', $(this).find('label').text());
		socialStyleBtn.removeClass();
		socialStyleBtn.addClass('fakeInput');
		socialStyleBtn.addClass(theClass);
		$('#social_style > span').text(socialStyleBtn.data('readable'));
		socialPopUp.popDown();
	});

	// Image uploading
	var currentImgInput;

	var imgLib = new ImageLibrary($('#image_library_modal'));

	$('#listinglogo_box').on('click', function(){
		currentImgInput = this;
		imgLib.openLibrary(this);
	});

	$('#listingbg_box').on('click', function(){
		currentImgInput = this;
		imgLib.openLibrary(this);
	});

	imgLib.onSelectImage(function(yeah){
		if(currentImgInput == 'gallery'){
			gallery.push('/static/uploads/' + yeah);
			updateGallery();
		}else{
			$(currentImgInput).find('img').attr('src', '/static/uploads/' + yeah);
		}
	});

	// gallery

	var galleryPopUp = new PopUp(
		function(){
			console.log('vdf');
		},
		function(){
			console.log('gfbfdgbvdf', '<div class="">YEASHHHH</div>');
		},
		{
			custom_class: 'gallery'
		}
	);

	var div = $('<div></div>');
	var theGallery = $('<ul>', {"class": "galleryUl"});

	for(i=0; i<gallery.length; i++){
		theGallery.append(`
				<li>
					<img src="${gallery[i]}" />
				</li>
			`);
	}

	div.append(theGallery);
	div.append('<div class="btn addImgGall">Add Image</div>');

	galleryBtn.on('click', function(){
		galleryPopUp.popUp('', div);
	});

	$('body').on('click', '.addImgGall', function(){
		currentImgInput = 'gallery';
		imgLib.openLibrary(this);
	});

	$('body').on('click', '.galleryUl li', function(){
		var index = $(this).index();
		console.log(index);
		gallery.splice(index, 1);
		updateGallery();
	});

	// form submition

	function getServices(){
		var arr = [];
		$('#selected_services > span').each(function(){
			arr.push($(this).text().substring(0, $(this).text().length-1));
		});
		return arr;
	}

	function checkOpendingHours(){

		var openingHours = {};
		var invalid = false;

		$('.openingTimes li').each(function(){

			var inputs = $(this).children('input');
			var openHours = $(inputs[0]).val();
			var openMins = $(inputs[1]).val();
			var closeHours = $(inputs[2]).val();
			var closeMins = $(inputs[3]).val();

			var open = 'closed';
			var close = 'closed';

			if(openHours != '' && openMins != ''){
				open = openHours + ':' + openMins;
			}

			if(closeHours != '' && closeMins != ''){
				close = closeHours + ':' + closeMins;
			}

			if(!(open == 'closed' && close == 'closed')){

				// one or both has values

				if(open == 'closed'){
					$(inputs[0]).addClass('invalid');
					$(inputs[1]).addClass('invalid');
					invalid = true;
				}

				if(close == 'closed'){
					$(inputs[2]).addClass('invalid');
					$(inputs[3]).addClass('invalid');
					invalid = true;
				}

			}

			// both are closed

			openingHours[$(this).find('label').text()] = {
				open: open,
				close: close
			};

		});

		if(invalid){
			return 'invalid';
		}else{
			return openingHours;
		}

	}

	var addListingForm = new Form('/api/listings/add', [
			{ id: 'business_name', validation: '' },
			{ id: 'email', validation: 'email' },
			{ id: 'phone', validation: '' },
			{ id: 'website', validation: 'none' },
			{ id: 'line_one', validation: '' },
			{ id: 'line_two', validation: 'none' },
			{ id: 'town', validation: '' },
			{ id: 'postcode', validation: '' },
			// opening times
			{ id: 'industry', validation: '' },
			// services
			{ id: 'otherinfo', validation: 'none' },
			{ id: 'social_style', validation: 'none' },
			{ id: 'social_fb', validation: 'none' },
			{ id: 'social_tw', validation: 'none' },
			{ id: 'social_ig', validation: 'none' },
			{ id: 'social_gp', validation: 'none' },
			{ id: 'social_yt', validation: 'none' },
			{ id: 'social_li', validation: 'none' },
			{ id: 'social_pi', validation: 'none' },
			{ id: 'listing_color1', validation: 'none' },
			{ id: 'listing_color2', validation: 'none' },
			{ id: 'listing_color3', validation: 'none' }
		]);

	$('#addBtn').on('click', function(){

		// validateOpeningTimes
		var openTimes = checkOpendingHours();

		if(addListingForm.isValid() && openTimes != 'invalid'){

			var dataObj = {
				business_name: $('#' + addListingForm.fields[0].id).val(),
				contact: {
		        	website: $('#' + addListingForm.fields[3].id).val(),
		        	phone: $('#' + addListingForm.fields[2].id).val(),
		        	email: $('#' + addListingForm.fields[1].id).val()
		        },
		        address: {
		        	line_one: $('#' + addListingForm.fields[4].id).val(),
		        	line_two: $('#' + addListingForm.fields[5].id).val(),
		        	town: $('#' + addListingForm.fields[6].id).val(),
		        	post_code: $('#' + addListingForm.fields[7].id).val()
		        },
		        industry: $('#' + addListingForm.fields[8].id).val(),
		        services: getServices(),
		        description: JSON.stringify($('#' + addListingForm.fields[9].id).html()),
		        social: {
		        	style: $('#' + addListingForm.fields[10].id).data('style'),
		        	icons: {
		        		facebook: $('#' + addListingForm.fields[11].id).val(),
		        		twitter: $('#' + addListingForm.fields[12].id).val(),
		        		instagram: $('#' + addListingForm.fields[13].id).val(),
		        		googleplus: $('#' + addListingForm.fields[14].id).val(),
		        		youtube: $('#' + addListingForm.fields[15].id).val(),
		        		linkedin: $('#' + addListingForm.fields[16].id).val(),
		        		pinterest: $('#' + addListingForm.fields[17].id).val()
		        	}
			    },
			    branding: {
			    	logo: $('#listinglogo_box').children('img').attr('src'),
			    	background: $('#listingbg_box').children('img').attr('src'),
			    	primary_color: $('#' + addListingForm.fields[18].id).val(),
			    	secondary_color: $('#' + addListingForm.fields[19].id).val(),
			    	accent: $('#' + addListingForm.fields[20].id).val()
			    },
			    opening_hours: openTimes,
			    gallery: gallery
			};

			addListingForm.send(dataObj, function(data){
				
				addListingForm.resetForm();

				if(data.success){
					var msg = new Message(data.success, false, $('#msg'));
					msg.display(true);
				}else{
					var msg = new Message(data.responseJSON.error, true, $('#msg'));
					msg.display(true);
				}
			
			});

		}else{
			var msg = new Message(addListingForm.message, true, $('#msg'));
			msg.display(true);
		}

	});

	var updateListingForm = new Form('/api/listings/update', [
			{ id: 'business_name', validation: '' },
			{ id: 'email', validation: 'email' },
			{ id: 'phone', validation: '' },
			{ id: 'website', validation: 'none' },
			{ id: 'line_one', validation: '' },
			{ id: 'line_two', validation: 'none' },
			{ id: 'town', validation: '' },
			{ id: 'postcode', validation: '' },
			// opening times
			{ id: 'industry', validation: '' },
			// services
			{ id: 'otherinfo', validation: 'none' },
			{ id: 'social_style', validation: 'none' },
			{ id: 'social_fb', validation: 'none' },
			{ id: 'social_tw', validation: 'none' },
			{ id: 'social_ig', validation: 'none' },
			{ id: 'social_gp', validation: 'none' },
			{ id: 'social_yt', validation: 'none' },
			{ id: 'social_li', validation: 'none' },
			{ id: 'social_pi', validation: 'none' },
			{ id: 'listing_color1', validation: 'none' },
			{ id: 'listing_color2', validation: 'none' },
			{ id: 'listing_color3', validation: 'none' }
		]);

	$('#updateBtn').on('click', function(){

		var openTimes = checkOpendingHours();
		var listingid = $(this).data('listingid');

		if(updateListingForm.isValid() && openTimes != 'invalid'){
			var dataObj = {
				listingid: listingid,
				business_name: $('#' + updateListingForm.fields[0].id).val(),
				contact: {
		        	website: $('#' + updateListingForm.fields[3].id).val(),
		        	phone: $('#' + updateListingForm.fields[2].id).val(),
		        	email: $('#' + updateListingForm.fields[1].id).val()
		        },
		        address: {
		        	line_one: $('#' + updateListingForm.fields[4].id).val(),
		        	line_two: $('#' + updateListingForm.fields[5].id).val(),
		        	town: $('#' + updateListingForm.fields[6].id).val(),
		        	post_code: $('#' + updateListingForm.fields[7].id).val()
		        },
		        industry: $('#' + updateListingForm.fields[8].id).val(),
		        services: getServices(),
		        description: JSON.stringify($('#' + addListingForm.fields[9].id).html()),
		        social: {
		        	style: $('#' + updateListingForm.fields[10].id).data('style'),
		        	icons: {
		        		facebook: $('#' + updateListingForm.fields[11].id).val(),
		        		twitter: $('#' + updateListingForm.fields[12].id).val(),
		        		instagram: $('#' + updateListingForm.fields[13].id).val(),
		        		googleplus: $('#' + updateListingForm.fields[14].id).val(),
		        		youtube: $('#' + updateListingForm.fields[15].id).val(),
		        		linkedin: $('#' + updateListingForm.fields[16].id).val(),
		        		pinterest: $('#' + updateListingForm.fields[17].id).val()
		        	}
			    },
			    branding: {
			    	logo: $('#listinglogo_box').children('img').attr('src'),
			    	background: $('#listingbg_box').children('img').attr('src'),
			    	primary_color: $('#' + updateListingForm.fields[18].id).val(),
			    	secondary_color: $('#' + updateListingForm.fields[19].id).val(),
			    	accent: $('#' + updateListingForm.fields[20].id).val()
			    },
			    opening_hours: openTimes,
			    gallery: gallery
			};

			updateListingForm.send(dataObj, function(data){

				if(!data.responseJSON){
					var msg = new Message(data.success + ' <a href="/admin/listings">View All Listings</a>', false, $('#msg'));
					msg.display(true);
				}else{
					var msg = new Message(data.responseJSON.error, true, $('#msg'));
					msg.display(true);
				}
			
			});

		}else{
			var msg = new Message(updateListingForm.message, true, $('#msg'));
			msg.display(true);
		}

	});

}(PopUp, YeahAutocomplete, imageLibrary.ImageLibrary, form.form, YeahTextEditor));