Tickets.controller('navctl', function($scope, $location,$mdToast,$templateCache,$mdDialog) {
	$scope.modal = function(ev) {
		$mdDialog.show({
		  controller: changepassctrl,
		  templateUrl: 'authtickets/changepass',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  clickOutsideToClose:true,
		  fullscreen: $scope.customFullscreen
		});
	};
	
	$scope.logout  = function() {
		window.localStorage.removeItem("token");
		$templateCache.remove("authtickets/form");
		$templateCache.remove("authtickets/changepass");
		$location.path( "/login" );
		$mdToast.show($mdToast.simple({textContent : "You are now logged out",hideDelay: 5000}));
	}
	
	$scope.gotickets  = function() {
		$location.path( "/tickets" );
	}

///////////controller modal//////////////////////////////
	function changepassctrl($scope, $mdDialog,$http) {
			$scope.$watch('pass.newPassword', function(newValue, oldValue, scope) {
			if (newValue){
				switch(zxcvbn(newValue).score) {
					case 0:
						$scope.testmdp='red';
						break;
					case 1:
						$scope.testmdp='orange';
						break;
					case 2:
						$scope.testmdp='gold';
						break;
					case 3:
						$scope.testmdp='green';
						break;
					case 4:
						$scope.testmdp='blue';
						break;
				}
			}
		}, true);
		
		$scope.$watch('pass.confirmNewPassword', function(newValue, oldValue, scope) {
			if (newValue){
				switch(zxcvbn(newValue).score) {
					case 0:
						$scope.testmdp1='red';
						break;
					case 1:
						$scope.testmdp1='orange';
						break;
					case 2:
						$scope.testmdp1='gold';
						break;
					case 3:
						$scope.testmdp1='green';
						break;
					case 4:
						$scope.testmdp1='blue';
						break;
				}
			}
		}, true);	

		$scope.changepassctrl = function() {
				
			var login = localStorage.getItem("mail");
			var actpassword = $scope.pass.actpass;
			var newpassword = $scope.pass.newPassword;
			var confirmNewPassword = $scope.pass.confirmNewPassword;	
			
			$http.post("/getSalt", JSON.stringify({"login": login}))
				.then(function(response) {
					if(response.data.salt){
						var acthash = bcrypt.hashSync(actpassword, response.data.salt);
						$http.post("/login",JSON.stringify({"login": login, "hash": acthash}))
							.then(function(response) {
								localStorage.setItem("token", response.data.token);
									if(response.data.success==false){
										$('#password').val("")
										$mdToast.show($mdToast.simple({textContent : "Incorrect password",parent : document.querySelectorAll('#changepass'), hideDelay: 5000}));
									}else{
										var newsalt = bcrypt.genSaltSync(10);
										if (newpassword != confirmNewPassword){
											$mdToast.show($mdToast.simple({textContent : "Password confirmation doesn't match",parent : document.querySelectorAll('#changepass'), hideDelay: 5000}));
										}else{
											if (newpassword == ""){
												$mdToast.show($mdToast.simple({textContent : "Please enter a new password",parent : document.querySelectorAll('#changepass'), hideDelay: 5000}));
											}else{
												var result = zxcvbn(newpassword);
												if (result.score > 2){
													var hash = bcrypt.hashSync(newpassword, newsalt);
													
													$http.post("/register", JSON.stringify({"login": login, "hash":hash, "acthash":acthash, "salt":newsalt }))
														.then(function(response) {
															$mdToast.show($mdToast.simple({textContent : "Password successfully changed",parent : document.querySelectorAll('#mainlog'), hideDelay: 5000}));
															$mdDialog.hide();
														});
												}else{
													$mdToast.show($mdToast.simple({textContent : "Please use more complex password",parent : document.querySelectorAll('#mainlog'), hideDelay: 5000}));
												}
											}
										}
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
				})
		}
		
		
		
		
	}
});

