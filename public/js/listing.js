(function(LightBox, PopUp, Form){

	var lightBox = new LightBox();

	$('.cb_gallery img').on('click', function(e){
		lightBox.openImg($(this).parent().index());
	});

	/* Rating */

	var ratingPopUp = new PopUp(() => {}, () => {}, {custom_class: 'review'});

	$('.wrtieReview').on('click', function(){

		ratingPopUp.popUp('', `
			<h1>Leave a Review</h1>
			<div class="form">
				<ul>
					<li>
						<label>Rating</label>
						<div class="rating">
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span class="nostar"></span>
						</div>
					</li>
					<li>
						<label>Review</label>
						<textarea class="writenreview" id="q_review"></textarea>
					</li>
					<li>
						<button class="btnSubmit">Submit Review</button>
					</li>
				</ul>
			</div>
		`);

	});

	$('body').on('mouseover', '.box .rating span', function(){
		var stars = $(this).index() + 1;
		$('.box .rating span').each(function(i){
			if(i < stars){
				$(this).removeClass('nostar');
			}else{
				$(this).addClass('nostar');
			}
		});
	});

	function getRating(){

		var rating = 0;

		$('.box .rating span').each(function(){
			console.log('gr', this);
			if(!$(this).hasClass('nostar')){
				rating++;
			}
		});

		return rating * 2;

	}

	var ratingForm = new Form('/api/reviews/add', [
			{ id: 'q_review', validation: '' }
		]);

	$('body').on('click', '.btnSubmit', function(){

		var btnSubmit = $(this);
		btnSubmit.addClass('spinBtn');

		if(ratingForm.isValid()){
			ratingForm.send({
				listingid: $('#page-listing').data('listingid'),
				rating: getRating(),
				review: $('#q_review').val()
			}, function(data){
				
				if(data.responseJSON){
					var msg = new Message(data.responseJSON.error, true, $('#yeahMsg'));
					msg.display();
				}else{
					if(data.error){
						var msg = new Message(data.error, true, $('#yeahMsg'));
						msg.display();
					}else{
						var msg = new Message(data.success, false, $('#yeahMsg'));
						msg.display();
					}
				}
				
				ratingPopUp.popDown();
				btnSubmit.removeClass('spinBtn');
			});
		}

	});

	/// LOADING REVIEWS ///

	var reviewBox = $('.theReviews');

	$('.theReviews a').on('click', function(){

		if(reviewBox.hasClass('shorter')){
			reviewBox.removeClass('shorter');
			$(this).text('less reviews');
		}else{
			reviewBox.addClass('shorter');
			$(this).text('more reviews');
		}
		
	});

})(LightBox, PopUp, form.form);