(function(Form, YeahTextEditor){

	var txtEditor = new YeahTextEditor();

	var form = new Form('/api/settings/emails', [
			{ id: 'q_email', validation: '' },
			{ id: 'q_password', validation: '' }
		]);

	var updateBtn = $('#updateBtn');
	var msgBox = new utils.Message();

	updateBtn.on('click', function(){
		if(form.isValid()){
			$(this).addClass('spinBtn');
			var data = {
				email: $('#' + form.fields[0].id).val(),
				password: $('#' + form.fields[1].id).val(),
				registered: {
					message: $('#q_email1_msg').html(),
					active: $('#registered_active').is(':checked')
				},
				reviewed: {
					message: $('#q_email2_msg').html(),
					active: $('#review_active').is(':checked')
				},
				posreview: {
					message: $('#q_email3_msg').html(),
					active: $('#posrev_active').is(':checked')
				},
				negreview: {
					message: $('#q_email4_msg').html(),
					active: $('#negrev_active').is(':checked')
				}
			};
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

})(form.form, YeahTextEditor);