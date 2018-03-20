var YeahAutocomplete = (function(){

	function Model(){

	}

	function View(input){
		this.input = $('#' + input);
		this.resultsList = $('<ul class="YeahAutocomplete_list"></ul>');
		this.resultsList.insertBefore(this.input);
		this.resultsList.hide();
	}
	View.prototype.startLoading = function(){
		this.input.addClass('yac_loading');
	};
	View.prototype.stopLoading = function(){
		this.input.removeClass('yac_loading');
	};
	View.prototype.displayResults = function(results, query, property){

		var thisView = this;
		this.resultsList.empty();
		for(i=0; i<results.length; i++){
			var result = results[i];
			var details = results[i];
			if(property){
				result = results[i][property];
			}

			// var resParts = results[i].split(query.toUpperCase());
			// if(resParts.length < 1){
			// 	resParts = results[i].split(query);
			// }

			// var resComplete = '';

			// console.log(resParts);

			// for(var j=0; j<resParts.length; j++){
			// 	console.log('PARTS ', resParts[j]);
			// 	if(resParts[j] == ''){
			// 		if(j == 0){
			// 			resComplete += '<b>' + query[0].toUpperCase() + '</b>';
			// 		}else{
			// 			resComplete += '<b>' + query + '</b>';
			// 		}
			// 	}else{
			// 		resComplete += resParts[j];
			// 	}
			// }

			var li = $('<li class="yac_li">' + result + '</li>');
			li.data('listing', details);
			li.on('click', function(){
				thisView.input.val($(this).text());
				thisView.input.data('listing', $(this).data('listing'));
				thisView.input.trigger("resultSelected");
				thisView.resultsList.hide();
			});
			this.resultsList.append(li);
		}
		this.resultsList.show();

	};

	function YeahAutocomplete(options){

		var thisYac = this;

		this.view = new View(options.input);
		this.model = new Model();
	
		this.dataUrl = options.dataUrl;
		this.onResults = null;

		if(options.onResults){
			this.onResults = options.onResults;
		}

		this.view.input.on('input', function(){
			thisYac.getResults($(this).val(), thisYac.dataUrl, options.method, {}, options.arrName, options.property);
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

	YeahAutocomplete.prototype.getResults = function(query, url, method, dataObj, arrName, property){
		
		var thisYac = this;
		this.view.startLoading();

		if(query == ''){
			query = 'noterm';
		}

		if(method == 'GET'){

			$.ajax({
				url: url + query,
				method: 'GET',
				success: function(data){

					if(!thisYac.onResults){
						try {
							thisYac.view.displayResults(data[arrName], query, property);
							thisYac.view.stopLoading();
						}catch(e){
							thisYac.view.stopLoading();
						}
					}else{

						thisYac.onResults(data[arrName]);

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