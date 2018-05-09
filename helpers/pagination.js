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

		let page = currentPage - 1;

		if(currentPage > 1){
			links += `
				<li class="page-item">
					<a class="page-link" href="${url}?page=${page}">Previous</a>
				</li>
			`;
		}

		let loopStart = 0;

		// if(currentPage > 5){
		// 	if(currentPage >= pages - 9){
		// 		loopStart = currentPage - 8;
		// 	}else{
		// 		loopStart = currentPage - 5;
		// 	}
		// }

		loopStart = currentPage - 5;
		
		let loopAmount = parseInt(loopStart) + 9;

		for(let i=loopStart; i < loopAmount; i++){
			
			page = parseInt(i)+1;
			let current = '';
			if(page == currentPage)
				current = 'active';
			links += `
				<li class="page-item ${current}">
					<a class="page-link" href="${url}?page=${page}">${page}</a>
				</li>
			`;

			if(page >= pages){
				break;
			}

		}

		page = parseInt(currentPage) + 1;

		if(page <= pages){

			links += `
				<li class="page-item">
					<a class="page-link" href="${url}?page=${page}">Next</a>
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

// function getLinks(totalDocs, docsPerPage, currentPage, url = '') {

// 	let links = '<ul class="pagination">';
// 	const pages = Math.round(totalDocs / docsPerPage);

// 	if(pages > 10){

// 		for(let i=0; i<pages; i++){
// 			const page = i+1;
// 			let current = '';
// 			if(page == currentPage)
// 				current = 'active';
// 			links += `
// 				<li class="page-item ${current}">
// 					<a class="page-link" href="${url}?page=${page}">${page}</a>
// 				</li>
// 			`;
// 		}

// 	}else{

// 		for(let i=0; i<pages; i++){
// 			const page = i+1;
// 			let current = '';
// 			if(page == currentPage)
// 				current = 'active';
// 			links += `
// 				<li class="page-item ${current}">
// 					<a class="page-link" href="${url}?page=${page}">${page}</a>
// 				</li>
// 			`;
// 		}

// 	}

// 	links += '</ul>';

// 	return links;

// }

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