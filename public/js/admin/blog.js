(function(Form, ImageLibrary, YeahTextEditor, YeahAutocomplete){

	function Tags(){

		this.services = this.getTags();
		this.box = $('#tags');
		var thisServices = this;
		this.box.on('click', '.x', function(){
			thisServices.services.splice($(this).parent().index, 1);
			$(this).parent().remove();
		});

		var tagsAutocomplete = new YeahAutocomplete({
			input: 'tags_input',
			allowFreeType: true,
			dataUrl: '/api/tags/search/tag/',
			method: 'GET',
			arrName: 'tags',
			property: 'name'
		});

	}

	Tags.prototype.getTags = function(){
		var arr = [];
		$('#tags > span').each(function(){
			arr.push($(this).text().substring(0, $(this).text().length-1));
		});
		return arr;
	}

	Tags.prototype.updateTags = function() {
		
		this.box.empty();
		var theBox = this.box;

		$(this.services).each(function(){
			theBox.append('<span>' + this + '<span class="x">x</span></span>');
		});

	};

	Tags.prototype.addTag = function(name){

		$.ajax({
			url: '/api/tags/add_tag',
			method: 'POST',
			data: {
				field: 'tag',
				name: name
			},
			success: function(data){
				console.log(data);
			},
			error: function(a, b, c){
				console.log(a, b, c);
			}
		});

		this.services.push(name);
		this.updateTags();

	};

	function slugify(text){

		return text.toString().toLowerCase().replace(/\s+/g, '-')
	        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
	        .replace(/^-+/, '').replace(/-+$/, '');

	}

	var imgLib = new ImageLibrary($('#image_library_modal'));
	var txtEditor = new YeahTextEditor();

	var tags = new Tags();

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

	$('#tags_input + .btn').on('click', function(){
		tags.addTag($('#tags_input').val());
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
				tags: tags.getTags(),
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
				tags: tags.getTags(),
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

})(form.form, imageLibrary.ImageLibrary, YeahTextEditor, YeahAutocomplete);