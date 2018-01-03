(function(adminArea, Form){

	function Model(obj){
		
	}

	function View(){

	}

	function Users(Model, View){

		this.view = new View();
		this.model = new Model({});

		this.setUpForms();

		$('.changePassword').on('change', function(){
			if($(this).is(':checked')){
				$('#pwli_1').removeClass('hide');
				$('#pwli_2').removeClass('hide');
			}else{
				$('#pwli_1').addClass('hide');
				$('#pwli_2').addClass('hide');
			}
		});

	}

	Users.prototype.setUpForms = function() {
		
		var createUserForm = new Form('/api/users/add', [
				{
					id: 'q_name',
					validation: ''
				},
				{
					id: 'q_email',
					validation: 'email'
				},
				{
					id: 'q_password',
					validation: ''
				},
				{
					id: 'q_password_confirm',
					validation: 'password'
				},
				{
					id: 'q_user_role',
					validation: ''
				}
			]);

		var editUserForm = new Form('/api/users/edit', [
				{
					id: 'q_name',
					validation: ''
				},
				{
					id: 'q_email',
					validation: 'email'
				},
				{
					id: 'q_password',
					validation: 'none'
				},
				{
					id: 'q_password_confirm',
					validation: function() {
						
						if($('.changePassword').is(':checked')){

							if($('#q_password').val() == ''){
								editUserForm.message = 'Password is empty';
								return false;
							}

							if($('#q_password_confirm').val() == ''){
								editUserForm.message = 'Password is empty';
								return false;
							}

							if($('#q_password').val() != $('#q_password_confirm').val()){
								editUserForm.message = 'Passwords dont match';
								return false;
							}else{
								return true;
							}

						}else{
							return true;
						}
					
					}
				},
				{
					id: 'q_user_role',
					validation: ''
				}
			]);

		/*** events ***/

		var saveBtn = $('#save');
		var updateBtn = $('#update');

		saveBtn.on('click', function(){

			if(createUserForm.isValid()){

				// spin the button
				saveBtn.addClass('spinBtn');

				// send form
				createUserForm.send({
					name: $('#' + createUserForm.fields[0].id).val(),
	                email: $('#' + createUserForm.fields[1].id).val(),
	                password: $('#' + createUserForm.fields[2].id).val(),
	                confirm_password: $('#' + createUserForm.fields[3].id).val(),
	                user_role: $('#' + createUserForm.fields[4].id).val()
				}, function(data){

					if(data.success == 1){
						var msg = new Message('User Added', false, $('#msg'));
						msg.display(false);
						createUserForm.resetForm();
					}else{
						var msg = new Message(data.responseJSON.error, true, $('#msg'));
						msg.display(true);
					}

					saveBtn.removeClass('spinBtn');

				});
					// stop spinning

			}else{
				var msg = new Message(createUserForm.message, true, $('#msg'));
				msg.display(true);
			}

		});

		updateBtn.on('click', function(){

			var userId = $(this).data('userid');

			if(editUserForm.isValid()){

				// spin the button
				updateBtn.addClass('spinBtn');

				var updateObj = {
					userId: userId,
					name: $('#' + editUserForm.fields[0].id).val(),
	                email: $('#' + editUserForm.fields[1].id).val(),
	                user_role: $('#' + editUserForm.fields[4].id).val()
				};

				if($('.changePassword').is(':checked')){
					updateObj.password = $('#' + editUserForm.fields[2].id).val();
	                updateObj.confirm_password = $('#' + editUserForm.fields[3].id).val();
				}

				// console.log('UpdateObj ', updateObj);

				editUserForm.send(updateObj, function(data){

					if(data.success == 1){
						var msg = new Message('User Updated', false, $('#msg'));
						msg.display(false);
					}else{
						var msg = new Message(data.responseJSON.error, true, $('#msg'));
						msg.display(true);
					}

					updateBtn.removeClass('spinBtn');

				});

			}else{
				var msg = new Message(editUserForm.message, true, $('#msg'));
				msg.display(true);
			}
		});
		
	};

	Users.prototype.updateModelFromView = function(ideaBoxes) {
		
	};

	var users = new Users(Model, View);

})(adminArea, form.form);