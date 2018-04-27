(function(Form, utils){

	var checkBox = $('#cbox_new_password');
	var passwordLis = $('.passwordli');

	/* functions =====================================*/

	function getData(userId, fields){

		var data = {
			userId: userId,
			name: $('#' + fields[0].id).val(),
			email: $('#' + fields[1].id).val()
		};

		if(checkBox.prop('checked')){
			data.password = $('#' + fields[2].id).val()
		}

		return data;

	}

	/* Password checkbox =============================*/

	checkBox.on('change', function(){
		if($(this).prop('checked')){
			passwordLis.slideDown(400);
		}else{
			passwordLis.slideUp(400);
		}
	});

	/* Update ========================================*/

	var submitBtn = $('.side_submit');

	var form = new Form('/api/users/edit', [
			{ id: 'q_name', validation: '' },
			{ id: 'q_email', validation: 'email' },
			{ id: 'q_password', validation: 'none' },
			{ 
				id: 'q_password_confirm', 
				validation: function() {
						
					if($('#cbox_new_password').is(':checked')){
						if($('#q_password').val() == ''){
							form.message = 'Password is empty';
							return false;
						}
						if($('#q_password_confirm').val() == ''){
							form.message = 'Password is empty';
							return false;
						}
						if($('#q_password').val() != $('#q_password_confirm').val()){
							form.message = 'Passwords dont match';
							return false;
						}else{
							return true;
						}
					}else{
						return true;
					}
				
				}
			}
		]);
	var msgBox = new utils.Message();

	submitBtn.on('click', function(){

		if(form.isValid()){
			$(this).addClass('spinBtn');
			var data = getData($(this).data('userid'), form.fields);
			form.send(data, function(data){
				console.log(data);
				if(data.error){
					submitBtn.removeClass('spinBtn');
					return msgBox.display(data.error, true, true);
				}
				if(data.success){
					submitBtn.removeClass('spinBtn');
					return msgBox.display('Profile Updated', false, true);
				}
				msgBox.display('Profile Updated', false, true);
				submitBtn.removeClass('spinBtn');
			});
		}else{
			return msgBox.display('Missing or invalid fields', true, true);
		}

	});

})(form.form, utils);