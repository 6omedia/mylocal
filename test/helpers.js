const each = require('async-each'); 

function mockCollection(jsonArray, Model, callback){

	Model.remove({}, () => {
		each(jsonArray, (jsonObj, next) => {

			const doc = new Model(jsonObj);
			doc.save()
				.then((doc) => {
					next();
				})
				.catch((e) => {
					console.log('error');
					console.log(e);
				});

		}, function(err){
			callback();
		});
	});

}

function mockAssign(){

	
	
}

exports.mockCollection = mockCollection;
module.exports = exports;