var adminArea = (function(Accordian){

	function Model(obj){
		
	}

	function View(){
		this.side = $('.side');
		this.side_menu_items = $('.side ul li');
	}

	function AdminArea(Model, View){

		this.view = new View();
		this.model = new Model({});

		/*** events ***/

		this.sideMenu = new Accordian('#side_menu');

		$('.accordian').find('span').click(function(){
			//Expand or collapse this panel
			$(this).next().slideToggle('fast');
			//Hide the other panels
			$(".a_content").not($(this).next()).slideUp('fast');
	    });

	}

	AdminArea.prototype.updateModelFromView = function(ideaBoxes) {
		
	};

	var adminArea = new AdminArea(Model, View);

})(accordian.Accordian);