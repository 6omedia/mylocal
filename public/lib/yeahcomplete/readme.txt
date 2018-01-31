Include yeahcomplete.js before your main script
add css to style sheet and spin.gif

USEAGE

var industryAutocomplete = new YeahAutocomplete({
	input: 'auto_industries',
	allowFreeType: true,
	dataUrl: '/api/tags/search/industries',
	method: 'GET',
	arrName: 'tags',
	property: 'name'
});