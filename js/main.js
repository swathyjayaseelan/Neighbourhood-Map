var map;
var uniqueId = 1;
var markers = [];
//Map initialisation with default markers
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.6694649,
            lng: -117.8231107
        },
        zoom: 13
    });
    window.infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    var service = new google.maps.places.PlacesService(map);
    //Markers for all the default locations
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var ID = locations[i].yelpID;
        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            yelpID: ID
        });
        bounds.extend(marker.position);
        marker.id = uniqueId;
        markers.push(marker);
        marker.addListener('click', function() {
          var self=this;
            displayinfoWindow(self, infowindow);
            displayDetails(self);
        });
        uniqueId++;
    }
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });
    map.fitBounds(bounds);
}
//Display info window when a marker is clicked
function displayinfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        //getyelpData(marker.yelpid);
        //console.log(marker.yelpid);
        infowindow.setContent('<div>' + marker.title + '<div');
        infowindow.open(map, marker);
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker(null);
        });
    }
}
//To clear markers on map to display only the markers of locations that are selected
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
    }
}
//Display details when a location from the list is clicked and bounce the respective marker
function displayDetails(clickedLocation) {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].title === clickedLocation.title) {
            var self = markers[i];
            self.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){
            self.setAnimation(null);
          }, 2100);
            //console.log(clickedLocation.yelpID);
            getyelpData(clickedLocation.yelpID);
        }
    }
}
//ViewModel to link the data with UI
var ViewModel = function() {
    var self = this;
    self.location = ko.observableArray(locations);
    self.locationList = ko.observableArray([]);
    locations.forEach(function(data) {
        self.locationList.push(data);
    });
    self.details = ko.observable('');
    self.query = ko.observable('');
    //Search feature
    self.search = function(value){
      displayspecificMarker(value);
      console.log("here");
    }
    self.shouldShow = ko.observable('true');
    self.displayLocation = function(clickedLocation) {
        displayDetails(clickedLocation);
    };
    self.displaySpecificLocation = function(clickedLocation) {
        displayspecificMarker(clickedLocation);
    };
    self.setUp = function() {
        if ($('#myDropdown').hasClass('show')) {
            setMapOnAll(null);
            vm.locationList([]);
        }
    };
};
var vm = new ViewModel();
ko.applyBindings(vm);
vm.query.subscribe(vm.search);
//to refresh the map and list whenever refresh button is clikced
function refresh() {
    vm.locationList([]);
    locations.forEach(function(data) {
        vm.locationList.push(data);
    });
    vm.details('');
    initMap();
}
//to open the menu bar in mobile browsers
function myopen() {
    if ($('#sidebar').hasClass('menu')) {
        $('#sidebar').removeClass('menu');
        $('#sidebar').addClass('openbar');
    } else {
      $('#sidebar').removeClass('openbar');
        $('#sidebar').addClass('menu');
    }
}
//Function to handle the drop down menu, display the content and hide the existing list and hide the content and
//display the existing list
function myFunction() {
    document.getElementById('myDropdown').classList.toggle('show');
    if ($('#myDropdown').hasClass('show')) {
        vm.shouldShow(false);
    }
}
//function to display the marker when a location from the drop down menu is clicked
function displayspecificMarker(value) {
  vm.locationList([]);
  setMapOnAll(null);
  var finalValue = value.toLowerCase();
  for(var i=0; i<locations.length; i++){
    var locTitle = locations[i].title.toLowerCase();
    if((locTitle.indexOf(finalValue))>=0){
      /*var marker = new google.maps.Marker({
          position: locations[i].location,
          map: map,
          title: locations[i].title,
      });
      marker.addListener('click', function() {
          displayinfoWindow(this, infowindow);
      });
      markers.push(marker);*/
      console.log(markers[i].title);
      console.log(markers);
      markers[i].setVisible(true);
      vm.shouldShow(true);
      vm.locationList.push(locations[i]);
    }
  }

}
function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
}
//to connect to yelp API and display details
function getyelpData(yelpid) {
    console.log("hi");
    var yelpconsumerKey = 'Gd8UyTzfV-tWPSXws41oHw';
    var yelpconsumerSecret = 'UMIW-d64I_5-bmE40K_fTwhV8PU';
    var yelpToken = "A4b1JoCwcFuUGkfBTbhtn3biy76AFUlH";
    var yelptokenSecret = "fZh6o9yxyfgVAbrHJCiXEaM0D90";
    var yelpUrl = "https://api.yelp.com/v2/business/" + yelpid;
    var parameters = {
        oauth_consumer_key: yelpconsumerKey,
        oauth_token: yelpToken,
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',

        callback: 'cb'
    };
    var encodedSignature = oauthSignature.generate('GET', yelpUrl, parameters, yelpconsumerSecret, yelptokenSecret);
    parameters.oauth_signature = encodedSignature;

    var settings = {
        url: yelpUrl,
        data: parameters,
        cache: true,
        dataType: 'jsonp',
        success: function(results) {
            console.log(results.location.address);
            vm.details('<h4>' + results.name + '</h4><br>' +
                '<img src="' + results.rating_img_url + '" alt="Rating"><br>' +
                '<img src="' + results.image_url + '" alt="' + results.name + '"><br>' +
                '<p>Address: ' + results.location.address + ' </p>' +
                '<p>Tel:' + results.display_phone + ' </p>' +
                '<p>Link: <a href ="' + results.url + '">Open in Yelp</a></p>' +
                '<p>*From www.yelp.com*</p>');
        },
        error: function() {
            alert("Sorry ! an error has occured. Please refresh and try again");
        }
    };
    $.ajax(settings);
}
function displayError() {
  alert("Google Maps has failed to load. Please refresh the page ")
}
