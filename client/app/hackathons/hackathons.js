angular.module('hackerFlights.hackathons', ['ui.router'])
.config(function($stateProvider){
	$stateProvider.state('hackathons', {
		templateUrl : '/app/hackathons/hackathons.html',
		url : '/hackathons/:airportLocation',
		controller : 'hackathonsController'
	});
})
.controller("hackathonsController" ,function($scope, $rootScope, $stateParams){
	const makeSelectedNearestAirportObject = (cityAndState = '', code = '') => {
		return {
			cityAndState, code
		};
	};

	$scope.hackathons = [];
	$scope.showNoHackathonMessage = false;
	$scope.showSpinners = true;
	$scope.selectedNearestAirportToOrigin = makeSelectedNearestAirportObject();
	$scope.selectedNearestAirportToHackathon = makeSelectedNearestAirportObject();
	$scope.top10NearestAirportsToOrigin = [];
	$scope.isTop10NearestAirportsToOriginFetched = false

	const listHackerFlights = (airportLocation) => {
		socket.emit('hackerFlights.airportLocation', { airportLocation });
	};

	$scope.getCheapestPrice = ({ airportCode: destination, dates }, { code: origin }) => {
		socket.emit('hackerFlights.getCheapestPrice', {
			origin,
			destination,
			departureDate: dates[0],
			returnDate: dates[1],
		});
	}

	socket.on('hackerFlights.getCheapestPrice', (data) => {
		console.log({
			data
		});
	});

	listHackerFlights($stateParams.airportLocation);

	socket.on('hackerFlights.hackathon', function({ hackathon }){
		$rootScope.$apply(function(){
			if( hackathon ) {
				if (!$scope.isTop10NearestAirportsToOriginFetched) {
					$scope.isTop10NearestAirportsToOriginFetched = true;
					$scope.top10NearestAirportsToOrigin = hackathon.nearestAirportsToOrigin;
				}
				$scope.selectedNearestAirportToOrigin = makeSelectedNearestAirportObject(
					hackathon.originLocation,
					hackathon.originalLocationCode
				);

				$scope.hackathons.push(hackathon);
			} else {
				$scope.showSpinners = false;
				$scope.showNoHackathonMessage = true;

				return;
			}

			if(hackathon == null) { 
				$scope.showSpinners = false;
				$scope.showNoHackathonMessage = true;
			} else if(hackathon.numberOfHackathons == $scope.hackathons.length) {
				$scope.showSpinners = false;
				$scope.showNoHackathonMessage = false;	
			}
		});
	});

	$scope.fetchPricesForANearestAirport = (airport, airportCode) => {
		$scope.hackathons = [];
		$scope.showSpinners = true;
		$scope.showNoHackathonMessage = false;
		$scope.selectedNearestAirportToOrigin = makeSelectedNearestAirportObject(
			airport,
			airportCode
		);
		listHackerFlights(airport);
	}
});

// helper function that concatinates '0' on single digit numbers 
var pad = function(data){
	var count = 0;
	while(count < data.length)
	{
		for(var i = 0; i < data[count].dates.length; i++)
		{
			if(data[count].dates[i][0] < 10)
			{
				data[count].dates[i][0] = "0" + data[count].dates[i][0];
			}
			if(data[count].dates[i][1] < 10)
			{
				data[count].dates[i][1] = "0" + data[count].dates[i][1];
			}
		}
		count++;
	}
	return(data);
}