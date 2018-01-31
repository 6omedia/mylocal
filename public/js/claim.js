(function(YeahAutocomplete){

    var searchResults = $('#searchResults');
    var inputListing = $('#inputListing');
    var foundListing;
   
    function doError(err){

        $('#theError p').text(err);
        $('#theError').show();

    }

    $('.bigWhite .panel').hide();

    var listingAutocomplete = new YeahAutocomplete({
        input: 'inputListing',
        allowFreeType: true,
        dataUrl: '/api/listings/?search=',
        method: 'GET',
        arrName: 'listings',
        property: 'business_name'
    });

    inputListing.on('resultSelected', function(listing){
       // console.log(inputListing.data('listing'));
        foundListing = inputListing.data('listing');
    });

    $('#find').on('click', function(){

        $('.heroSearch').addClass('heroSmall');

        searchResults.append(`
                <h2>${foundListing.business_name}</h2>
                <h3>Industry: ${foundListing.industry}</h3>
                <h3>Phone: ${foundListing.contact.phone}</h3>
                <h3>Email: ${foundListing.contact.email}</h3>
                <h3>Address: </h3>
                <address>
                    ${foundListing.address.line_one}
                    ${foundListing.address.town}
                    ${foundListing.address.post_code}
                </address>
                <h3>Details</h3>
                <p> 
                    ${foundListing.description}
                </p>
            `);

        $('.bigWhite .panel').show();

    });
	
    $('#yes').on('click', function(){

        var btn = $(this); 

        btn.addClass('spinBtn');

        $.ajax({
            url: '/api/listings/assign_owner',
            method: 'POST',
            data: {
                listingid: foundListing._id
            },
            success: function(data){

                if(!data.error){
                    window.location.replace('/listing/' + foundListing.slug);
                }else{
                    doError(data.error);
                }

                btn.removeClass('spinBtn');

            },
            error: function(a, b, c){
                doError(a.responseJSON.error);
                btn.removeClass('spinBtn');
            }
        });

    });

    $('#no').on('click', function(){

        $(this).addClass('spinBtn');
        
    });

})(YeahAutocomplete);