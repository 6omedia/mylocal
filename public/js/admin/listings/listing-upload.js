(function(){

	var uploadInput = $('#jsonUpload');
	// var uploadBox = $('#upload_box');
	var uploadBtn = $('#upload-listings');
	var typeSelect = $('#keywordtype');
	var industryInput = $('#industry');

	uploadInput.on('change', function(e){
		$('label[for="jsonUpload"]').text(e.currentTarget.files[0].name);
	});

	// toggle industry enable and disable on select change
	typeSelect.on('change', function(){
		console.log($(this).val());
		if($(this).val() == 'industry'){
			console.log('IT IS AN industry');
			industryInput.prop('disabled', true);
		}else{
			industryInput.prop('disabled', false);
		}
	});

	uploadBtn.on('click', function(){

		uploadBtn.addClass('spinBtn');

		var jsonFile = uploadInput.get(0).files[0];
		var formData = new FormData();
		formData.append('listings', jsonFile);
		formData.append('type', typeSelect.val());

		if(typeSelect.val() == 'service'){
			formData.append('industry', industryInput.val());
		}

		for(var pair of formData.entries())
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

	    	console.log(data);

	    	if(data.error){
	    		var msg = new Message(data.error, true, $('#msg'));
				msg.display(true);
	    	}else{
	    		var msg = new Message(data.success, false, $('#msg'));
				msg.display(true);
	    	}

	    	uploadBtn.removeClass('spinBtn');

	    }).fail(function(xhr, status, hmm) {
	       	console.log(xhr, status, hmm);
	       	var msg = new Message(hmm, true, $('#msg'));
			msg.display(true);
			uploadBtn.removeClass('spinBtn');
	    });

	});

	// uploadbtn.on('change', function(){

	// 	uploadBox.addClass('spinBtn');

	// 	var jsonFile = $(this).get(0).files[0];
	// 	var formData = new FormData();
	// 	formData.append('listings', jsonFile);

	// 	// Display the key/value pairs
	// 	for (var pair of formData.entries())
	// 	{
	// 		console.log(pair[0]+ ', '+ pair[1]); 
	// 	}

	// 	var last_response_len = false;

	//  	$.ajax({
	//         url: '/api/listings/upload',
	//         method: 'POST',
	//         data: formData,
	//         processData: false,
	//         contentType: false,
	//         xhr: function () {
	//             var xhr = new XMLHttpRequest();

	//             xhr.upload.addEventListener('progress', function (event) {
	//                 if (event.lengthComputable) {
	//                     var percent = (event.loaded / event.total) * 100;
 //                    	console.log(percent);
	//                 }
	//             });

	//             return xhr;
	//         }
	//     }).done(function(data){

	//     	console.log(data);

	//     	if(data.error){
	//     		var msg = new Message(data.error, true, $('#msg'));
	// 			msg.display(true);
	//     	}else{
	//     		var msg = new Message(data.success, false, $('#msg'));
	// 			msg.display(true);
	//     	}

	//     	uploadBox.removeClass('spinBtn');

	//     }).fail(function(xhr, status, hmm) {
	//        	console.log(xhr, status, hmm);
	//        	var msg = new Message(hmm, true, $('#msg'));
	// 		msg.display(true);
	// 		uploadBox.removeClass('spinBtn');
	//     });

	// });

})();