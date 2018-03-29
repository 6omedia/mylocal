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
	const pages = Math.round(totalDocs / docsPerPage);

	if(pages > 10){

		// const lastpage = pages; 
		// const middlePage = Math.round((currentPage / 2) - 3);

		// console.log('lastpage ', lastpage);
		// console.log('middlePage ', middlePage);

		// let current = '';
		// if(currentPage == 1){
		// 	current = 'active';
		// }
		// links += `
		// 	<li class="page-item ${current}">
		// 		<a class="page-link" href="${url}?page=1">1</a>
		// 	</li>
		// 	<li>...</li>
		// `;

		// for(let i=middlePage; i<6; i++){
		// 	const page = i+1;
		// 	current = '';
		// 	if(page == currentPage)
		// 		current = 'active';
		// 	links += `
		// 		<li class="page-item ${current}">
		// 			<a class="page-link" href="${url}?page=${page}">${page}</a>
		// 		</li>
		// 	`;
		// }

		// current = '';
		// if(currentPage == lastpage){
		// 	current = 'active';
		// }
		// links += `
		// 	<li>...</li>
		// 	<li class="page-item ${current}">
		// 		<a class="page-link" href="${url}?page=${lastpage}">${lastpage}</a>
		// 	</li>
		// `;

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

	}else{

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