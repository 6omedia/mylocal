(function(Form, ImageLibrary, YeahTextEditor){

	function slugify(text){

		return text.toString().toLowerCase().replace(/\s+/g, '-')
	        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
	        .replace(/^-+/, '').replace(/-+$/, '');

	}

	var imgLib = new ImageLibrary($('#image_library_modal'));
	var txtEditor = new YeahTextEditor();

	var imgTarget = 'featuredImg';

	$('.txtImg').on('click', function(){
		imgTarget = 'editorImg';
		imgLib.openLibrary(this);
	});

	$('#q_title').on('blur', function(){
		$('#slug').text('/blog/' + slugify($(this).val()));
	});

	$('.file_upload_box').on('click', function(){
		imgTarget = 'featuredImg';
		imgLib.openLibrary(this);
	});

	imgLib.onSelectImage(function(yeah){
		if(imgTarget == 'featuredImg'){
			$('#q_featimg').attr('src', '/static/uploads/' + yeah);
		}else if(imgTarget == 'editorImg'){
			document.execCommand('insertimage', false, '/static/uploads/' + yeah);
		}
	});

	var fieldsArray = [
			{ id: 'q_title', validation: '' },
			{ id: 'q_content', validation: 'none' },
			{ id: 'q_featimg', validation: 'none' }
		];

	var postForm = new Form('/api/blog/add', fieldsArray);
	var postUpdateForm = new Form('/api/blog/update', fieldsArray);

	$('#save').on('click', function(){

		var content = JSON.stringify($('.editor').html());

		if(postForm.isValid()){

			$(this).addClass('spinBtn');

			postForm.send({
				title: $('#' + postForm.fields[0].id).val(),
				content: content,
				featured_img: $('#' + postForm.fields[2].id).attr('src')
			}, function(data){

				if(!data.responseJSON){
					postForm.resetForm();
					$('#' + postForm.fields[2].id).attr('src', '/static/img/admin/landscape-image.png');
					$('.editor').html('');
					var msg = new Message(data.success + ' <a href="/admin/blog">View All Posts</a>', false, $('#msg'));
					msg.display(true);
				}else{
					var msg = new Message(data.responseJSON.error, true, $('#msg'));
					msg.display(true);
				}

				$('#save').removeClass('spinBtn');

			});

		}

	});

	$('#update').on('click', function(){

		var content = JSON.stringify($('.editor').html());

		if(postUpdateForm.isValid()){

			$(this).addClass('spinBtn');

			postUpdateForm.send({
				postid: $('#update').data('postid'),
				title: $('#' + postUpdateForm.fields[0].id).val(),
				content: content,
				featured_img: $('#' + postUpdateForm.fields[2].id).attr('src')
			}, function(data){

				if(!data.responseJSON){
					if(data.success){
						var msg = new Message(data.success + ' <a href="/admin/blog">View All Posts</a>', false, $('#msg'));
						msg.display(true);
					}else{
						var msg = new Message(data.error, true, $('#msg'));
						msg.display(true);
					}
				}else{
					var msg = new Message(data.responseJSON.error, true, $('#msg'));
					msg.display(true);
				}

				$('#update').removeClass('spinBtn');

			});

		}

	});

})(form.form, imageLibrary.ImageLibrary, YeahTextEditor);