var YeahTextEditor = (function(){

	function YeahTextEditor(){

		// if(ImgLib){
		// 	this.imgLib = ImgLib;
		// 	this.imgLib.onSelectImage(function(yeah){
		// 		document.execCommand($(this).data('command'), false, '/static/uploads/' + yeah);
		// 	});
		// }

		this.colorPalette = ['000000', 'FF9966', '6699FF', '99FF66', 'CC0000', '00CC00', '0000CC', '333333', '0066FF', 'FFFFFF'];
		this.forePalette = $('.fore-palette');
		this.backPalette = $('.back-palette');

		for (var i = 0; i < this.colorPalette.length; i++) {
			this.forePalette.append('<button data-command="forecolor" data-value="' + '#' + this.colorPalette[i] + '" style="background-color:' + '#' + this.colorPalette[i] + ';" class="palette-item"></button>');
			this.backPalette.append('<button data-command="backcolor" data-value="' + '#' + this.colorPalette[i] + '" style="background-color:' + '#' + this.colorPalette[i] + ';" class="palette-item"></button>');
		}

		var thisEditor = this;

		$('.toolbar button').click(function(e) {

			var command = $(this).data('command');

			if (command == 'h1' || command == 'h2' || command == 'p') {
				document.execCommand('removeFormat', false, null);
				document.execCommand('formatBlock', false, command);
			}
			if (command == 'forecolor' || command == 'backcolor') {
				document.execCommand($(this).data('command'), false, $(this).data('value'));
			}
			if (command == 'createlink') {
				url = prompt('Enter the link here: ', 'http:\/\/');
				document.execCommand($(this).data('command'), false, url);
			}
			if(command == 'insertimage'){

				// console.log('fgdfgfdvf', thisEditor.imgLib);

				// if(thisEditor.imgLib){
				// 	thisEditor.imgLib.openLibrary(this);
				// }else{
				// 	url = prompt('Enter the link here: ', 'http:\/\/');
				// 	document.execCommand($(this).data('command'), false, url);
				// }

			}else{
			 	document.execCommand($(this).data('command'), false, null);
			}

		});

	}

	return YeahTextEditor;  // exports;

})();