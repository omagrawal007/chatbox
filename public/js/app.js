var app =  angular.module('chatApp', ['ngRoute','ngAnimate', 'ngSanitize', 'ui.bootstrap'], function($httpProvider) {
});
// var app = angular.module("chatApp", []);

app.controller('chatController', ['$scope', '$rootScope','chatAppService','$location','$window','$interval', function($scope,$rootScope,chatAppService,$location,$window,$interval) {
$scope.login=function(userName,password){

/*login code start here*/


	var postData={"userName":userName,"password":password,"url":"login"};
	chatAppService.httpRequestCommon(postData,function(response){
		$scope.ischkeck=0;
		if(response.status_code==201)
		{
			$scope.ischkeck=1;
			sessionStorage.setItem('user', JSON.stringify(response.data));	
			$location.url('/chatPage');
		}
	});

	/*login code end here*/



},
$scope.chatStartIndividual=function(chatMsg,room){

	var chatMessage={"chatMsg":chatMsg,"room":room};
 	$scope.socket.emit('chat',chatMessage);


},
$scope.chatStart=function(userid,chatId){


	var postData={"from_user":userid,"to_user":chatId,"url":"groupCreate"};
	chatAppService.httpRequestCommon(postData,function(response){
	

		sessionStorage.setItem('chatConnection',JSON.stringify(response));
		$location.url('/chatIndividual');
	});
	
},
$scope.userIndividualInfo=function(){
	var getroom=JSON.parse(sessionStorage.getItem('chatConnection'));
	$scope.chartInfoArray=[];
	$scope.getroom=getroom;
	$scope.socket = io();
	$scope.socket.emit('newconnect',getroom);

	$scope.socket.on('FirstChatTransfer',function(responseData){
		
		var userInfo=JSON.parse(sessionStorage.getItem('user'));




		for(var i=0; i<responseData.length; i++)
		{	
					if(responseData[i].sender_id==userInfo[0]['id'])
					{
						$scope.chartInfoArray[i]={"type":"to","message":responseData[i].message};

					}
					else
					{
						$scope.chartInfoArray[i]={"type":"from","message":responseData[i].message};

					}

		}

		// console.log($scope.chartInfoArray);

	})

	$interval(function(){
		$scope.socket.off();
		$scope.socket.on('recieve',function(data){
 		$scope.typeMsg=data;
 		});


		$scope.socket.on("successRecieve",function(data){
	
			$scope.chartInfoArray.push({"type":"from","message":data});


	});




	}, 1000);
	
},
$scope.chatStartIndividualInfo=function(chatMsg,room){
	

	$scope.chartInfoArray.push({"type":"to","message":chatMsg});

	var userInfo=JSON.parse(sessionStorage.getItem('user'));
	var sendChatData={"user_id":userInfo[0].id,"room":room,"chatMsg":chatMsg};
	$scope.socket.emit("chatDataSend",sendChatData);
		$scope.msgChat='';


},

$scope.userChat=function(){
	var userInfo=sessionStorage.getItem('user');
	$scope.userInfo=JSON.parse(userInfo);
	
	var postData={"url":"chatList"};
	chatAppService.httpRequestCommon(postData,function(response){
		
		$scope.chatList={};

		if(response.status_code==201)
		{
			$scope.chatList=response.data;


		}
		else
		{
			$scope.chatList=" ";


		}

	});





},


$scope.singup=function(first_name,last_name,email,password,contact){


	var postData={"first_name":first_name,"last_name":last_name,"email":email,"password":password,"contact":contact,"url":"singup"};

	chatAppService.httpRequestCommon(postData,function(response){

		if(response.status_code==201)
		{
			$scope.ischeckSingup=1;


		}
		else
		{

			$scope.ischeckSingup=0;

		}



	});


}



}
]);

app.factory('chatAppService',['$http','$rootScope','$timeout',function($http, $cookieStore, $rootScope, $timeout){


var service={};
	service.httpRequestCommon=function(postData,callback){
		var ServicePath="http://localhost:3000/";

		var url=postData.url;


        	postData=JSON.stringify(postData);
        	$http({
             method: 'POST',
             url: ServicePath+url,
	  	   	 transformRequest: angular.identity,
			 headers: {'Content-Type': 'application/json'},
			 data:postData,
			 dataType: 'json',
            }).success(function(response) {
                callback(response);
            })



        };
        return service;


}]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider. when('/Home', {templateUrl: 'template/home.tmpl',   controller: ''});	
	$routeProvider. when('/login', {templateUrl: 'template/login.tmpl',   controller: ''});	
	$routeProvider. when('/signup', {templateUrl: 'template/signup.tmpl',   controller: ''});	
	$routeProvider. when('/chatPage', {templateUrl: 'template/chat.tmpl',   controller: ''});	
	$routeProvider. when('/chatIndividual', {templateUrl: 'template/chatIndivisual.tmpl',   controller: ''});	
	


	$routeProvider.otherwise({redirectTo: '/Home'});

	}

	]);


