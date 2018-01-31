var exports = {};

function getSkip(page, docsPerPage) {

	let skip = 0; 
	if(page){
	 	skip = (page - 1) * docsPerPage;
	}
	return skip;

}

function getLinks(totalDocs, docsPerPage, currentPage, url = '') {

	let links = '<ul class="pagination">';
	const pages = totalDocs / docsPerPage;

	for(let i=0; i<pages; i++){
		const page = i+1;
		let current = '';
		if(page == currentPage)
			current = 'active';
		links += `
			<li class="page-item ${current}">
				<a class="page-link" href="${url}?page=${page}">${page}</a>
			</li>
		`;
	}

	links += '</ul>';

	return links;

}

exports.getSkip = getSkip;
exports.getLinks = getLinks;
module.exports = exports;

/*
	// Chain on the the query...
	.limit(docsPerPage)
	.skip(pagination.getSkip(req.query.page, docsPerPage))
	// return in the res.render obj... 
	paginationLinks: pagination.getLinks(count, docsPerPage, req.query.page)
	// output in pug...
	.paginationLinks !{paginationLinks}
	// default css if needed...
*/