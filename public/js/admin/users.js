(function(PopUp){

	$.urlParam = function (name) {
	    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
	                      .exec(window.location.href);

	    if(results)
	    	return results[1] || 0;
	}

	function Model(obj){
		
	}

	Model.prototype.deleteUser = function(userId, callback){

		var getUrl = '/api/users';
		var page = $.urlParam('page');

		if(page){
			getUrl = getUrl + '?page=' + page;
		}

		$.ajax({
			url: '/api/users/' + userId,
			method: 'DELETE',
			success: function(data){

				console.log(data);

				if(data.success){

					$.ajax({
						url: getUrl, // + userId,
						method: 'GET',
						success: function(data){

							// console.log(data);

							if(data.users){
								callback({success: 'User Removed', users: data.users});
							}else{
								callback({error: data.error || 'Something went wrong'});
							}

						},
						error: function(xhr, desc, err){
							callback({error: xhr.responseJSON.error || 'Something went wrong'});
						}
					});

				}else{
					callback({error: data.error || 'Something went wrong'});
				}
			},
			error: function(xhr, desc, err){
				callback({error: xhr.responseJSON.error || 'Something went wrong'});
			}
		});

	};

	function View(){
		
	}

	View.prototype.refreshUsers = function(users){

		var table = $('table');

		table.find("tr:gt(0)").remove();

		for(i=0; i<users.length; i++){
			var row = '';
			row += '<tr>';
				row += '<td>' + users[i].name + '</td>';
				row += '<td>' + users[i].user_role + '</td>';
				row += '<td>';
					row += '<a class="edit" href="/admin/users/edit/' + users[i]._id + '"></a>';
					row += '<span class="delete" data-userid="' + users[i]._id + '"></span>';
				row += '</td>';
			row += '</tr>';
			table.append(row);
		}

	};

	function Users(Model, View){

		this.view = new View();
		this.model = new Model({});

		var thisUsers = this;

		/*** events ***/

		$('table').on('click', '.delete', function(){

			var userId = $(this).data('userid');

			var areYouSure = new PopUp(
					function(){
						
						$('.c_modal').addClass('.spinBtn');

						thisUsers.model.deleteUser(userId, function(response){
							if(response.error){
								var msg = new Message(response.error, true, $('#msg'));
								msg.display(false);
							}else{
								var msg = new Message(response.success, false, $('#msg'));
								msg.display(false);
								thisUsers.view.refreshUsers(response.users);
							}
							$('.c_modal').removeClass('.spinBtn');
							areYouSure.popDown();
						});

					},
					function(){
						areYouSure.popDown();
					}
				);

			areYouSure.popUp('Are you sure you want to delete this user?');

		});

	}

	Users.prototype.updateModelFromView = function(ideaBoxes) {
		
	};

	var users = new Users(Model, View);

}(PopUp));