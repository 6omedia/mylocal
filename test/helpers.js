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

		}, (err) => {
			if(err){console.log(err);}
			callback();
		});
	});

}

function mockCollections(mockArray, callback){

	each(mockArray, (obj, next) => {

		mockCollection(obj.jsonArray, obj.Model, () => { next(); });

	}, (err) => {
		callback();
	});
	
}

exports.mockCollection = mockCollection;
exports.mockCollections = mockCollections;
module.exports = exports;