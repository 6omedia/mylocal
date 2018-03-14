function requiredPostProps(props, body) {

	props.forEach((prop) => {
		if(!body[prop]){
			return 'Missing Property ' + prop; 
		}
	});

	return true;

}

exports.requiredPostProps = requiredPostProps;
module.exports = exports;