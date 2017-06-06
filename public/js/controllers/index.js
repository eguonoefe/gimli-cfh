angular.module('mean.system')
  .controller('IndexController',
  ['$scope', 'Global', '$location', '$window', '$http', 'socket', 'game', 'AvatarService',
    function ($scope, Global, $location, $window, $http, socket, game, AvatarService) {
      $scope.global = Global;

      $scope.playAsGuest = function () {
        game.joinGame();
        $location.path('/app');
      };

    $scope.signin = () => {
      if (!$scope.email || !$scope.password) {
        $scope.message = 'Please fill in your email and password';
      } else {
        const newuser = {
          email: $scope.email,
          password: $scope.password
        };
        $http.post('/api/auth/signin', newuser).then((response) => {
          if (response.data.signupStatus === 'success') {
            $window.localStorage.setItem('token', response.data.token);
           // $cookie.put('jwt',response.data.token);
            $location.path('/#/');
          } else {
            $scope.message = response.data.message;
          }
        }, (err) => {
          $scope.message = err;
        });
      }
    };

      $scope.showError = function () {
        if ($location.search().error) {
          return $location.search().error;
        } else {
          return false;
        }
      };


      $scope.signup = () => {
        if (!$scope.name || !$scope.email || !$scope.password) {
          $scope.message = 'Please fill in your username, email and password';
        } else {
          // get selected avatar
          const avatars = document.getElementsByName('avatars');
          let selectedAvatar;
          for (let i = 0; i < avatars.length; i++) {
            if (avatars[i].checked) {
              selectedAvatar = avatars[i].value;
            }
          }

          const newuser = {
            name: $scope.name,
            email: $scope.email,
            password: $scope.password,
            avatar: selectedAvatar
          };
          $http.post('/api/auth/signup', newuser).then((response) => {
            if (response.data.signupStatus == 'success') {
              $window.localStorage.setItem('token', response.data.token);
              // $cookie.put('jwt',response.data.token);
              $location.path('/#/');
            } else {
              $scope.message = response.data.message;
            }
          }, (err) => {
            $scope.message = err;
          });
        }
      };

      $scope.showJWt = () => {
        var jwt = $window.localStorage.getItem('token');
        var req = {
          method: 'POST',
          url: '/api/auth/showJWT',
          headers: {
            'Authorization': jwt
          },
          data: { test: 'test' }
        }
        $http(req)
          .then(function (response) {
          },
          function (err) {
          });
        //  $cookie.get('jwt');
      };

      $scope.avatars = [];
      AvatarService.getAvatars()
        .then(function (data) {
          $scope.avatars = data;
        });

    }]);