(function(){

	var progBar = $('.progress-bar');
	var main = $('.main');

	$('#jsonUpload').on('change', function(){

		main.addClass('spinBtn');

		var jsonFile = $(this).get(0).files[0];
		var formData = new FormData();
		formData.append('postcodes', jsonFile);

		// Display the key/value pairs
		for (var pair of formData.entries())
		{
			console.log(pair[0]+ ', '+ pair[1]); 
		}

	 	$.ajax({
	        url: '/api/postcodes/upload',
	        method: 'POST',
	        data: formData,
	        processData: false,
	        contentType: false,
	        xhr: function () {
	            var xhr = new XMLHttpRequest();

	            xhr.upload.addEventListener('progress', function (event) {
	                if (event.lengthComputable) {
	                    var percent = (event.loaded / event.total) * 100;
	                    progBar.css('width', percent + '%');
	                    progBar.text(percent + '%');
                    	console.log(percent);
	                }
	            });

	            return xhr;
	        }
	    }).done(function(data){

	    	console.log('Data ', data);

	    	main.removeClass('spinBtn');

	    	if(data.error){
	    		var msg = new Message(data.error, true, $('#msg'));
				msg.display(false);
	    	}else{
	    		var msg = new Message(data.success, false, $('#msg'));
				msg.display(false);
	    	}

	    }).fail(function(xhr, status, hmm) {
	    	main.removeClass('spinBtn');
	       	console.log(xhr, status, hmm);
	       	var msg = new Message(xhr.responseJSON.error, true, $('#msg'));
			msg.display(false);
	    });

	});

})();