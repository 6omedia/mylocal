(function(){

	const checkBox = $('#terms_check');
	const claimBtn = $('#claim');

	function doError(err){

        var errBox = $('#theError');

        $('#theError p').text(err);
        errBox.show();

        setTimeout(
        function(){
            errBox.fadeOut(400);
        }, 3000);

    }

	checkBox.on('change', function(){
		if(checkBox.prop('checked')){
			claimBtn.prop('disabled', false);
		}else{
			claimBtn.prop('disabled', true);
		}
	});

	claimBtn.on('click', function(){

		var btn = $(this); 
		var id = btn.data('id');
		var slug = btn.data('slug');

        btn.addClass('spinBtn');

        $.ajax({
            url: '/api/listings/assign_owner',
            method: 'POST',
            data: {
                listingid: id
            },
            success: function(data){

                if(!data.error){
                    window.location.replace('/listing/' + slug);
                }else{
                    doError(data.error);
                }

                btn.removeClass('spinBtn');

            },
            error: function(a, b, c){
            	// console.log(a.responseJSON.error);
                doError(a.responseJSON.error);
                btn.removeClass('spinBtn');
            }
        });

	});

})();