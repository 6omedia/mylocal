(function(){

	function Question(){

	}

	function Model(obj){
		this.ownBusiness;
	}

	function View(){
		
	}

	function Listing(Model, View){

		this.view = new View();
		this.model = new Model({});

		/*** events ***/

		this.questions = [];

		// if logged in....
			// is it listed? Add business
			// is it not? Create and add

		// if logged out....
			// is it listed? login and add (pass business id in query string /login?bid=8798798)
			// is it not? login add business
	}

	Listing.prototype.ask = function() {
		
	};

	Listing.prototype.updateModelFromView = function(ideaBoxes) {
		
	};

	var listing = new Listing(Model, View);

}());