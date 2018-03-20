(function(YeahAutocomplete){

    var searchResults = $('#searchResults');
    var inputListing = $('#inputListing');
    var findBtn = $('#find');
    var foundListing;

    //findBtn.prop('disabled', true);
    searchResults.hide();

    function doError(err){

        var errBox = $('#theError');

        $('#theError p').text(err);
        errBox.show();

        setTimeout(
        function(){
            errBox.fadeOut(400);
        }, 3000);

    }

    $('.bigWhite .panel').hide();

    var listingAutocomplete = new YeahAutocomplete({
        input: 'inputListing',
        allowFreeType: true,
        dataUrl: '/api/listings/?unowned=true&search=',
        method: 'GET',
        arrName: 'listings',
        property: 'business_name',
        onResults: function(listings){

            searchResults.empty();

            $(listings).each(function(index, listing){

                var contact = '';
                var address = '';

                if(listing.contact){ contact = listing.contact; }
                if(listing.address){ address = listing.address; }

                searchResults.append(`
                    <div class="col-sm-6 col-md-4">
                        <div class="panel">
                            <h2>${listing.business_name}</h2>
                            <p><b>Industry:</b> ${listing.industry || 'Unknown'}</p>
                            <p><b>Phone:</b> ${contact.phone || 'Unknown'}</p>
                            <p><b>Email:</b> ${contact.email || 'Unknown'}</p>
                            <p>Address: </p>
                            <address>
                                ${address.line_one || ''}
                                ${address.town || ''}
                                ${address.post_code || ''}
                            </address>
                            <a href="/terms?listing=${listing.slug}" class="btn">Claim</a>
                        </div>
                    </div>
                `);
            });

            searchResults.show();
            listingAutocomplete.view.stopLoading();
        }
    });

    inputListing.on('resultSelected', function(listing){
       // foundListing = inputListing.data('listing');
       // findBtn.prop('disabled', false);
    });

    // findBtn.on('click', function(){

    //     $('.heroSearch').addClass('heroSmall');

    //     searchResults.empty();

    //     if(foundListing){

    //         searchResults.append(`
    //             <h2>${foundListing.business_name}</h2>
    //             <h3>Industry: ${foundListing.industry || 'Unknown'}</h3>
    //             <h3>Phone: ${foundListing.contact.phone || 'Unknown'}</h3>
    //             <h3>Email: ${foundListing.contact.email || 'Unknown'}</h3>
    //             <h3>Address: </h3>
    //             <address>
    //                 ${foundListing.address.line_one || ''}
    //                 ${foundListing.address.town || ''}
    //                 ${foundListing.address.post_code || ''}
    //             </address>
    //             <h3>Details</h3>
    //             <p> 
    //                 ${foundListing.description || 'Unknown'}
    //             </p>
    //         `).show();

    //         $('.panel').empty().append(`
    //             <p>Do you own this business?</p>
    //             <a href="/terms?listing=${foundListing.slug}" class="btn">Yes</a>
    //             <a href="/listings/add" class="btn">Add Your Business</a>
    //         `).show();

    //     }else{

    //         searchResults.append(`
    //             <p class="noresults">We don\'t have that listing, 
    //             <a href="/listing/add?business_name=${inputListing.val()}">add it here</a></p>`
    //         );

    //     }

    // });

})(YeahAutocomplete);