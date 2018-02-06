(function(PopUp, ImageLibrary){

	function closeSide() {
		$('#editSide').hide();
		$('body').css('margin-left', '0px');
	}

	function getGallery() {
		var arr = [];
		$('.gallery li img').each(function(){
			arr.push($(this).attr('src'));
		});
		return arr;
	}

	function createInput(label, id, type, value, classes = ''){

		var inputBox = $('<div>', {"class": "inputBox"});
		inputBox.append(`
				<label>${label}</label>
				<input type="${type}" value="${value}" class="${classes}" id="${id}">
			`);

		return inputBox;

	}

	function createTimeInputs(day, openId, closeId, openTimes, closeTimes){

		var inputBox = $('<div>', {"class": "inputBox"});
		inputBox.append(`
				<label>${day}</label>
				<input type="time" value="${openTimes}" id="${openId}">
				<span> - </span>
				<input type="time" value="${closeTimes}" id="${closeId}">
			`);

		return inputBox;

	}

	// function update(jscolor) {
	//     // 'jscolor' instance can be used as a string
	//     document.getElementsByTagName('h1').style.backgroundColor = '#' + jscolor;
	// }

	function Listing(){

		thislisting = this;
		
		this.listingid = $('#page-listing').data('listingid');
		this.side = $('#editSide');
		this.socialStyleClass = $('.social').data('style');
		this.currentImgInput = '';

		this.aPhone = $('[data-field="contact"] a')[0];
		this.aEmail = $('[data-field="contact"] a')[1];
		this.aWebsite = $('[data-field="contact"] a')[2];

		this.addressLineOne = $('address .lineone');
		this.addressLineTwo = $('address .linetwo');
		this.addressTown = $('address .town');
		this.addressPostcode = $('address .postcode');

		var imgLib = new ImageLibrary($('#image_library_modal'));

		/*** events ***/

		$('#edit-listing').on('click', function(){
			if($(this).hasClass('edit-mode')){
				$(this).removeClass('edit-mode');
				$('.editable').removeClass('edit-on');
				closeSide();
				$('.colorInputs').hide();
				$('.edit-tool').remove();
			}else{
				$(this).addClass('edit-mode');
				$('.editable').addClass('edit-on');
				$('.edit-on').append('<div class="edit-tool"></div>');
			}
		});

		$('body').on('click', '.edit-tool', function(){

			closeSide();
			$('.colorInputs').hide();

			switch($(this).parent().data('field')){

				case 'business_name':

					$(this).parent().attr('contenteditable', true);
					$(this).parent().focus();

					break;
				case 'social':

					var style = $('.social').data('style');

					var socialStyleSelect = `<label>Icon Style</label><div class="fakeInput ${style}" id="social_style" data-style="${style}"></div>
							<ul class="list">
								<li data-style="standard"><label>Standard</label><div class="a_social_style standard"></div></li>
								<li data-style="black"><label>Black</label><div class="a_social_style black"></div></li>
								<li data-style="nocircle"><label>No Circle</label><div class="a_social_style nocircle"></div></li>
								<li data-style="blacknocircle"><label>Black No Circle</label><div class="a_social_style blacknocircle"></div></li>
								<li data-style="whitenocircle"><label>White No Circle</label><div class="a_social_style whitenocircle"></div></li>
							</ul>`;

					thislisting.loadSideEditor('Edit Social Links', [
							createInput('Facebook', 'slink_fb', 'text', $('.fb').attr('href') || ''),
							createInput('Twitter', 'slink_tw', 'text', $('.tw').attr('href') || ''),
							createInput('Instagram', 'slink_ig', 'text', $('.ig').attr('href') || ''),
							createInput('Google Plus', 'slink_gp', 'text', $('.gp').attr('href') || ''),
							createInput('YouTube', 'slink_yt', 'text', $('.yt').attr('href') || ''),
							createInput('Linked In', 'slink_in', 'text', $('.li').attr('href') || ''),
							createInput('Pinterest', 'slink_pi', 'text', $('.pi').attr('href') || ''),
							socialStyleSelect
						], 'social');

					break;
				case 'contact':

					thislisting.loadSideEditor('Edit Contact Information', [
							createInput('Phone', 'q_phone', 'text', thislisting.aPhone.text || ''),
							createInput('Email', 'q_email', 'text', thislisting.aEmail.text || ''),
							createInput('Website', 'q_website', 'text', thislisting.aWebsite.text || '')
						], 'contact');

					break;
				case 'address':

					thislisting.loadSideEditor('Edit Address', [
							createInput('Line One', 'q_lineone', 'text', $(thislisting.addressLineOne[0]).text() || ''),
							createInput('Line Two', 'q_linetwo', 'text', $(thislisting.addressLineTwo[0]).text() || ''),
							createInput('Town', 'q_town', 'text', $(thislisting.addressTown[0]).text() || ''),
							createInput('Postcode', 'q_postcode', 'text', $(thislisting.addressPostcode[0]).text() || '')
						], 'address');

					break;
				case 'logo':

					imgLib.openLibrary(this, function(img){

						var bgProp = $('.theListing-bg').css("background-image");

						thislisting.updateFromEditor($(this), {
							listingid: thislisting.listingid,
							branding: {
								background: bgProp.substring(bgProp.indexOf('"')+1,bgProp.lastIndexOf('"')),
								logo: '/static/uploads/' + img,
								primary_color: $('#q_color1').val(),
						    	secondary_color: $('#q_color2').val(),
						    	accent: $('#q_color3').val()
							}
						}, function(listing){
							$('.theListing-logo img').attr('src', listing.branding.logo);							
						});						

					});

					break;
				case 'background':

					imgLib.openLibrary(this, function(img){

						thislisting.updateFromEditor($(this), {
							listingid: thislisting.listingid,
							branding: {
								background: '/static/uploads/' + img,
								logo: $('.theListing-logo img').attr('src'),
								primary_color: $('#q_color1').val(),
						    	secondary_color: $('#q_color2').val(),
						    	accent: $('#q_color3').val()
							}
						}, function(listing){
							$('.theListing-bg').css('background', 'linear-gradient(#0000, #'+listing.branding.secondary_color+'), url(' + listing.branding.background + ')');
							$('.theListing-bg').css('background-repeat', 'no-repeat');	
							$('.theListing-bg').css('background-position', '50%');
							$('.theListing-bg').css('background-size', '100%');								
						});						

					});

					break;
				case 'opening_hours':

					var times = $('.times');

					thislisting.loadSideEditor('Edit Opening Times', [
							createTimeInputs('Monday', 'q_mo_op', 'q_mo_cl', $(times[0]).text(), $(times[1]).text()),
							createTimeInputs('Tuesday', 'q_tu_op', 'q_tu_cl', $(times[2]).text(), $(times[3]).text()),
							createTimeInputs('Wednesday', 'q_we_op', 'q_we_cl', $(times[4]).text(), $(times[5]).text()),
							createTimeInputs('Thursday', 'q_th_op', 'q_th_cl', $(times[6]).text(), $(times[7]).text()),
							createTimeInputs('Friday', 'q_fr_op', 'q_fr_cl', $(times[8]).text(), $(times[9]).text()),
							createTimeInputs('Saturday', 'q_sa_op', 'q_sa_cl', $(times[10]).text(), $(times[11]).text()),
							createTimeInputs('Sunday', 'q_su_op', 'q_su_cl', $(times[12]).text(), $(times[13]).text())
						], 'opening_hours');

					break;
				case 'gallery':

					imgLib.openLibrary(this, function(img){

						$('.gallery').append('<li><img src="/static/uploads/' + img + '"></li>');
						$('.galleryBox .edit-tool').addClass('.editSpin');

						thislisting.updateFromEditor($(this), {
							listingid: thislisting.listingid,
							gallery: getGallery()
						}, function(listing){
							console.log(listing);
							$('.gallery').empty();
							for(i=0; i<listing.gallery.length; i++){
								$('.gallery').append('<li><img src="' + listing.gallery[i] + '"></li>');
							}
							$('.galleryBox .edit-tool').removeClass('.editSpin');
						});						

					});

					break;
				case 'colors':

					$('.colors div').show();

					// thislisting.loadSideEditor('Profile Colours', [
					// 		createInput('Primary Colour', 'q_color1', 'text', 'fff', "jscolor {onFineChange:'update(this)'}"),
					// 		createInput('Line Two', 'q_color2', 'text', '0f0', 'jscolor'),
					// 		createInput('Town', 'q_color3', 'text', '357', 'jscolor')
					// 	], 'colors');

					// window.jscolor.installByClassName('jscolor');

					break;
				default:

			}				

		});

		$('.editable').on('blur', function(){

			var editable = $(this);

			switch($(this).data('field')){

				case 'business_name':

					editable.attr('contenteditable', false);
					editable.addClass('editSpin');

					thislisting.updateListing({
						listingid: thislisting.listingid,
						business_name: editable.text()
					}, function(listing){
						editable.removeClass('editSpin');
					});

					break;
				default:

			}				

		});

		$('#editSide').on('click', '#social_style', function(){

			if($(this).hasClass('open')){
				$(this).removeClass('open');	
			}else{
				$(this).addClass('open');
			}

		});

		$('#editSide').on('click', '#social_style + ul li', function(){

			$('ul.social').removeClass(thislisting.socialStyleClass);
			$('#social_style').removeClass(thislisting.socialStyleClass);

			$('ul.social').addClass($(this).data('style'));
			$('#social_style').addClass($(this).data('style'));

			thislisting.socialStyleClass = $(this).data('style');

		});

		$('body').on('click', '.edit-on .gallery li', function(){

			$('.galleryBox').addClass('spinBtn');
			$(this).remove();

			thislisting.updateListing({
				listingid: thislisting.listingid,
				gallery: getGallery()
			}, function(listing){
				$('.gallery').empty();
				for(i=0; i<listing.gallery.length; i++){
					$('.gallery').append('<li><img src="' + listing.gallery[i] + '"></li>');
				}
				$('.galleryBox').removeClass('spinBtn');
			});
		
		});

		// $('body').on('click', function(e){
		// 		if($(e.target).closest('.colors').length == 0){
		// 		$('.colorInputs').hide();
		// 	}
		// });

		$('body').on('click', '#update', function(){

			switch($(this).data('editing')){

				case 'social':

					thislisting.updateFromEditor($(this), {
						listingid: thislisting.listingid,
						social: {
							style: thislisting.socialStyleClass,
							icons: {
								facebook: $('#slink_fb').val(),
								twitter: $('#slink_tw').val(),
								instagram: $('#slink_ig').val(),
								googleplus: $('#slink_gp').val(),
								youtube: $('#slink_yt').val(),
								linkedin: $('#slink_in').val(),
								pinterest: $('#slink_pi').val()
							}
						}
					}, function(listing){

						$('ul.social').removeClass(thislisting.socialStyleClass);
						$('ul.social').addClass(thislisting.socialStyleClass);

						var social = $('.social');
						social.empty();

						if(listing.social.icons.facebook)
							social.append('<li><a class="fb" href="' + listing.social.icons.facebook + '"></a></li>');

						if(listing.social.icons.twitter)
							social.append('<li><a class="tw" href="' + listing.social.icons.twitter + '"></a></li>');
						
						if(listing.social.icons.instagram)
							social.append('<li><a class="ig" href="' + listing.social.icons.instagram + '"></a></li>');

						if(listing.social.icons.googleplus)
							social.append('<li><a class="gp" href="' + listing.social.icons.googleplus + '"></a></li>');

						if(listing.social.icons.youtube)
							social.append('<li><a class="yt" href="' + listing.social.icons.youtube + '"></a></li>');

						if(listing.social.icons.linkedin)
							social.append('<li><a class="li" href="' + listing.social.icons.linkedin + '"></a></li>');

						if(listing.social.icons.pinterest)
							social.append('<li><a class="pi" href="' + listing.social.icons.pinterest + '"></a></li>');

					});

					break;
				case 'contact':

					thislisting.updateFromEditor($(this), {
						listingid: thislisting.listingid,
						contact: {
							phone: $('#q_phone').val(),
							email: $('#q_email').val(),
							website: $('#q_website').val()
						}
					}, function(listing){
						$(thislisting.aPhone).text(listing.contact.phone);
						$(thislisting.aEmail).text(listing.contact.email);
						$(thislisting.aWebsite).text(listing.contact.website);
						$('.theListing-phone').attr('href', 'tel:' + listing.contact.phone)
						$('.theListing-phone').text(listing.contact.phone);
					});

					break;
				case 'address':

					thislisting.updateFromEditor($(this), {
						listingid: thislisting.listingid,
						address: {
							line_one: $('#q_lineone').val(),
							line_two: $('#q_linetwo').val(),
							town: $('#q_town').val(),
							post_code: $('#q_postcode').val()
						}
					}, function(listing){
						thislisting.addressLineOne.text(listing.address.line_one);
						thislisting.addressLineTwo.text(listing.address.line_two);
						thislisting.addressTown.text(listing.address.town);
						thislisting.addressPostcode.text(listing.address.post_code);
					});

					break;
				case 'opening_hours':

					thislisting.updateFromEditor($(this), {
						listingid: thislisting.listingid,
						opening_hours: {
							Monday: {
								open: $('#q_mo_op').val(),
								close: $('#q_mo_cl').val()
							},
							Tuesday: {
								open: $('#q_tu_op').val(),
								close: $('#q_tu_cl').val()
							},
							Wednesday: {
								open: $('#q_we_op').val(),
								close: $('#q_we_cl').val()
							},
							Thursday: {
								open: $('#q_th_op').val(),
								close: $('#q_th_cl').val()
							},
							Friday: {
								open: $('#q_fr_op').val(),
								close: $('#q_fr_cl').val()
							},
							Saturday: {
								open: $('#q_sa_op').val(),
								close: $('#q_sa_cl').val()
							},
							Sunday: {
								open: $('#q_su_op').val(),
								close: $('#q_su_cl').val()
							}
						}
					}, function(listing){

						var times = $('.times');
						$(times[0]).text(listing.opening_hours.monday.open);
						$(times[1]).text(listing.opening_hours.monday.close);
						$(times[2]).text(listing.opening_hours.tuesday.open);
						$(times[3]).text(listing.opening_hours.tuesday.close);
						$(times[4]).text(listing.opening_hours.wednesday.open);
						$(times[5]).text(listing.opening_hours.wednesday.close);
						$(times[6]).text(listing.opening_hours.thursday.open);
						$(times[7]).text(listing.opening_hours.thursday.close);
						$(times[8]).text(listing.opening_hours.friday.open);
						$(times[9]).text(listing.opening_hours.friday.close);
						$(times[10]).text(listing.opening_hours.saturday.open);
						$(times[11]).text(listing.opening_hours.saturday.close);
						$(times[12]).text(listing.opening_hours.sunday.open);
						$(times[13]).text(listing.opening_hours.sunday.close);

					});

					break;
				case 'colors':

					var bgProp = $('.theListing-bg').css("background-image");

					thislisting.updateFromEditor($(this), {
						listingid: thislisting.listingid,
						branding: {
							background: bgProp.substring(bgProp.indexOf('"')+1,bgProp.lastIndexOf('"')),
							logo: $('.theListing-logo img').attr('src'),
							primary_color: $('#q_color1').val(),
					    	secondary_color: $('#q_color2').val(),
					    	accent: $('#q_color3').val()
						}
					}, function(listing){
						$('.colorInputs').hide();
					});

					break;
				default:

			}

		});

	}

	Listing.prototype.updateListing = function(data, callback){

		$.ajax({
			url: '/api/listings/update',
			method: 'POST',
			data: data,
			success: function(data){
				if(!data.error){
					var msg = new Message(data.success, false, $('#yeahMsg'));
					msg.display(false);
					thislisting.side.hide();
					$('body').css('margin-left', '0px');
				}else{
					doError(data.error);
				}
				callback(data.listing || 0);
			},
			error: function(a, b, c){
				callback();
			}
		});

	}

	Listing.prototype.loadSideEditor = function(heading, fields, editing){

		this.side.empty();
		this.side.append('<h2>' + heading + '</h2>');

		for(i=0;i<fields.length;i++){
			this.side.append(fields[i]);	
		}

		this.side.append('<button id="update" data-editing="' + editing + '">Update</button>');
		this.side.show();
		$('body').css('margin-left', '300px');

	}

	Listing.prototype.updateFromEditor = function(btn, data, callback){

		var updateBtn = $(btn);
		updateBtn.addClass('btnSpin');

		this.updateListing(data, function(listing){
			callback(listing);
			updateBtn.removeClass('btnSpin');
		});

	}

	var listing = new Listing();

}(PopUp, imageLibrary.ImageLibrary));