	Tickets.factory('BearerAuthInterceptor', function ($window, $q,$location,$injector) {
		return {
			request: function(config) {
				config.headers = config.headers || {};
				if ($window.localStorage.getItem('token')) {
					config.headers.Authorization = $window.localStorage.getItem('token');
				}
				return config || $q.when(config);
			},
			response: function(response) {
				if (response.status === 200 ) {
					//do rien :)
				}
				return response || $q.when(response);
			},
			responseError: function(rejection) {
					var $mdToast = $injector.get("$mdToast");
                    switch (rejection.status) {
                        case 401:
                            $location.path('/login');
							$mdToast.show($mdToast.simple({textContent : "Session expired, please log in",hideDelay: 5000}));
                            break;
                        case 403:
                            $location.path('/login');
							$mdToast.show($mdToast.simple({textContent : "Please log in",hideDelay: 5000}));
                            break;
                    }

                    return $q.reject(rejection);
            }
			
		};
	});
	
	Tickets.config(function($routeProvider,$httpProvider,$sceDelegateProvider) {

		$httpProvider.interceptors.push('BearerAuthInterceptor');
        $routeProvider
            .when('/tickets', {
                templateUrl : 'authtickets/form'
            })
			 .when('/login', {
                templateUrl : 'partials/login.html'
            })
            .when('/', {
                templateUrl : 'authtickets/form'
            })
			 .when('/changepass', {
                templateUrl : 'partials/changepass.html'
            })
    });  
