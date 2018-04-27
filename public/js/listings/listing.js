(function(YeahAutocomplete, ImageLibrary, Form, listingModel, utils){

	/* VARS & FUNCS ===========================================*/

	var form = new Form('/api/listings/add', listingModel.formArray);
	var formUpdate = new Form('/api/listings/update', listingModel.formArray);
	var msgBox = new utils.Message();
	var currentImgInput;

	var Model = listingModel.getModel(form);
		
	var View = {
		save_btn: $('#addBtn'),
		update_btn: $('#edit-listing-btn'),
		checkBox: $('#terms_check'),
		addBtn: $('#addBtn'),
		services_input: $('#q_services'),
		services_add: $('#q_services + .btn'),
		services_list: $('#services'),
		gallery_list: $('#gallery'),
		addService: function(service){
			this.services_list.append(`
				<li>
					<span>${service}</span>
					<i class="fa fa-times"></i>
				</li>
			`);
		},
		updateGallery: function(){
			console.log(Model.gallery);
			this.gallery_list.empty();
			for(i=0; i<Model.gallery.length; i++){
				this.gallery_list.append(`
					<li>
						<img src="${Model.gallery[i]}">
					</li>
				`);
			}
		}
	};

	/* CONFIRM ===============================================*/

	View.checkBox.on('change', function(){
		if(View.checkBox.prop('checked')){
			View.addBtn.prop('disabled', false);
		}else{
			View.addBtn.prop('disabled', true);
		}
	});

	/* AUTOCOMPLETE ==========================================*/

	// industry
	var industryAutocomplete = new YeahAutocomplete({
	    input: 'q_industry',
	    allowFreeType: true,
	    dataUrl: '/api/industries/search?term=',
	    method: 'GET',
	    arrName: 'results',
	    property: '',
		alter_results: function(result){
			var related = '';
			for(i=0; i<result.aliases.length; i++){
				related += result.aliases[i];
				if(i != result.aliases.length - 1){ related += ', ' }
			}
			return result.name + ' <i>' + related + '</i>';
		}
	});

	$('#q_industry').on('resultSelected', function(){
		servicesAutocomplete.updateUrl('/api/industries/services/search?industry=' + $(this).val() + '&term=');
	});

	// town
	var townAutocomplete = new YeahAutocomplete({
	    input: 'q_town',
	    allowFreeType: true,
	    dataUrl: '/api/towns/search?term=',
	    method: 'GET',
	    arrName: 'towns',
	    property: ''
	});

	// services
	var servicesAutocomplete = new YeahAutocomplete({
		input: 'q_services',
		allowFreeType: true,
		dataUrl: '/api/industries/services/search?industry=' + Model.industry + '&term=',
		method: 'GET',
		arrName: 'results',
		property: ''
	});

	/* IMAGE LIBRARY =========================================*/

	var imgLib = new ImageLibrary($('#image_library_modal'));

	$('#logo_upload').on('click', function(){
		currentImgInput = this;
		imgLib.openLibrary(this);
	});

	$('#bg_upload').on('click', function(){
		currentImgInput = this;
		imgLib.openLibrary(this);
	});

	$('#addGalleryImgBtn').on('click', function(){
		currentImgInput = 'gallery';
		imgLib.openLibrary(this);
	});

	imgLib.onSelectImage(function(yeah){
		if(currentImgInput == 'gallery'){
			Model.gallery.push('/static/uploads/' + yeah);
			View.updateGallery();
		}else{
			$(currentImgInput).find('img').attr('src', '/static/uploads/' + yeah);
		}
	});

	/* SERVICES ==============================================*/

	View.services_add.on('click', function(){
		var service = View.services_input.val();
		if(!service){
			return;
		}
		Model.services.push(service);
		View.addService(service);
		View.services_input.val('');
	});

	View.services_list.on('click', 'i', function(){
		Model.services.splice($(this).parent().index(), 1);
		$(this).parent().remove();
	});
 
	/* GALLERY ===============================================*/

	$('#gallery').on('click', 'li', function(){
		Model.gallery.splice($(this).index(), 1);
		View.updateGallery();
	});

	/* SENDING ===============================================*/

	View.save_btn.on('click', function(){
		if(form.isValid()){
			$(this).addClass('spinBtn');
			Model = listingModel.getModel(form);
			form.send(Model, function(data){
				if(data.error){
					View.save_btn.removeClass('spinBtn');
					return msgBox.display(data.error, true, true);
				}
				if(data.success){
					View.save_btn.removeClass('spinBtn');
					return msgBox.display(data.success, false, true);
				}
				msgBox.display('Listing Created', false, true);
				View.save_btn.removeClass('spinBtn');

			});
		}else{
			return msgBox.display('Missing or invalid fields', true, true);
		}
	});

	View.update_btn.on('click', function(){
		if(formUpdate.isValid()){
			var btn = $(this);
			$(this).addClass('spinBtn');
			Model = listingModel.getModel(form);
			Model.listingid = $(this).data('listingid');
			formUpdate.send(Model, function(data){
				if(data.error){
					btn.removeClass('spinBtn');
					return msgBox.display(data.error, true, true);
				}
				if(data.success){
					btn.removeClass('spinBtn');
					return msgBox.display(data.success, false, true);
				}
				msgBox.display('Listing Created', false, true);
				btn.removeClass('spinBtn');
			});
		}else{
			return msgBox.display('Missing or invalid fields', true, true);
		}
	});

	// var side = $('.theside');

	// window.scroll(function(){
	// 	console.log('dfsdv');
	// });

})(YeahAutocomplete, imageLibrary.ImageLibrary, form.form, listingModel, utils);