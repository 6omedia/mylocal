(function(YeahAutocomplete){

	var words = ['Take-a-way', 'Plumber', 'Supermarket'];
    var imgs = ['town1.jpeg', 'local1.jpg', 'local2.jpg'];
    var theSpan = document.getElementById('changingIndustry');
    var index = 0;

    setInterval(function(){

        theSpan.innerHTML = words[index];
        // $('body').css('background', 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(/static/img/' + imgs[index] + ') no-repeat 50%');

        if(index == words.length - 1){
            index = 0;
        }else{
            index++;
        }

    }, 2000);

    /////////////////////////////////////////////////////////////////

    var searchResults = $('#searchResults');
    var inputIndustry = $('#industry');
    var inputTown = $('#town');

    function getListings(industry, town, callback){
        $.ajax({
            url: '/api/listings/find/' + industry + '/' + town + '?page=1',
            method: 'GET',
            success: function(data){
                callback(data);
            },
            error: function(a, b, c){
                callback(a);
            }
        });
    }   

    $('#find').on('click', function(){

        var industry = $('#industry').val();
        var town = $('#town').val();

        if(industry != '' && town != ''){

            $('.heroSearch').addClass('heroSmall');
            searchResults.addClass('searching');
            $('.heroSmall h1').html('Searching for <span>' + inputIndustry.val() + '</span> in ' + inputTown.val());

            searchResults.empty();

            getListings(industry, town, function(data){

                if(data.listings){

                    if(data.correction){
                        searchResults.append("<p class='noresults'>Did you mean " + data.correction);
                    }

                    var string = '<div class="row">';

                    $.each(data.listings, function(i, listing){

                        var fiveRating = listing.rating / 2;
                        var rating = '';

                        for(i=0;i<5;i++){
                            if(i < fiveRating){
                                rating += '<span></span>';
                            }else{
                                rating += '<span class="nostar"></span>';
                            }
                        }

                        var theLogo = '';

                        if(listing.branding.logo != '/static/img/admin/placeholder-logo.png' && listing.branding.logo != undefined){
                            theLogo = `<img src="${listing.branding.logo}" class="logo">`;
                        }

                        string += `
                            <div class="col-sm-6 col-md-4">
                                <div class="listing">
                                    <div class="heading" style="background: url(${listing.bgimage}) no-repeat 50%/100%;">
                                        <h2>${listing.business_name}</h2>
                                    </div>
                                    <div class="info">
                                        <div class="rating">${rating}</div>
                                        <a href="tel:${listing.contact.phone}" class="phone">${listing.contact.phone}</a>
                                        <a href="/listing/${listing.slug}" class="btn">View</a>
                                        ${theLogo}
                                    </div>
                                </div>
                            </div>
                        `;

                    });

                    string += '</div>' + data.pagination;

                    searchResults.append(string);
                    searchResults.removeClass('searching');

                }else{

                    searchResults.append("<p class='noresults'>Sorry, couldn't find any " + industry + " in " + town + "</p>");
                    searchResults.removeClass('searching');

                }

            });

        }

    });
	
})(YeahAutocomplete);