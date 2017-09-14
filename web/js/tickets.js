Tickets.controller('ticketsctrl', function($scope,$http,$mdDialog,$window) {
	$scope.ticket = {
		email: localStorage.getItem("mail")
	};
	$scope.master = {
		email: localStorage.getItem("mail")
	};

	$scope.save  = function(ev) {
		if ($scope.ticketForm.$valid) {
			$http.post( 'authtickets/create', $scope.ticket )
				.then(function successCallback(response) {
					var ticket = response.data
					$mdDialog.show(
						$mdDialog.alert()
							.parent(angular.element(document.querySelector('#popupContainer')))
							.clickOutsideToClose(true)
							.title(ticket+' created')
							.textContent('Issue ['+ticket+'] has been created, we will contact you soon')
							.ariaLabel('Issue created')
							.ok('Ok')
							.targetEvent(ev)
					);
					$scope.ticket = angular.copy($scope.master);
					$scope.ticketForm.$setUntouched();
					$scope.ticketForm.$setPristine();
				}, function errorCallback(response) {

				});
		}
	};
});


Tickets.directive('capitalize', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) inputValue = '';
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); 
      }
    };
  });