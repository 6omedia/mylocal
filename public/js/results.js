var maplistings = [];

(function(){

	var searchResults = $('#searchResults');
	var dataBlock = $('#datablock');
	var industry = dataBlock.data('industry');
	var town = dataBlock.data('town');

	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
		function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}

	function getListings(industry, town, callback){

		var page = getUrlVars()["page"] || 1;

        $.ajax({
            url: '/api/listings/find/' + industry + '/' + town + '?page=' + page,
            method: 'GET',
            success: function(data){
                callback(data);
            },
            error: function(a, b, c){
                callback(a);
            }
        });
    }

    searchResults.empty();

    /**** CITYBOOK MAP ****/

    var markerIcon = {
        anchor: new google.maps.Point(22, 16),
        url: '/static/img/citybook/marker.png',
    }
    function mainMap() {
        function locationData(locationURL, locationCategory, locationImg, locationTitle, locationAddress, locationPhone, locationStarRating, locationRevievsCounter) {
            return ('<div class="map-popup-wrap"><div class="map-popup"><div class="infoBox-close"><i class="fa fa-times"></i></div><div class="map-popup-category">' + locationCategory + '</div><a href="' + locationURL + '" class="listing-img-content fl-wrap"><img src="' + locationImg + '" alt=""></a> <div class="listing-content fl-wrap"><div class="card-popup-raining map-card-rainting" data-staRrating="' + locationStarRating + '"><span class="map-popup-reviews-count">( ' + locationRevievsCounter + ' reviews )</span></div><div class="listing-title fl-wrap"><h4><a href=' + locationURL + '>' + locationTitle + '</a></h4><span class="map-popup-location-info"><i class="fa fa-map-marker"></i>' + locationAddress + '</span><span class="map-popup-location-phone"><i class="fa fa-phone"></i>' + locationPhone + '</span></div></div></div></div>')
        }

        var locations = [];

        getListings(industry, town, function(data){

	        if(data.listings){

	            if(data.correction){
	                searchResults.append("<p class='noresults'>Did you mean " + data.correction);
	            }

	            var string = '';

	            $.each(data.listings, function(i, listing){

	                var theLogo = '';

	                if(listing.branding.logo != '/static/img/admin/placeholder-logo.png' && listing.branding.logo != undefined){
	                    theLogo = `<img src="${listing.branding.logo}" class="logo">`;
	                }

	                var stars = '';
	                var aStar = '<i class="fa fa-star"></i>';

	                for(i=0; i<listing.overall_rating / 2; i++){
	                	stars += aStar;
	                }

		            locations.push([
		                locationData(
		                    '/listing/' + listing.slug, 
		                    listing.industry, 
		                    listing.bgimage, 
		                    listing.business_name, 
		                    listing.address.line_one + ', ' + listing.address.town + ', ' + listing.address.post_code, 
		                    listing.contact.phone, 
		                    listing.overall_rating / 2 || '', 
		                    listing.reviews.length
		                ), 
		                listing.loc[1], 
		                listing.loc[0], 
		                1, 
		                markerIcon
		            ]);

	                string += `
	                    <div class="listing-item">
	                        <article class="geodir-category-listing fl-wrap">
	                            <div class="geodir-category-img">
	                                <img src="${listing.bgimage}" alt="">
	                                <div class="overlay"></div>
	                                <div class="list-post-counter"><span>${listing.favourited}</span><i class="fa fa-heart"></i></div>
	                            </div>
	                            <div class="geodir-category-content fl-wrap">
	                                <a class="listing-geodir-category" href="/listing/${listing.slug}">${listing.industry}</a>
	                                <div class="listing-avatar">
	                                	<a href="/listing/${listing.slug}"><img src="${listing.branding.logo}" alt=""></a>
	                                </div>
	                                <h3><a href="/listing/${listing.slug}">${listing.business_name}</a></h3>
	                                <p>${listing.preview}</p>
	                                <div class="geodir-category-options fl-wrap">
	                                    <div class="listing-rating card-popup-rainingvis" data-starrating2="${listing.rating}">
	                                    	${stars}
	                                        <span>(${listing.reviews.length} reviews)</span>
	                                    </div>
	                                    <div class="geodir-category-location"><a href="#"><i class="fa fa-map-marker" aria-hidden="true"></i> ${listing.address.line_one}, ${listing.address.town}, ${listing.address.post_code}</a></div>
	                                </div>
	                            </div>
	                        </article>
	                    </div>
	                `;

	            });

	            string += data.pagination;

	            searchResults.append(string);
	            searchResults.removeClass('loading');

	            /* Rest of city maps stuff */

		        var mapZoomAttr = $('#map-main').attr('data-map-zoom');
		        var mapScrollAttr = $('#map-main').attr('data-map-scroll');
		        if (typeof mapZoomAttr !== typeof undefined && mapZoomAttr !== false) {
		            var zoomLevel = parseInt(mapZoomAttr);
		        }
		        else {
		            var zoomLevel = 10;
		        }
		        if (typeof mapScrollAttr !== typeof undefined && mapScrollAttr !== false) {
		            var scrollEnabled = parseInt(mapScrollAttr);
		        }
		        else {
		            var scrollEnabled = false;
		        }
		        $('.nextmap-nav').on("click", function (e) {
		            e.preventDefault();
		            map.setZoom(14);
		            var index = currentInfobox;
		            if (index + 1 < allMarkers.length) {
		                google.maps.event.trigger(allMarkers[index + 1], 'click');
		            }
		            else {
		                google.maps.event.trigger(allMarkers[0], 'click');
		            }
		        });
		        $('.prevmap-nav').on("click", function (e) {

		            e.preventDefault();
		            map.setZoom(14);
		            if (typeof (currentInfobox) == "undefined") {
		                google.maps.event.trigger(allMarkers[allMarkers.length - 1], 'click');
		            }
		            else {
		                var index = currentInfobox;
		                if (index - 1 < 0) {
		                    google.maps.event.trigger(allMarkers[allMarkers.length - 1], 'click');
		                }
		                else {
		                    google.maps.event.trigger(allMarkers[index - 1], 'click');
		                }
		            }
		        });
		        var map = new google.maps.Map(document.getElementById('map-main'), {
		            zoom: zoomLevel,
		            scrollwheel: scrollEnabled,
		            center: new google.maps.LatLng(51.449869, -0.205010),
		            mapTypeId: google.maps.MapTypeId.ROADMAP,
		            zoomControl: false,
		            mapTypeControl: false,
		            scaleControl: false,
		            panControl: false,
		            navigationControl: false,
		            streetViewControl: false,
		            animation: google.maps.Animation.BOUNCE,
		            gestureHandling: 'cooperative',
		            styles: [{
		                    "featureType": "administrative",
		                    "elementType": "labels.text.fill",
		                    "stylers": [{
		                        "color": "#444444"
		                    }]
		                }
		            ]
		        });
		        var boxText = document.createElement("div");
		        boxText.className = 'map-box'
		        var currentInfobox;
		        var boxOptions = {
		            content: boxText,
		            disableAutoPan: true,
		            alignBottom: true,
		            maxWidth: 300,
		            pixelOffset: new google.maps.Size(-140, -45),
		            zIndex: null,
		            boxStyle: {
		                width: "260px"
		            },
		            closeBoxMargin: "0",
		            closeBoxURL: "",
		            infoBoxClearance: new google.maps.Size(1, 1),
		            isHidden: false,
		            pane: "floatPane",
		            enableEventPropagation: false,
		        };
		        var markerCluster, marker, i;
		        var allMarkers = [];
		        var clusterStyles = [{
		            url: '',
		            height: 40,
		            width: 40
		        }];
		        var zoomControlDiv = document.createElement('div');
		        var zoomControl = new ZoomControl(zoomControlDiv, map);
		        function ZoomControl(controlDiv, map) {
		            zoomControlDiv.index = 1;
		            map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(zoomControlDiv);
		            controlDiv.style.padding = '5px';
		            var controlWrapper = document.createElement('div');
		            controlDiv.appendChild(controlWrapper);
		            var zoomInButton = document.createElement('div');
		            zoomInButton.className = "mapzoom-in";
		            controlWrapper.appendChild(zoomInButton);
		            var zoomOutButton = document.createElement('div');
		            zoomOutButton.className = "mapzoom-out";
		            controlWrapper.appendChild(zoomOutButton);
		            google.maps.event.addDomListener(zoomInButton, 'click', function () {
		                map.setZoom(map.getZoom() + 1);
		            });
		            google.maps.event.addDomListener(zoomOutButton, 'click', function () {
		                map.setZoom(map.getZoom() - 1);
		            });
		        }
		        for(i = 0; i < locations.length; i++) {
		            marker = new google.maps.Marker({
		                animation: google.maps.Animation.DROP,
		                position: new google.maps.LatLng(locations[i][1],
		                    locations[i][2]),
		                icon: locations[i][4],
		                id: i
		            });
		            allMarkers.push(marker);
		            var ib = new InfoBox();
		            google.maps.event.addListener(ib, 'domready', function () {
		                cardRaining();
		            });
		            google.maps.event.addListener(marker, 'click', (function (marker, i) {
		                return function () {
		                    ib.setOptions(boxOptions);
		                    boxText.innerHTML = locations[i][0];
		                    ib.open(map, marker);
		                    currentInfobox = marker.id;
		                    var latLng = new google.maps.LatLng(locations[i][1], locations[i][2]);
		                    map.panTo(latLng);
		                    map.panBy(0, -180);
		                    google.maps.event.addListener(ib, 'domready', function () {
		                        $('.infoBox-close').click(function (e) {
		                            console.log('Close');
		                            e.preventDefault();
		                            ib.close();
		                        });
		                    });
		                }
		            })(marker, i));
		        }
		        var options = {
		            imagePath: 'images/',
		            styles: clusterStyles,
		            minClusterSize: 2
		        };
		        markerCluster = new MarkerClusterer(map, allMarkers, options);
		        google.maps.event.addDomListener(window, "resize", function () {
		            var center = map.getCenter();
		            google.maps.event.trigger(map, "resize");
		            map.setCenter(center);
		        });

		        // Go to first listing

	            map.setZoom(14);
	            var index = currentInfobox;
	            if (index + 1 < allMarkers.length) {
	                google.maps.event.trigger(allMarkers[index + 1], 'click');
	            }
	            else {
	                google.maps.event.trigger(allMarkers[0], 'click');
	            }

	        }else{

	            searchResults.append("<p class='noresults'>Sorry, couldn't find any " + industry + " in " + town + "</p>");
	            searchResults.removeClass('loading');

	        }

	    });
    }
    var map = document.getElementById('map-main');
    if (typeof (map) != 'undefined' && map != null) {
        google.maps.event.addDomListener(window, 'load', mainMap);
    }
    function singleMap() {
        var myLatLng = {
            lng: $('#singleMap').data('longitude'),
            lat: $('#singleMap').data('latitude'),
        };
        var single_map = new google.maps.Map(document.getElementById('singleMap'), {
            zoom: 14,
            center: myLatLng,
            scrollwheel: false,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            panControl: false,
            navigationControl: false,
            streetViewControl: false,
            styles: [{
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{
                    "color": "#f2f2f2"
                }]
            }]
        });
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: single_map,
            icon: markerIcon,
            title: 'Our Location'
        });
        var zoomControlDiv = document.createElement('div');
        var zoomControl = new ZoomControl(zoomControlDiv, single_map);
        function ZoomControl(controlDiv, single_map) {
            zoomControlDiv.index = 1;
            single_map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(zoomControlDiv);
            controlDiv.style.padding = '5px';
            var controlWrapper = document.createElement('div');
            controlDiv.appendChild(controlWrapper);
            var zoomInButton = document.createElement('div');
            zoomInButton.className = "mapzoom-in";
            controlWrapper.appendChild(zoomInButton);
            var zoomOutButton = document.createElement('div');
            zoomOutButton.className = "mapzoom-out";
            controlWrapper.appendChild(zoomOutButton);
            google.maps.event.addDomListener(zoomInButton, 'click', function () {
                single_map.setZoom(single_map.getZoom() + 1);
            });
            google.maps.event.addDomListener(zoomOutButton, 'click', function () {
                single_map.setZoom(single_map.getZoom() - 1);
            });
        }
    }
    var single_map = document.getElementById('singleMap');
    if (typeof (single_map) != 'undefined' && single_map != null) {
        google.maps.event.addDomListener(window, 'load', singleMap);
    }

})();