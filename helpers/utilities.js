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

function titleCase(str){
	str = str.toLowerCase().split(' ');
	for(var i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
	}
	return str.join(' ');
}

exports.requiredPostProps = requiredPostProps;
exports.slugify = slugify;
exports.slugifyListing = slugifyListing;
exports.titleCase = titleCase;
module.exports = exports;