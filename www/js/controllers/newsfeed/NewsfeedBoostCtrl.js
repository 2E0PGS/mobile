/**
 * Minds::mobile
 * Newsfeed controller
 * 
 * @author Mark Harding
 */

define(function () {
    'use strict';

    function ctrl( $rootScope, $scope, $state, $stateParams, $ionicLoading, $ionicPopup, $timeout, Client) {

    	$scope.data = {
    		destination: '',
    		points: 500,
    		impressions: 500 * 1,
    		rate: 1
    	};
    	
    	$scope.$watch('data.points', function(){
    		$scope.data.impressions = $scope.data.points * $scope.data.rate;
    	}, true);
    	
    	Client.get('api/v1/boost/rates', { cb: Date.now() }, function(success){
    		$scope.data.rate = success.rate;
    	});
    	
    	$scope.boost = function(){
    		
    		$ionicLoading.show({
				template: 'Please wait a moment.'
				});
    		
    		//validate our points
    		Client.get('api/v1/wallet/count', { cb: Date.now() }, function(success){
    			$ionicLoading.hide();
    			if(success.count > $scope.data.points){
    				var endpoint = 'api/v1/boost/newsfeed/' + $scope.guid + '/' + $scope.owner_guid;
    				if($scope.data.destination){
    					endpoint = 'api/v1/boost/channel/' + $scope.guid + '/' + $scope.owner_guid;
    				}

    				//commence the boost
    				Client.post(endpoint, { 
    						impressions: $scope.data.impressions,
    						destination: $scope.data.destination.charAt(0) == '@' ? $scope.data.destination.substr(1) : $scope.data.destination
    					}, function(success){
    					if(success.status == 'success'){
    						$scope.modal.remove();
    						$ionicLoading.show({
								template: 'Boost request submitted.'
								});
    						$timeout(function(){
    							$ionicLoading.hide();
    						}, 500);
    						
    					} else {
    						$ionicLoading.show({
								template: 'Sorry, something went wrong.'
								});
    						$timeout(function(){
    							$ionicLoading.hide();
    						}, 500);
    					}
    				});
    				
    			} else {
    				if(success.count > $scope.data.points){
	    				$ionicPopup.alert({
	   				     title: 'Ooops!',
	   				     subTitle: 'You don\;t have enough points',
	   				     buttons: [
	   		               
	   		               {
	   		                 text: '<b>Buy points</b>',
	   		                 type: 'button-positive',
	   		                 onTap: function(e) {
	   		                	 $state.go('tab.newsfeed-wallet-deposit');
	   		                	 $scope.modal.remove();
	   		                 }
	   		               },
	   		               
	   		               { text: 'Close.' },
	   		             ]
	   				   });
   				   }
   				   if($scope.data.points > success.cap)  {
						$ionicPopup.alert({
						     title: 'Ooops!',
						     subTitle: 'Sorry, there is a limit on how many points can be spent. ',
						     buttons: [
						       
						       {
						         text: '<b>Lower rate</b>',
						         type: 'button-positive',
						         onTap: function(e) {
						        	 $scope.data.points  = success.cap - 1;
						         }
						       },
						       
						       { text: 'Close.' },
						     ]
						   });
	   				}
    			}
    		}, function(error){
    			
    		});

    	};
    	
    	$scope.searching = false;
    	$scope.results = [];
    	$scope.changeDestination = function(e){
    		$scope.searching = true;
    		if($scope.data.destination.charAt(0) != '@' && $scope.data.destination.length != 0){
    			$scope.data.destination = '@' + $scope.data.destination;
    		}
    		if(e.keyCode == 13){
    			$scope.searching = false;
    		}
    		
    		var query = $scope.data.destination;
    		if(query.charAt(0) == '@'){
    			query = query.substr(1);
    		}
    		
    		Client.get('search', {q: query, type:'user', view:'json', limit:5}, 
    			function(success){
    				$scope.results = success.user[0];
    			});
    		
    		console.log('changing');
    		
    		if(!$scope.data.destination){
    			$scope.searching = false;
    		}
    	};
    	
    	$scope.selectDestination = function(user){
    		$scope.searching = false;
    		$scope.data.destination = '@' + user.username;
    	};
    	
    }

    ctrl.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading', '$ionicPopup', '$timeout', 'Client'];
    return ctrl;
    
});