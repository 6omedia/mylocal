// (function(){

// 	function FormSection(h2, formElem){
// 		this.h2 = h2;
// 		this.formElem = formElem;
// 	}

// 	FormSection.prototype.load = function(){
// 		$('#question').text(this.h2);
// 		$('.formBox').hide();
// 		this.formElem.show();
// 	};

// 	////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 	function RegisterForm(){

// 		this.formIndex = 0;

// 		this.forms = {
// 			init: new FormSection('Do you Own a Business?', $('#form-ownbusiness')), 
// 			standard: new FormSection('Create your Account', $('#form-standardinfo')),
// 			business_init: new FormSection('Anothrjk vdsv', $('#form-businessinfo'))
// 		};

// 		var thisRf = this;

// 		$('#q-yes').on('click', function(){
// 			$('.theBtns').hide();
// 			thisRf.forms.business_init.load();

// 			registerForm.businessForm();

// 		});

// 		$('#q-no').on('click', function(){
// 			$('.theBtns').hide();
// 			thisRf.forms.standard.load();

// 			// do the standard sign up thing
// 			registerForm.standardSubForm();

// 		});

// 	}

// 	RegisterForm.prototype.standardSubForm = function(){

// 	};

// 	RegisterForm.prototype.businessForm = function(){

// 	};

// 	var registerForm = new RegisterForm();

// }());