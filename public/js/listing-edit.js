(function(){

	var thislisting = this;
	var listingid = $('#page-listing').data('listingid');
	var side = $('#editSide');
	var socialStyleClass = $('.social').data('style');

	function updateListing(data, callback){

		$.ajax({
			url: '/api/listings/update',
			method: 'POST',
			data: data,
			success: function(data){
				if(!data.error){
					var msg = new Message(data.success, false, $('#yeahMsg'));
					msg.display(false);
					side.hide();
					$('body').css('margin-left', '0px');
				}else{
					doError(data.error);
				}
				callback();
			},
			error: function(a, b, c){
				callback();
			}
		});

	}

	function createInput(label, id, type, value){

		var inputBox = $('<div>', {"class": "inputBox"});
		inputBox.append(`
				<label>${label}</label>
				<input type="${type}" value="${value}" id="${id}">
			`);

		return inputBox;

	}

	function Listing(){

		/*** events ***/

		$('#edit-listing').on('click', function(){
			if($(this).hasClass('edit-mode')){
				$(this).removeClass('edit-mode');
				$('.editable').removeClass('edit-on');
				side.hide();
				$('body').css('margin-left', '0px');
			}else{
				$(this).addClass('edit-mode');
				$('.editable').addClass('edit-on');
			}
		});

		$('.editable').on('click', function(){

			switch($(this).data('field')){

				case 'business_name':

					$(this).attr('contenteditable', true);

					break;
				case 'social':

					side.empty();

					side.append('<h2>Edit Social Links</h2>');

					side.append(createInput('Facebook', 'slink_fb', 'text', $('.fb').attr('href') || ''));
					side.append(createInput('Twitter', 'slink_tw', 'text', $('.tw').attr('href') || ''));
					side.append(createInput('Instagram', 'slink_ig', 'text', $('.ig').attr('href') || ''));
					side.append(createInput('Google Plus', 'slink_gp', 'text', $('.gp').attr('href') || ''));
					side.append(createInput('YouTube', 'slink_yt', 'text', $('.yt').attr('href') || ''));
					side.append(createInput('Linked In', 'slink_in', 'text', $('.li').attr('href') || ''));
					side.append(createInput('Pinterest', 'slink_pi', 'text', $('.pi').attr('href') || ''));

					var style = $('.social').data('style');

					side.append(`
							<label>Icon Style</label>
							<div class="fakeInput ${style}" id="social_style" data-style="${style}">
							</div>
							<ul class="list">
								<li data-style="standard">
									<label>Standard</label>
									<div class="a_social_style standard"></div>
								</li>
								<li data-style="black">
									<label>Black</label>
									<div class="a_social_style black"></div>
								</li>
								<li data-style="nocircle">
									<label>No Circle</label>
									<div class="a_social_style nocircle"></div>
								</li>
								<li data-style="blacknocircle">
									<label>Black No Circle</label>
									<div class="a_social_style blacknocircle"></div>
								</li>
								<li data-style="whitenocircle">
									<label>White No Circle</label>
									<div class="a_social_style whitenocircle"></div>
								</li>
							</ul>
						`);

					side.append('<button id="updateSocial">Update</button>');

					side.show();
					$('body').css('margin-left', '300px');

					break;
				case 'contact':



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

					updateListing({
						listingid: listingid,
						business_name: editable.text()
					}, function(){
						editable.removeClass('editSpin');
					});

					break;
				case 'social':

					//  $(this).removeClass('edit-social');

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

			$('ul.social').removeClass(socialStyleClass);
			$('#social_style').removeClass(socialStyleClass);

			$('ul.social').addClass($(this).data('style'));
			$('#social_style').addClass($(this).data('style'));

			socialStyleClass = $(this).data('style');

		});

		$('#editSide').on('click', '#updateSocial', function(){

			var updateBtn = $(this);
			updateBtn.addClass('btnSpin');

			updateListing({
				listingid: listingid,
				social: {
					style: socialStyleClass,
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
			}, function(){

				updateBtn.removeClass('btnSpin');

				$('ul.social').removeClass(socialStyleClass);
				$('ul.social').addClass(socialStyleClass);

				var social = $('.social');
				social.empty();

				var fb = $('#slink_fb').val();
				var tw = $('#slink_tw').val();
				var ig = $('#slink_ig').val();
				var gp = $('#slink_gp').val();
				var yt = $('#slink_yt').val();
				var li = $('#slink_in').val();
				var pin = $('#slink_pi').val();

				if(fb)
					social.append('<li><a class="fb" href="' + fb + '"></a></li>');

				if(tw)
					social.append('<li><a class="tw" href="' + tw + '"></a></li>');
				
				if(ig)
					social.append('<li><a class="ig" href="' + ig + '"></a></li>');

				if(gp)
					social.append('<li><a class="gp" href="' + gp + '"></a></li>');

				if(yt)
					social.append('<li><a class="yt" href="' + yt + '"></a></li>');

				if(li)
					social.append('<li><a class="li" href="' + li + '"></a></li>');

				if(pin)
					social.append('<li><a class="pi" href="' + pin + '"></a></li>');

				console.log(4);

			});

		});

	}

	var listing = new Listing();

}());