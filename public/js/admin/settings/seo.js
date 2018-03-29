(function(Form, utils){

	var form = new Form('/api/settings/seo', [
		{ id: 'q_home_title', validation: '' },
		{ id: 'q_home_meta', validation: '' },
		{ id: 'q_listing_title', validation: '' },
		{ id: 'q_listing_meta', validation: '' },
		{ id: 'q_blog_title', validation: '' },
		{ id: 'q_blog_meta', validation: '' },
		{ id: 'q_post_title', validation: '' },
		{ id: 'q_post_meta', validation: '' },
		{ id: 'q_default_title', validation: '' },
		{ id: 'q_default_meta', validation: '' }
	]);

	var updateBtn = $('#updateBtn');
	var msgBox = new utils.Message();

	updateBtn.on('click', function(){
		if(form.isValid()){
			$(this).addClass('spinBtn');
			var data = form.buildSimpleFormData();
			console.log(data);
			form.send(data, function(data){
				if(data.error){
					updateBtn.removeClass('spinBtn');
					return msgBox.display(data.error, true, true);
				}
				if(data.success){
					updateBtn.removeClass('spinBtn');
					return msgBox.display(data.success, false, true);
				}
				msgBox.display('SEO Settings Updated', false, true);
				updateBtn.removeClass('spinBtn');
			});
		}else{
			return msgBox.display('Missing or invalid fields', true, true);
		}
	});	

})(form.form, utils);