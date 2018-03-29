function requiredPostProps(props, body) {

	props.forEach((prop) => {
		if(!body[prop]){
			return 'Missing Property ' + prop; 
		}
	});

	return true;

}

function slugify(text){

	return text.toString().toLowerCase().replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');

}

function slugifyListing(name, town, id){

	var strg = name + '-' + town + '-' + id;

    return strg.toString().toLowerCase().replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');

}

exports.requiredPostProps = requiredPostProps;
exports.slugify = slugify;
exports.slugifyListing = slugifyListing;
module.exports = exports;