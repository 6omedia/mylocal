var YeahAutocomplete = (function(){

	function Model(){

	}

	function View(input){
		this.input = $('#' + input);
		this.resultsList = $('<ul class="YeahAutocomplete_list"></ul>');
		this.resultsList.insertAfter(this.input);
		this.resultsList.hide();
	}
	View.prototype.startLoading = function(){
		this.input.addClass('yac_loading');
	};
	View.prototype.stopLoading = function(){
		this.input.removeClass('yac_loading');
	};
	View.prototype.displayResults = function(results, query, property, alterResults){

		var thisView = this;
		this.resultsList.empty();
		for(i=0; i<results.length; i++){
			var result = results[i];
			var details = results[i];

			if(alterResults){
				result = alterResults(result);
			}

			if(property){
				result = results[i][property];
			}

			if(i == 0){
				var li = $('<li class="yac_li focused">' + result + '</li>');
			}else{
				var li = $('<li class="yac_li">' + result + '</li>');
			}

			li.data('listing', details);
			li.on('click', function(){
				var selectedHtml = $(this).html();
				var endIndex = selectedHtml.indexOf('<');
				if(endIndex == -1){
					endIndex = selectedHtml.length;
				}
				var selected = selectedHtml.substr(0, endIndex).trim();
				thisView.selectLi(selected, $(this).data('listing'));
			});
			this.resultsList.append(li);
		}
		this.resultsList.show();

	};
	View.prototype.selectLi = function(selected, listing){
		if(this.resultsList.is(":visible")){
			this.input.val(selected);
			this.input.data('listing', listing);
			this.input.trigger("resultSelected", listing);
			this.resultsList.hide();
		}
	};

	function YeahAutocomplete(options){

		var thisYac = this;

		this.view = new View(options.input);
		this.model = new Model();
	
		this.dataUrl = options.dataUrl;
		this.alter_results = options.alter_results || null;
		this.onResults = null;
		this.ajaxInProg = false;

		this.liFocusIndex = 0;
		this.liFocus = null;

		if(options.onResults){
			this.onResults = options.onResults;
		}

		this.view.input.on('input', function(){
			// check if previous ajax call has finished
			if(!thisYac.ajaxInProg){
				thisYac.getResults($(this).val(), thisYac.dataUrl, options.method, {}, options.arrName, options.property);
			}
		});

		$(document).keydown(function(e) {
		    switch(e.which) {
		        case 38: // up
		        	
		        	thisYac.upList();

		        break;

		        case 40: // down
		        	
		        	thisYac.downList();

		        break;

		        case 13: // enter

		        	if(thisYac.liFocus){
		        		thisYac.view.selectLi(thisYac.liFocus.text(), thisYac.liFocus.data('listing'));
		        	}

		        break;

		        default: return; // exit this handler for other keys
		    }
		    e.preventDefault(); // prevent the default action (scroll / move caret)
		});

		if(!options.allowFreeType){
			this.view.input.on('blur', function(){
				$(this).val('');
			});
		}

		$('body').on('click', function(e){
			if(!$(e.target).hasClass('yac_li')){
				thisYac.view.resultsList.hide();
			}
		});

	}

	YeahAutocomplete.prototype.downList = function(){
		var lis = this.view.resultsList.find('li');
		var listLength = lis.length;
		
		if(this.liFocusIndex < listLength){
			this.liFocusIndex++;
		}
		
		lis.removeClass('focused');
		if(listLength > 0){
			var focused = $(lis[this.liFocusIndex]);
			focused.addClass('focused');
			this.liFocus = focused;
		}
	};

	YeahAutocomplete.prototype.upList = function(){
		var lis = this.view.resultsList.find('li');
		var listLength = lis.length;
		
		if(this.liFocusIndex > 0){
			this.liFocusIndex--;
		}
		
		lis.removeClass('focused');
		if(listLength > 0){
			var focused = $(lis[this.liFocusIndex]);
			focused.addClass('focused');
			this.liFocus = focused;
		}
	};

	YeahAutocomplete.prototype.getResults = function(query, url, method, dataObj, arrName, property){
		
		var thisYac = this;
		this.view.startLoading();
		this.ajaxInProg = true;

		if(query == ''){
			query = 'noterm';
		}

		if(method == 'GET'){

			$.ajax({
				url: url + query,
				method: 'GET',
				success: function(data){

					// console.log(data);
					// console.log(arrName);

					if(!thisYac.onResults){
						try {
							thisYac.view.displayResults(data[arrName], query, property, thisYac.alter_results);
							thisYac.view.stopLoading();
						}catch(e){
							thisYac.view.stopLoading();
						}
					}else{

						thisYac.onResults(data[arrName]);

					}

					thisYac.ajaxInProg = false;
					thisYac.liFocusIndex = 0;
					if(data[arrName].length > 0){
						thisYac.liFocus = $($(thisYac.view.resultsList).children()[0]);
					}

				},
				error: function(){
					thisYac.view.stopLoading();
				}
			});

		}else{

			$.ajax({
				url: url,
				method: 'POST',
				data: dataObj,
				success: function(data){
					thisYac.view.stopLoading();
				},
				error: function(){
					thisYac.view.stopLoading();
				}
			});

		}

	};

	YeahAutocomplete.prototype.updateUrl = function(url){
		this.dataUrl = url;
	};

	return YeahAutocomplete;

}());