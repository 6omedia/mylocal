var listingModel = (function(){

	var exports = {};

	var formArray = [
		{
			id: 'q_business_name',
			validation: ''
		},
		{
			id: 'q_description',
			validation: ''
		},
		{
			id: 'q_industry',
			validation: ''
		},
		{
			id: 'q_address_lineone',
			validation: ''
		},
		{
			id: 'q_address_linetwo',
			validation: 'none'
		},
		{
			id: 'q_town',
			validation: ''
		},
		{
			id: 'q_postcode',
			validation: ''
		},
		{
			id: 'q_phone',
			validation: ''
		},
		{
			id: 'q_email',
			validation: 'email'
		},
		{
			id: 'q_website',
			validation: ''
		},
		{
			id: 'q_mon_open',
			validation: ''
		},
		{
			id: 'q_mon_close',
			validation: ''
		},
		{
			id: 'q_tues_open',
			validation: ''
		},
		{
			id: 'q_tues_close',
			validation: ''
		},
		{
			id: 'q_wed_open',
			validation: ''
		},
		{
			id: 'q_wed_close',
			validation: ''
		},
		{
			id: 'q_thurs_open',
			validation: ''
		},
		{
			id: 'q_thurs_close',
			validation: ''
		},
		{
			id: 'q_fri_open',
			validation: ''
		},
		{
			id: 'q_fri_close',
			validation: ''
		},
		{
			id: 'q_sat_open',
			validation: ''
		},
		{
			id: 'q_sat_close',
			validation: ''
		},
		{
			id: 'q_sun_open',
			validation: ''
		},
		{
			id: 'q_sun_close',
			validation: ''
		},
		{
			id: 'q_services',
			validation: 'none'
		},
		{
			id: 'q_fb',
			validation: 'none'
		},
		{
			id: 'q_tw',
			validation: 'none'
		},
		{
			id: 'q_ig',
			validation: 'none'
		},
		{
			id: 'q_gp',
			validation: 'none'
		},
		{
			id: 'q_yt',
			validation: 'none'
		},
		{
			id: 'q_li',
			validation: 'none'
		},
		{
			id: 'q_pi',
			validation: 'none'
		},
		{
			id: 'q_logo',
			validation: 'none'
		},
		{
			id: 'q_bgimage',
			validation: 'none'
		},
		{
			id: 'q_gallery',
			validation: 'none'
		}
	];

	function getServices(){

		var arr = [];
		$('#services li img').each(function(){
			arr.push($(this).attr('src'));
		});
		return arr;

	}
	
	function getGallery(){

		var arr = [];
		$('#gallery li img').each(function(){
			arr.push($(this).attr('src'));
		});
		return arr;

	}

	function getModel(form){
		return {
			business_name: $('#' + form.fields[0].id).val(),
			description: $('#' + form.fields[1].id).val(),
			industry: $('#' + form.fields[2].id).val(),
			services: getServices(),
			gallery: getGallery(),
			address: {
				line_one: $('#' + form.fields[3].id).val(),
				line_two: $('#' + form.fields[4].id).val(),
				town: $('#' + form.fields[5].id).val(),
				post_code: $('#' + form.fields[6].id).val()
			},
			contact: {
				phone: $('#' + form.fields[7].id).val(),
				email: $('#' + form.fields[8].id).val(),
				website: $('#' + form.fields[9].id).val()
			},
			opening_hours: {
				Monday: {
					open: $('#' + form.fields[10].id).val(),
					close: $('#' + form.fields[11].id).val()
				},
				Tuesday: {
					open: $('#' + form.fields[12].id).val(),
					close: $('#' + form.fields[13].id).val()
				},
				Wednesday: {
					open: $('#' + form.fields[14].id).val(),
					close: $('#' + form.fields[15].id).val()
				},
				Thursday: {
					open: $('#' + form.fields[16].id).val(),
					close: $('#' + form.fields[17].id).val()
				},
				Friday: {
					open: $('#' + form.fields[18].id).val(),
					close: $('#' + form.fields[19].id).val()
				},
				Saturday: {
					open: $('#' + form.fields[20].id).val(),
					close: $('#' + form.fields[21].id).val()
				},
				Sunday: {
					open: $('#' + form.fields[22].id).val(),
					close: $('#' + form.fields[23].id).val()
				}
			},
			social: {
				icons: {
					facebook: $('#' + form.fields[25].id).val(),
					twitter: $('#' + form.fields[26].id).val(),
					instagram: $('#' + form.fields[27].id).val(),
					googleplus: $('#' + form.fields[28].id).val(),
					youtube: $('#' + form.fields[29].id).val(),
					linkedin: $('#' + form.fields[30].id).val(),
					pinterest: $('#' + form.fields[31].id).val()
				}
			}
		};
	}

	exports.formArray = formArray;
	exports.getModel = getModel;
	return exports;

})();