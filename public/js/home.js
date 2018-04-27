(function(Form){

    /////////////////////////////////////////////////////////////////

    var searchResults = $('#searchResults');
    var inputIndustry = $('#industry');
    var inputTown = $('#town');

    $('.main-search-button').on('click', function(){
        var industry = $('#industry').val();
        var town = $('#town').val();
        if(industry == '' && town == ''){
            return;
        }
        window.location.replace('/find/' + industry + '/' + town);
    });

    // function getListings(industry, town, callback){
    //     $.ajax({
    //         url: '/api/listings/find/' + industry + '/' + town + '?page=1',
    //         method: 'GET',
    //         success: function(data){
    //             callback(data);
    //         },
    //         error: function(a, b, c){
    //             callback(a);
    //         }
    //     });
    // }   

    // $('#find').on('click', function(){

    //     var industry = $('#industry').val();
    //     var town = $('#town').val();

    //     if(industry != '' && town != ''){

    //         $('.heroSearch').addClass('heroSmall');
    //         searchResults.addClass('searching');
    //         $('.heroSmall h1').html('Searching for <span>' + inputIndustry.val() + '</span> in ' + inputTown.val());

    //         searchResults.empty();

    //         getListings(industry, town, function(data){

    //             if(data.listings){

    //                 if(data.correction){
    //                     searchResults.append("<p class='noresults'>Did you mean " + data.correction);
    //                 }

    //                 var string = '<div class="row">';

    //                 $.each(data.listings, function(i, listing){

    //                     var fiveRating = listing.rating / 2;
    //                     var rating = '';

    //                     for(i=0;i<5;i++){
    //                         if(i < fiveRating){
    //                             rating += '<span></span>';
    //                         }else{
    //                             rating += '<span class="nostar"></span>';
    //                         }
    //                     }

    //                     var theLogo = '';

    //                     if(listing.branding.logo != '/static/img/admin/placeholder-logo.png' && listing.branding.logo != undefined){
    //                         theLogo = `<img src="${listing.branding.logo}" class="logo">`;
    //                     }

    //                     string += `
    //                         <div class="col-sm-6 col-md-4">
    //                             <div class="listing">
    //                                 <div class="heading" style="background: url(${listing.bgimage}) no-repeat 50%/100%;">
    //                                     <h2>${listing.business_name}</h2>
    //                                 </div>
    //                                 <div class="info">
    //                                     <div class="rating">${rating}</div>
    //                                     <a href="tel:${listing.contact.phone}" class="phone">${listing.contact.phone}</a>
    //                                     <a href="/listing/${listing.slug}" class="btn">View</a>
    //                                     ${theLogo}
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     `;

    //                 });

    //                 string += '</div>' + data.pagination;

    //                 searchResults.append(string);
    //                 searchResults.removeClass('searching');

    //             }else{

    //                 searchResults.append("<p class='noresults'>Sorry, couldn't find any " + industry + " in " + town + "</p>");
    //                 searchResults.removeClass('searching');

    //             }

    //         });

    //     }

    // });

    // /////////////////////////////////////////////

    // var errorBox = $('#error');

    // function toggleLoading(btn, loading){

    //     if(loading){
    //         btn.addClass('spinBtn');
    //         btn.attr('disabled', 'disabled');
    //     }else{
    //         btn.removeClass('spinBtn');
    //         btn.attr('disabled', '');
    //     }

    // }

    // var loginForm = new Form('/api/login', [
    //         { id: 'q_email', validation: 'email' },
    //         { id: 'q_password', validation: '' },
    //     ]);

    // var registerForm = new Form('/api/register', [
    //         { id: 'r_name', validation: '' },
    //         { id: 'r_email', validation: 'email' },
    //         { id: 'r_password', validation: '' },
    //         { id: 'r_passwordconfirm', validation: 'password', message: 'Passwords Do Not Match' }
    //     ]);
	
    // $('#btn_login').on('click', function(e){

    //     e.preventDefault();
    //     var btn = $(this);

    //     if(loginForm.isValid()){

    //         toggleLoading(btn, true);

    //         var data = {
    //             email: $('#' + loginForm.fields[0].id).val(),
    //             password: $('#' + loginForm.fields[1].id).val()
    //         };

    //         loginForm.send(data, function(data){
    //             toggleLoading(btn, false);
    //             if(data.error){
    //                 errorBox.append('<p>' + data.error + '</p>');
    //                 return;
    //             }
    //             if(data.success){
    //                 window.location.replace(data.redirect);
    //             }
    //         });

    //     }else{
    //         errorBox.empty();
    //         errorBox.append('<p>' + loginForm.message + '</p>');
    //     }

    // });

    // $('#btn_register').on('click', function(e){

    //     e.preventDefault();
    //     var btn = $(this);

    //     if(registerForm.isValid()){

    //         toggleLoading(btn, true);

    //         var data = {
    //             name: $('#' + registerForm.fields[0].id).val(),
    //             email: $('#' + registerForm.fields[1].id).val(),
    //             password: $('#' + registerForm.fields[2].id).val(),
    //             confirm_password: $('#' + registerForm.fields[3].id).val()
    //         };

    //         registerForm.send(data, function(data){
    //             toggleLoading(btn, false);
    //             if(data.error){
    //                 errorBox.append('<p>' + data.error + '</p>');
    //                 return;
    //             }
    //             if(data.success){
    //                 window.location.replace(data.redirect);
    //             }
    //         });

    //     }else{
    //         errorBox.empty();
    //         errorBox.append('<p>' + registerForm.message + '</p>');
    //     }

    // });

})(form.form);