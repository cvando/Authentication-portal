var bcrypt = dcodeIO.bcrypt;
Tickets.controller('loginctrl', function($scope,$mdToast,$location, $rootScope, $http, $mdDialog) {	
	$scope.showSimpleToast = function(text) {
		$mdToast.show(
			$mdToast.simple({
				textContent : text,
				parent : $('#mainlog'),
				hideDelay: 5000
			})
		);
	};		
		
		$scope.loginctrl = function() {
			var login=$scope.login.mail;
			var password=$scope.login.pass;
			$http.post("/getSalt", JSON.stringify({"login": login}))
				.then(function(response) {
					if(response.data.salt){
						var hash = bcrypt.hashSync(password, response.data.salt);
						$http.post("/login",JSON.stringify({"login": login, "hash": hash}))
							.then(function(response) {
								localStorage.setItem("token", response.data.token);
									if(response.data.success==false){
										$('#password').val("")
										$mdToast.show($mdToast.simple({textContent : "Incorrect Password",parent : document.querySelectorAll('#mainlog'), hideDelay: 5000}));
									}else{
										localStorage.setItem("mail", login);
										$mdToast.show($mdToast.simple({textContent : "You are logged in",hideDelay: 5000}));
										$location.path( "/" );
									}
								}, 
								function(response) {
									// failed
								}
							);
					}else{
						$mdToast.show($mdToast.simple({textContent : "Incorrect/Unknown Mail",parent : document.querySelectorAll('#mainlog'), hideDelay: 5000}));
					}				
				}, 
				function(response) { 
					// failed
				}
			);
		}
		
		
	$scope.signup = function(ev) {
		$mdDialog.show({
		  controller: signupctrl,
		  templateUrl: 'partials/signup.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  clickOutsideToClose:true,
		  fullscreen: $scope.customFullscreen
		});
	}	
	
	///////////controller modal//////////////////////////////
	function signupctrl($scope, $mdDialog,$http) {
		
		$scope.register = function() {		
			var login = $scope.reg.login;
			var newsalt = bcrypt.genSaltSync(10);
			var hash = bcrypt.hashSync($scope.reg.pass, newsalt);
			if ($scope.reg.pass != $scope.reg.confirmpassword){
				$mdToast.show($mdToast.simple({textContent : "Confirmation doesn't match",parent : document.querySelectorAll('#register'), hideDelay: 5000}));
			}else{
				$http.post("/register", JSON.stringify({"login": login, "hash": hash, "salt": newsalt }))
				.then(function(response) {
					if(response.data="already"){
						$mdToast.show($mdToast.simple({textContent : "You are already registered",parent : document.querySelectorAll('#register'), hideDelay: 5000}));
					}else{
						$mdToast.show($mdToast.simple({textContent : "You have successfully registered ",parent : document.querySelectorAll('#mainlog'), hideDelay: 5000}));
						$mdDialog.hide();
					}
				});
			}
		}
	}	
});
