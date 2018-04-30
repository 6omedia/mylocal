var utils = (function(){

	var exports = {};

    function Message(){
    	
    	this.msgBox = $('<div class="theError slim"></div>');
    	this.closeBtn = $('<span class="icon"><i class="fa fa-times-circle"></i></span>');
    	this.msgElem = $('<span class="inline_text"></span>');

        this.closeBtn.on('click', function(){
            this.msgBox.hide();
        }.bind(this));

    	this.msgBox.hide();

    	this.msgBox.append(this.msgElem);
    	this.msgBox.append(this.closeBtn);

    	$('body').append(this.msgBox);

    }

    Message.prototype.display = function(msg, isError, persist) {
    	
        var thisMsg = this;
    	this.msgElem.text(msg);

    	if(isError){
    		this.msgBox.addClass('error');
    	}else{
            this.msgBox.removeClass('error');
        }

        this.msgBox.show();

        if(!persist){
        	setTimeout(
	        function(){
	            thisMsg.msgBox.fadeOut(400);
	        }, 3000);
        }

    };

    exports.Message = Message;
    return exports;

})();