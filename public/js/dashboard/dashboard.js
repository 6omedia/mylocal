(function(){

	var arrowBar = $('.tabs-mob');
	var tabsMenu = $('.tabs-listing');

	arrowBar.on('click', function(){
		if(arrowBar.hasClass('open')){
			arrowBar.removeClass('open');
			tabsMenu.removeClass('open');
		}else{
			arrowBar.addClass('open');
			tabsMenu.addClass('open');
		}
	});

	var sideSubmit = $( ".side_submit" );

	if(sideSubmit.length){

		var btnPos = sideSubmit.offset().top - 80;

		$(document).scroll(function(){
			if($(window).scrollTop() >= btnPos){
				sideSubmit.addClass('fixed');
			}else{
				sideSubmit.removeClass('fixed');
			}
		});		

	}

})();