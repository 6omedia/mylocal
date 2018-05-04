(function(YeahAutocomplete, Message){

	var msg = new Message();
	var pos1elem = $('#pos_one');
	var pos2elem = $('#pos_two');
	var pos3elem = $('#pos_three');
	var pos4elem = $('#pos_four');
	var pos5elem = $('#pos_five');
	var f1 = $('.f1');
	var f2 = $('.f2');
	var f3 = $('.f3');
	var f4 = $('.f4');
	var f5 = $('.f5');

	var featuredCats = {
		side: $('.featured_selection'),
		ind_1: {
			name: pos1elem.val(),
			id: pos1elem.data('industryid')
		},
		ind_2: {
			name: pos2elem.val(),
			id: pos2elem.data('industryid')
		},
		ind_3: {
			name: pos3elem.val(),
			id: pos3elem.data('industryid')
		},
		ind_4: {
			name: pos4elem.val(),
			id: pos4elem.data('industryid')
		},
		ind_5: {
			name: pos5elem.val(),
			id: pos5elem.data('industryid')
		},
		setFeatured: function(callback) {

			var thisObj = this;

			var data = {
				pos1: featuredCats.ind_1,
				pos2: featuredCats.ind_2,
				pos3: featuredCats.ind_3,
				pos4: featuredCats.ind_4,
				pos5: featuredCats.ind_5
			};

			$.ajax({
				url: '/api/industries/set-featured',
				method: 'POST',
				data: data,
				success: function(data) {
					if(data.error){
						msg.display(data.error, true, true);
						return callback();
					}
					if(data.success){
						
						$.ajax({
							url: '/api/industries/featured',
							method: 'GET',
							success: function(data) {
								if(data.error){
									msg.display(data.error, true, true);
									return callback();
								}
								if(data.success){
									msg.display('featured categories updated', false, false);
									thisObj.update(data.featured);
									return callback();
								}
								msg.display('Something may have gone wrong', true, true);
								return callback();
							}
						});

					}
					msg.display('Something may have gone wrong', true, true);
					return callback();
				}
			});

		},
		update: function(featured) {

			// console.log(featured);

			this.ind_1.id = featured[0].id;
			this.ind_1.name = featured[0].name;
			this.ind_2.id = featured[1].id;
			this.ind_2.name = featured[1].name;
			this.ind_3.id = featured[2].id;
			this.ind_3.name = featured[2].name;
			this.ind_4.id = featured[3].id;
			this.ind_4.name = featured[3].name;
			this.ind_5.id = featured[4].id;
			this.ind_5.name = featured[4].name;

			pos1elem.val(featured[0].name);
			pos2elem.val(featured[1].name);
			pos3elem.val(featured[2].name);
			pos4elem.val(featured[3].name);
			pos5elem.val(featured[4].name);

			if(featured[0].name != ''){
				f1.addClass('fixedcat');
				f1.find('.selected').text(featured[0].name);
			}else{
				f1.removeClass('fixedcat');
				f1.find('.selected').text('Random');
			}
			if(featured[1].name != ''){
				f2.addClass('fixedcat');
				f2.find('.selected').text(featured[1].name);
			}else{
				f2.removeClass('fixedcat');
				f2.find('.selected').text('Random');
			}
			if(featured[2].name != ''){
				f3.addClass('fixedcat');
				f3.find('.selected').text(featured[2].name);
			}else{
				f3.removeClass('fixedcat');
				f3.find('.selected').text('Random');
			}
			if(featured[3].name != ''){
				f4.addClass('fixedcat');
				f4.find('.selected').text(featured[3].name);
			}else{
				f4.removeClass('fixedcat');
				f4.find('.selected').text('Random');
			}
			if(featured[4].name != ''){
				f5.addClass('fixedcat');
				f5.find('.selected').text(featured[4].name);
			}else{
				f5.removeClass('fixedcat');
				f5.find('.selected').text('Random');
			}

		}
	};

	function alter_results(result){
		var related = '';
		for(i=0; i<result.aliases.length; i++){
			related += result.aliases[i];
			if(i != result.aliases.length - 1){ related += ', ' }
		}
		return result.name + ' <i>' + related + '</i>';
	}

	var posOneAutocomplete = new YeahAutocomplete({
		input: 'pos_one',
		allowFreeType: false,
		dataUrl: '/api/industries/search?allow_featured=1&term=',
		method: 'GET',
		arrName: 'results',
		property: '',
		alter_results: alter_results
	});

	pos1elem.on('resultSelected', function(hmm, industry){
		featuredCats.ind_1.name = pos1elem.val();
		featuredCats.ind_1.id = industry._id;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	// pos1elem.on('blur', function(){
	// 	featuredCats.ind_1.name = pos1elem.val();
	// 	featuredCats.ind_1.id = industry._id;
	// 	featuredCats.side.addClass('spinBtn');
	// 	featuredCats.setFeatured(function(){
	// 		featuredCats.side.removeClass('spinBtn');
	// 	});
	// });

	var posTwoAutocomplete = new YeahAutocomplete({
		input: 'pos_two',
		allowFreeType: false,
		dataUrl: '/api/industries/search?allow_featured=1&term=',
		method: 'GET',
		arrName: 'results',
		property: '',
		alter_results: alter_results
	});

	pos2elem.on('resultSelected', function(hmm, industry){
		featuredCats.ind_2.name = pos2elem.val();
		featuredCats.ind_2.id = industry._id;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	var posThreeAutocomplete = new YeahAutocomplete({
		input: 'pos_three',
		allowFreeType: false,
		dataUrl: '/api/industries/search?allow_featured=1&term=' ,
		method: 'GET',
		arrName: 'results',
		property: '',
		alter_results: alter_results
	});

	pos3elem.on('resultSelected', function(hmm, industry){
		featuredCats.ind_3.name = pos3elem.val();
		featuredCats.ind_3.id = industry._id;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	var posFourAutocomplete = new YeahAutocomplete({
		input: 'pos_four',
		allowFreeType: false,
		dataUrl: '/api/industries/search?allow_featured=1&term=' ,
		method: 'GET',
		arrName: 'results',
		property: '',
		alter_results: alter_results
	});

	pos4elem.on('resultSelected', function(hmm, industry){
		featuredCats.ind_4.name = pos4elem.val();
		featuredCats.ind_4.id = industry._id;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	var posFiveAutocomplete = new YeahAutocomplete({
		input: 'pos_five',
		allowFreeType: false,
		dataUrl: '/api/industries/search?allow_featured=1&term=' ,
		method: 'GET',
		arrName: 'results',
		property: '',
		alter_results: alter_results
	});
	
	pos5elem.on('resultSelected', function(hmm, industry){
		featuredCats.ind_5.name = pos5elem.val();
		featuredCats.ind_5.id = industry._id;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	$('.f1.fixedcat').on('click', function(){
		pos1elem.val('');
		featuredCats.ind_1.name = pos1elem.val();
		featuredCats.ind_1.id = null;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	$('.f2.fixedcat').on('click', function(){
		pos1elem.val('');
		featuredCats.ind_2.name = pos1elem.val();
		featuredCats.ind_2.id = null;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	$('.f3.fixedcat').on('click', function(){
		pos1elem.val('');
		featuredCats.ind_3.name = pos1elem.val();
		featuredCats.ind_3.id = null;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	$('.f4.fixedcat').on('click', function(){
		pos1elem.val('');
		featuredCats.ind_4.name = pos1elem.val();
		featuredCats.ind_4.id = null;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	$('.f5.fixedcat').on('click', function(){
		pos1elem.val('');
		featuredCats.ind_5.name = pos1elem.val();
		featuredCats.ind_5.id = null;
		featuredCats.side.addClass('spinBtn');
		featuredCats.setFeatured(function(){
			featuredCats.side.removeClass('spinBtn');
		});
	});

	$('#save').on('click', function(){

		var thisBtn = $(this);
		thisBtn.addClass('spinBtn');

		featuredCats.setFeatured(function(){
			thisBtn.removeClass('spinBtn');
		});

	});

})(YeahAutocomplete, utils.Message);