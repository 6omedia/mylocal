var imageLibrary = (function(){

	var exports = {};

	/*

		Model

	*/

	function Model(){
		this.images = [];
	}
	Model.prototype.getImages = function(callback) {
		var thisImgLib = this;
		$.get("/api/image_library/get_images", function( data ) {
			thisImgLib.images = data.images;
		 	callback(data.images);
		});
	};
	Model.prototype.removeImage = function(imgName, callback) {

		$.ajax({
			url: '/api/image_library/remove_image/' + imgName.split('/')[1],
			type: 'DELETE',
			success: function(data){
				callback(data);
			}
		});
	
	};

	/*

		View

	*/

	function View(imageLibraryContainer){
		this.imageLibraryContainer = imageLibraryContainer;
		this.imgWindow = $('.imgWindow');
		this.imageUl = $('#image_library .images');
		this.imageli = $('#image_library .images li');
		this.uploadInput = $('#uploadImgBtn');
		this.message = $('#image_library .message');
	}
	View.prototype.updateImageLibraryView = function(images, from = 0){
		var thisView = this;

		// console.log(from, ' img ', images);

		if(from == 0){
			this.imageUl.empty();	
		}
		
		var imgLength = images.length;

		if(imgLength > 0){
			for(i=from; i<imgLength; i++){
				var imgli = $('<li><img src="/static/uploads/' + images[i] + '"></li>');
				this.imageUl.append(imgli);
			}
		}else{
			if(from == 0){
				this.message.text('No Images');
			}
		}
	};
	View.prototype.btnLoading = function(btn){
		$(btn).addClass('imglib_loading');
	};
	View.prototype.stopLoading = function(btn){
		$(btn).removeClass('imglib_loading');
	};
	View.prototype.libraryLoading = function(btn){
		$(btn).addClass('imglib_loading');
	};
	View.prototype.stopLibraryLoading = function(btn){
		$(btn).removeClass('imglib_loading');
	};
	View.prototype.displayLibrary = function(images){
		this.imageLibraryContainer.fadeIn(200);
		this.updateImageLibraryView(images, 0);
	};
	View.prototype.showImageActions = function(imgLi, img, useImage, removeImage){
		$( ".imglib_actions" ).remove();
		var actions = $('<div class="imglib_actions"></div>');
		var useBtn = $('<div class="imglib_btn">Use Image</div>');
		useBtn.on('click', function(){
			useImage(img);
		});
		var removeBtn = $('<div class="imglib_btn">Remove from library</div>');
		removeBtn.on('click', function(){
			removeImage();
		});
		actions.append(useBtn);
		actions.append(removeBtn);
		$(imgLi).append(actions);
	};
	View.prototype.changeStateImgUploading = function(percentage){
		$('.prog_wrap').show(200);
		this.message.text('Image Uploading... 0%');
	};
	View.prototype.updateUploadProgress = function(percentage){
		if(percentage < 100){
			$('.progress-bar').width(percent + '%');
			this.message.text('Image Uploading... ' + percentage);	
		}else{
			$('.prog_wrap').hide(200);
			this.message.text('Image Uploaded');
		}
	};

	/*

		Controller

	*/

	function ImageLibrary(imageLibraryContainer){
		
		this.model = new Model();
		this.view = new View(imageLibraryContainer);
		this.selectedFunc;
		var thisImgLib = this;

		this.view.imageLibraryContainer.on('click', function(e){
			if(e.target.id == 'image_library_modal'){
				thisImgLib.closeLibrary();
			}
		});

		$('.imgWindow').on('click', 'li', function(){
			$('.imgWindow li').removeClass('imglib_selected');
			$(this).addClass('imglib_selected');
			var imgName = thisImgLib.model.images[$(this).index()];
			thisImgLib.view.showImageActions(this, imgName,
				function(img){
					
					if(thisImgLib.selectedFunc){
						thisImgLib.selectedFunc(img);
					}else{

						var useImgEvent = new CustomEvent('useImage', {
							detail: {
								image: img,
								time: new Date(),
							},
							bubbles: true,
							cancelable: true
						});
						document.dispatchEvent(useImgEvent);

					}

					thisImgLib.closeLibrary();

				},
				function(){
					thisImgLib.removeImage(imgName);
				}
			);
		});

		this.view.uploadInput.on('change', function(){
			thisImgLib.uploadImage();
		});

		var lastScrollTop = 0;

		this.view.imgWindow.scroll(function(e) {
		 	
		 	var winHeight = thisImgLib.view.imgWindow.height() + 100;
		 	// var scrollPos = thisImgLib.view.imgWindow.scrollTop() + winHeight;
		 	
		 	if(thisImgLib.view.imgWindow.scrollTop() + winHeight > lastScrollTop){
		 		if(thisImgLib.view.imgWindow.scrollTop() + winHeight > winHeight){
			 		thisImgLib.loadMoreImages();
			 	}
			}
			lastScrollTop = thisImgLib.view.imgWindow.scrollTop() + winHeight;

		});

	}
	ImageLibrary.prototype.openLibrary = function(btn, func){
		
		var thisImgLib = this;

		if(func){
			thisImgLib.selectedFunc = func;	
		}
		
		thisImgLib.view.btnLoading(btn);
		thisImgLib.model.getImages(function(images){
			thisImgLib.view.displayLibrary(images);
			thisImgLib.view.stopLoading(btn);
		});

	};
	ImageLibrary.prototype.closeLibrary = function(){

		this.view.imageLibraryContainer.fadeOut(200);
		this.view.imageUl.empty();
		this.view.message.text('Select Image');

	};
	ImageLibrary.prototype.uploadImage = function(){

		var thisImgLib = this;
		this.view.changeStateImgUploading(); //.message.text('Image Uploading... 0%');
		var imageFile = this.view.uploadInput.get(0).files[0];
		var formData = new FormData();
		formData.append('imglib_image', imageFile);

		console.log('img file ', imageFile);
		console.log('formdata ', formData.entries());

		// Display the key/value pairs
		for (var pair of formData.entries())
		{
		 console.log(pair[0]+ ', '+ pair[1]); 
		}

	 	$.ajax({
	        url: '/api/image_library/add_image',
	        method: 'POST',
	        data: formData,
	        processData: false,
	        contentType: false,
	        xhr: function () {
	            var xhr = new XMLHttpRequest();

	            xhr.upload.addEventListener('progress', function (event) {
	                if (event.lengthComputable) {
	                    var percent = (event.loaded / event.total) * 100;
                    	thisImgLib.view.updateUploadProgress(percent);
	                }
	            });

	            return xhr;
	        }
	    }).done(function(data){
	    	
	    	thisImgLib.model.getImages(function(images){
				thisImgLib.view.displayLibrary(images);
			});

	    }).fail(function(xhr, status, hmm) {
	       	console.log(xhr, status, hmm);
	    });

	};
	ImageLibrary.prototype.onSelectImage = function(callback){

		var thisImgLib = this;
		document.addEventListener("useImage", function(e){
			callback(e.detail.image);
			thisImgLib.closeLibrary();
		}); 

	};
	ImageLibrary.prototype.removeImage = function(imgName){

		var thisImgLib = this;
		this.model.removeImage(imgName, function(data){
			if(data.error){
				console.log(data.error);
			}
			thisImgLib.model.getImages(function(imgs){
				thisImgLib.view.updateImageLibraryView(imgs);
			});
		});

	};
	ImageLibrary.prototype.loadMoreImages = function(){

		var currentImgLength = $('#image_library .images li').length;
		var imgs = this.model.images.slice(currentImgLength, currentImgLength + 10);
		console.log(currentImgLength, imgs);
		this.view.updateImageLibraryView(imgs, currentImgLength);

	};

	exports.ImageLibrary = ImageLibrary;
	return exports;

}());