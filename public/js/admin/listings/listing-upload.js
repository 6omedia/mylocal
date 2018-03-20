(function(){

	var uploadbtn = $('#jsonUpload');
	var uploadBox = $('#upload_box');

	uploadbtn.on('change', function(){

		uploadBox.addClass('spinBtn');

		var jsonFile = $(this).get(0).files[0];
		var formData = new FormData();
		formData.append('listings', jsonFile);

		// Display the key/value pairs
		for (var pair of formData.entries())
		{
		 console.log(pair[0]+ ', '+ pair[1]); 
		}

	 	$.ajax({
	        url: '/api/listings/upload',
	        method: 'POST',
	        data: formData,
	        processData: false,
	        contentType: false,
	        xhr: function () {
	            var xhr = new XMLHttpRequest();

	            xhr.upload.addEventListener('progress', function (event) {
	                if (event.lengthComputable) {
	                    var percent = (event.loaded / event.total) * 100;
                    	console.log(percent);
	                }
	            });

	            return xhr;
	        }
	    }).done(function(data){

	    	if(data.error){
	    		var msg = new Message(data.error, true, $('#msg'));
				msg.display(false);
	    	}else{
	    		var msg = new Message(data.success, false, $('#msg'));
				msg.display(false);
	    	}

	    	uploadBox.removeClass('spinBtn');

	    }).fail(function(xhr, status, hmm) {
	       	console.log(xhr, status, hmm);
	       	var msg = new Message(hmm, true, $('#msg'));
			msg.display(false);
			uploadBox.removeClass('spinBtn');
	    });

	});

})();