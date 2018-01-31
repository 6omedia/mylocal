
	/*

		class definitions

	*/

	class ContentBlock {

		render(){

		    const li = $(document.createElement('li'));
		    const div = $(document.createElement('div')).addClass('contentBlock').data('content_type', this.type);
		    const h4 = $(document.createElement('h4')).html(this.type);
		    const remove = $(document.createElement('div')).addClass('remove').html('x');

		    div.append(h4);
		    div.append(remove);

		    switch(this.type) {
		    	case 'H2':
		    	case 'H3':
		    		const headingInput = $(document.createElement('input')).attr('type', 'text')
		    													.addClass('block_' + this.type);
		    		div.append(headingInput);
		    		break;
			    case 'Paragraph':
			    case 'Quote':
			        const txtArea = $(document.createElement('textarea')).attr('placeholder', "type text here...");
			        div.append(txtArea);
			        break;
			    case 'Horizontal Rule':
			    	div.append($(document.createElement('hr')));
			    	break;
			    case 'HTML':
			    	const htmlArea = $(document.createElement('textarea'))
			    						.attr('placeholder', "type html here...")
			    						.addClass('htmlEdit');
			        div.append(htmlArea);
			        break;
			    case 'Preface':
			    	const prefaceTitle = $(document.createElement('input'))
			    							.attr('placeholder', "Title...");
			    	const prefaceSummary = $(document.createElement('textarea'))
			    							.attr('placeholder', "Summary...");
			    	const prefaceImg = $(document.createElement('img')).hide();
			    	const prefaceFileInput = $(document.createElement('input')).attr('type', 'file');
			    	const prefaceProg = $(document.createElement('div')).addClass('progress');
			    	const prefaceProgBar = $(document.createElement('div')).addClass('progress-bar')
			    						.attr('role', 'progressbar');

			    	div.append(prefaceTitle);
			    	div.append(prefaceSummary);
			    	prefaceProg.append(prefaceProgBar);
			    	div.append(prefaceImg);
			    	div.append(prefaceFileInput);
			    	div.append(prefaceProg);

			    	this.attachImgUploader(prefaceImg, prefaceProgBar, prefaceFileInput);
			    	
			    	break;
			    case 'Image':
			    	const img = $(document.createElement('img')).hide();
			    	const fileInput = $(document.createElement('input')).attr('type', 'file');
			    	const prog = $(document.createElement('div')).addClass('progress');
			    	const progBar = $(document.createElement('div')).addClass('progress-bar')
			    						.attr('role', 'progressbar');
			    	prog.append(progBar);
			    	div.append(img);
			    	div.append(fileInput);
			    	div.append(prog);

			    	this.attachImgUploader(img, progBar, fileInput);

			        break;
			    case 'Video':
			    	const video = $(document.createElement('video')).hide().attr('controls', 'true');
			    	const videofileInput = $(document.createElement('input')).attr('type', 'file');
			    	const videoProg = $(document.createElement('div')).addClass('progress');
			    	const videoProgBar = $(document.createElement('div')).addClass('progress-bar')
			    						.attr('role', 'progressbar');
			    	videoProg.append(videoProgBar);
			    	div.append(video);
			    	div.append(videofileInput);
			    	div.append(videoProg);

			    	this.attachVideoUploader(video, videoProgBar, videofileInput);

			        break;
			    default:
			        getCustomBlock(this.type, div);

			}

			li.append(div);
		
			this.ul.append(li);

			$('.contentBlock .remove').on('click', function(){
				$(this).parent().parent().remove();
			});

			$('.htmlEdit').keydown(function (e){
			    var keycode1 = (e.keyCode ? e.keyCode : e.which);
			    if (keycode1 == 0 || keycode1 == 9) {
			        e.preventDefault();
			        e.stopPropagation();
			    }
			});

		}

		attachImgUploader(img, prog, fileInput){

			const uploader = new ImageUploader(fileInput, '', prog, 'posts', this.aws);

			uploader.fileInput.on('click', function(){
				uploader.resetProgress();	
			});

			uploader.fileInput.on('change', function(){

				if(uploader.awsObj == false){

					uploader.uploadLocalFiles(function(data){
						img.attr('src', '/static/uploads/posts/' + data.filename).show();
					});

				}else{

					uploader.uploadFile(function(awsUrl, filename){
						img.attr('src', awsUrl).show();
					});

				}

			});

		}

		attachVideoUploader(video, prog, fileInput){

			const uploader = new ImageUploader(fileInput, '', prog, 'videos', this.aws);

			uploader.fileInput.on('click', function(){
				uploader.resetProgress();	
			});

			uploader.fileInput.on('change', function(){

				if(uploader.awsObj == false){

					uploader.uploadLocalFiles(function(data){
						video.attr('src', '/static/uploads/videos/' + data.filename).show();
					});

				}else{

					uploader.uploadFile(function(awsUrl, filename){
						video.attr('src', awsUrl).show();
					});

				}

			});

		}

		constructor(ul, type, aws){
			this.ul = ul;
			this.type = type;
			this.aws = aws;
		}
	}

	class CbControls {

		addContentBlock(contentBlock){
			const cBlock = new ContentBlock(this.cbList, contentBlock, this.aws);
			cBlock.render();
		}

		removeContentBlock(contentBlock){
			console.log('remove');
		}

		createButtons(cbTypes){

			for(let i=0; i<cbTypes.length; i++){
				let button = '<li data-cb_type="' + cbTypes[i] + '">';
				button += '<div id="cb_' + slugify(cbTypes[i], '') + '"></div><p>' + cbTypes[i] + '</p></li>';
				this.ul.append(button);
			}

			const btns = this.ul.children('li');
			const thisObj = this;

			btns.on('click', function(){
				const type = $(this).data('cb_type');
				thisObj.addContentBlock(type);
			});

		}

		attachUploaders(aws){

			const contentBlocks = this.cbList.children();
			contentBlocks.each(function(){
				let div = $(this).children();
				if(div.data('content_type') == 'Image'){

					const img = div.children('img');

					const uploader = new ImageUploader(div.children('input'), '', div.children('.progress'), 'posts', aws);

					uploader.fileInput.on('click', function(){
						uploader.resetProgress();
					});

					uploader.fileInput.on('change', function(){

						if(uploader.awsObj == false){

							uploader.uploadLocalFiles(function(data){
								img.attr('src', '/static/uploads/posts/' + data.filename).show();
							});

						}else{

							uploader.uploadFile(function(awsUrl, filename){
								img.attr('src', awsUrl).show();
							});

						}

					});
				}else if(div.data('content_type') == 'Video'){

					const video = div.children('video');
					const uploader = new ImageUploader(div.children('input'), '', div.children('.progress'), 'videos', aws);

					uploader.fileInput.on('click', function(){
						uploader.resetProgress();	
					});

					uploader.fileInput.on('change', function(){

						if(uploader.awsObj == false){

							console.log('uploader.awsObj == false');

							uploader.uploadLocalFiles(function(data){
								video.attr('src', '/static/uploads/videos/' + data.filename).show();
							});

						}else{

							console.log('uploader.awsObj == true');

							uploader.uploadFile(function(awsUrl, filename){
								video.attr('src', awsUrl).show();
							});

						}

					});

				}
			});
		}

		constructor(cbList, ul, aws){
			this.contentBlocks = [];
			this.cbList = cbList;
			this.ul = ul;
			this.cbList.sortable();
			this.attachUploaders(aws);
			this.aws = aws;
		}
	}