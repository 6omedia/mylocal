(function(PopUp){

	$.urlParam = function (name) {
	    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
	                      .exec(window.location.href);

	    if(results)
	    	return results[1] || 0;
	}

	function deletePost(postId, callback){

		var getUrl = '/api/blog';
		var page = $.urlParam('page');

		if(page){
			getUrl = getUrl + '?page=' + page;
		}

		$.ajax({
			url: '/api/blog/' + postId,
			method: 'DELETE',
			success: function(data){

				console.log(data);

				if(data.success){

					$.ajax({
						url: getUrl, // + userId,
						method: 'GET',
						success: function(data){

							console.log(data);

							if(data.posts){
								callback({success: 'Post Removed', posts: data.posts, pagination: data.pagination});
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

	}

	function refreshPosts(posts){

		var table = $('table');

		table.find("tr:gt(0)").remove();

		for(i=0; i<posts.length; i++){

			var row = `
				<tr>
					<td>${posts[i].title}</td>
					<td>${posts[i].slug}</td>
					<td>
						<a class="view" href="/blog/${posts[i].slug}"></a>
						<a class="edit" href="/admin/blog/edit/${posts[i].slug}"></a>
						<span class="delete" data-postid="${posts[i]._id}"></span>
					</td>
				</tr>
			`;

			table.append(row);

		}

	}

	$('table').on('click', '.delete', function(){

		var postId = $(this).data('postid');

		var areYouSure = new PopUp(
				function(){
					
					$('.c_modal').addClass('.spinBtn');

					deletePost(postId, function(response){
						if(response.error){
							var msg = new Message(response.error, true, $('#msg'));
							msg.display(false);
						}else{
							var msg = new Message(response.success, false, $('#msg'));
							msg.display(false);
							refreshPosts(response.posts);
							$('.paginationDiv').empty();
							$('.paginationDiv').append(response.pagination);
						}
						$('.c_modal').removeClass('.spinBtn');
						areYouSure.popDown();
					});

				},
				function(){
					areYouSure.popDown();
				}
			);

		areYouSure.popUp('Are you sure you want to delete this post?');

	});

})(PopUp);