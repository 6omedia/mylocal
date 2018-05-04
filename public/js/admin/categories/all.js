(function(Form){

	class CatPage {
		constructor(fields, aliasList, serviceList) {
			var thisCatpage = this;
			this.industries = [];
			this.fields = fields;
			this.table = $('table');
			this.aliasList = aliasList;
			this.serviceList = serviceList;
			this.currentPopupform = '';
			this.industryid = '';

			$('table tr').each(function(index){
				if(index > 0){
					thisCatpage.industries.push($($(this).find('td')[0]).text());
				}
			});
		}
		emptyForm() {
			$('#' + this.fields[0].id).val('');
			aliasList.reset();
			serviceList.reset();
		}
		getIndustry(industryid, callback) {
			this.table.addClass('spinBtn');
			var thisCatpage = this;
			$.ajax({
				url: '/api/industries?industryid=' + industryid,
				method: 'GET',
				success: function(data){
					if(data.error){
						return alert('Something went wrong err: ' + err);
					}	
					// Update Form Values
					$('#' + thisCatpage.fields[0].id).val(data.industry.name);
					thisCatpage.aliasList.populate(data.industry.aliases);
					thisCatpage.serviceList.populate(data.industry.services);
					thisCatpage.table.removeClass('spinBtn');
					callback();
				}
			});
		}
	}

	class PopUpForm {
		constructor(heading, buttonText, inputGroups, yes = null){
			this.heading = heading;
			this.buttonText = buttonText;
			this.inputGroups = inputGroups;
			this.yes = yes;
			// this.onSubmit = onSubmit;
			// click modal or cross to close
			if(this.yes != null){
				this.createAreyouSure();
			}else{
				this.createModel();
			}
		}
		createAreyouSure() {
			var thisPuf = this;
			this.modal = $('<div class="puf_modal"></div>');
			this.innerModal = $('<div class="puf_box"></div>');
			this.innerModal.append('<h3>' + this.heading + '</h3>');

			this.yesbutton = $('<button class="btn">Yes</button>');
			this.yesbutton.on('click', function(){
				thisPuf.yes();
			});

			this.nobutton = $('<button class="btn">No</button>');
			this.nobutton.on('click', function(){
				thisPuf.hide();
			});

			this.innerModal.append(this.yesbutton);
			this.innerModal.append(this.nobutton);
			
			this.modal.append(this.innerModal);
			$('body').append(this.modal);
		}
		createModel() {
			var thisPuf = this;
			this.modal = $('<div class="puf_modal"></div>');
			this.innerModal = $('<div class="puf_box"></div>');
			this.ul = $('<ul></ul>');
			this.button = $('<button class="btn">' + this.buttonText + '</button>');
			// this.button.on('click', function(){
			// 	thisPuf.onSubmit($(this).data('industryid'));
			// });
			var close = $('<div class="x">x</div>').on('click', function(){
				thisPuf.hide();
			});

			$(this.inputGroups).each(function(){
				var li = $('<li></li>');
				li.append($(this));
				thisPuf.ul.append(li);
			});

			this.innerModal.append(close);
			this.innerModal.append('<h3>' + this.heading + '</h3>');
			this.innerModal.append(this.ul);
			this.innerModal.append(this.button);
			
			this.modal.append(this.innerModal);
			$('body').append(this.modal);
		}
		hide() {
			this.modal.fadeOut(400);
		}
		show() {
			this.modal.fadeIn(400);
		}
	}

	class FormList {
		constructor(input, ul) {
			var thisFormList = this;
			this.input = input;
			this.ul = ul;
			this.list = [];
			$(this.input).next().on('click', function(){
				if(thisFormList.input.val() != ''){
					thisFormList.addToList(thisFormList.input.val());
				}
			});
		}
		addToList(value) {
			this.input.val('');
			this.list.push(value);
			this.updateList();
		}
		removeFromList(index) {
			this.list.splice(index, 1);
			this.updateList();
		}
		reset() {
			this.list = [];
			this.ul.empty();
		}
		populate(items) {
			this.list = items;
			this.updateList();
		}
		getList() {
			return this.list;
		}
		updateList() {
			var thisFormList = this;
			this.ul.empty();
			for(i=0; i<this.list.length; i++){
				var li = $('<li><span>' + this.list[i] + '</span><span class="tagx">x</span></li>');
				li.on('click', function(){
					thisFormList.removeFromList($(this).index());
				});
				this.ul.append(li);
			}
		}
	}

	var formFields = [
		{id: 'q_name', validation: ''},
		{id: 'q_alias', validation: 'none'},
		{id: 'q_service', validation: 'none'}
	];

	var addForm = new Form('/api/industries/add', formFields);
	var editForm = new Form('/api/industries/update', formFields);

	var industryPopup = new PopUpForm(
		'Edit Industry', 
		'Save',
		[
			`
				<label>Industry Name</label>
				<input type="text" id="q_name" />
			`,
			`
				<label>Aliases</label>
				<input type="text" id="q_alias" class="inputPlus" /><button class="btn">+</button>
				<ul id="aliases" class="tagList"></ul>
			`,
			`
				<label>Services</label>
				<input type="text" id="q_service" class="inputPlus" /><button class="btn">+</button>
				<ul id="services" class="tagList"></ul>
			`
		]
	);

	var deletePopup = new PopUpForm('Are you sure?', 'Yes', [], function(){
		
		deletePopup.yesbutton.addClass('spinBtn');

		$.ajax({
			url: '/api/industries/' + catPage.industryid,
			method: 'DELETE',
			success: function(data){
				if(data.error){
					alert(data.error);
				}
				window.location.reload();
			}
		});

	});

	var aliasList = new FormList($('#q_alias'), $('#aliases'));
	var serviceList = new FormList($('#q_service'), $('#services'));

	var catPage = new CatPage(formFields, aliasList, serviceList);

	industryPopup.button.on('click', function(){

		var industryid = $(this).data('industryid');
		var thisBtn = $(this);
		thisBtn.addClass('spinBtn');

		var data = {
			name: $('#q_name').val(),
			aliases: aliasList.getList(),
			services: serviceList.getList()
		};

		switch(catPage.currentPopupform){
			case 'add':

				if(addForm.isValid()){
					addForm.send(data, function(data){
						if(data.error){
							thisBtn.removeClass('spinBtn');
							alert(data.error);
						}
						window.location.reload();
					});
				}

				break;
			case 'edit':

				data.industryid = catPage.industryid;

				if(editForm.isValid()){
					editForm.send(data, function(data){
						if(data.error){
							thisBtn.removeClass('spinBtn');
							alert(data.error);
						}
						window.location.reload();
					});
				}

				break;
			default:

		}

	});

	$('.add').on('click', function(){
		catPage.currentPopupform = 'add';
		catPage.emptyForm();
		$('#aliases').empty();
		$('#services').empty();
		industryPopup.show();
	});

	$('.edit').on('click', function(){
		catPage.currentPopupform = 'edit';
		catPage.industryid = $(this).data('industryid');
		catPage.emptyForm();
		$('#aliases').empty();
		$('#services').empty();
		catPage.getIndustry($(this).data('industryid'), function(){
			industryPopup.show();
		});
	});

	$('.delete').on('click', function(){
		catPage.industryid = $(this).data('industryid');
		deletePopup.show();
	});

	$('input[type="checkbox"]').on('change', function(){

		var allow_featured = $(this).is(':checked');
		var industryid = $(this).data('industryid');

		catPage.table.addClass('spinBtn');

		$.ajax({
			url: '/api/industries/toggle-featured',
			method: 'POST',
			data: {
				allow_featured: allow_featured,
				industryid: industryid
			},
			success: function(data){
				if(data.error){
					alert(data.error);
				}else{
					window.location.reload();
				}
			}
		});

	});

})(form.form);