(function(YeahAutocomplete, ImageLibrary, Form, formArray){

	/* VARS & FUNCS ===========================================*/

	var form = new Form('/api/listings/add', formArray.formArray);

	var Model = {
		business_name: $('#' + form.fields[0].id).val(),
		industry: 'unset',
		services: [],
		update: function(){
			this.business_name = $('#' + form.fields[0].id).val()
		}
	};
		
	var View = {
		save_btn: $('#save'),
		checkBox: $('#terms_check'),
		addBtn: $('#addBtn'),
		services_input: $('#q_services'),
		services_add: $('#q_services + .btn'),
		services_list: $('#services'),
		addService: function(service){
			this.services_list.append(`
				<li>
					<span>${service}</span>
					<div class="icon icon-cross"></div>
				</li>
			`);
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
	    property: 'name'
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

	

	/* SERVICES ==============================================*/

	View.services_add.on('click', function(){
		var service = View.services_input.val();
		if(!service){
			return;
		}
		Model.services.push(service);
		View.addService(service);
	});

	View.services_list.on('click', '.icon-cross', function(){
		Model.services.splice($(this).parent().index(), 1);
		$(this).parent().remove();
		console.log(Model);
	});
 
	/* GALLERY ===============================================*/

	

	/* SENDING ===============================================*/

	function getData(){
		Model.update();
		return {
			business_name: Model.business_name
		};
	}

	View.save_btn.on('click', function(){
		if(form.isValid()){
			$(this).addClass('spinBtn');
			form.send(getData, function(data){
				console.log(data);
			});
		}
	});

})(YeahAutocomplete, imageLibrary.ImageLibrary, form.form, formArray);