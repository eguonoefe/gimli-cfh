angular.module('mean.system')
  .controller('IndexController',
  ['$scope', 'Global', '$location', '$route',
    '$window', '$http', 'socket', 'game', 'AvatarService',
    function ($scope, Global, $location, $route, $window,
      $http, socket, game, AvatarService) {
      $scope.global = Global;

      $scope.playAsGuest = () => {
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
            if (response.data.signinStatus === 'success') {
              $window.localStorage.setItem('token', response.data.token);
           // $cookie.put('jwt',response.data.token);
              $location.path('/#/');
              $window.location.reload();
            } else {
              $scope.message = response.data.message;
            }
          }, (err) => {
            $scope.message = err;
          });
        }
      };

      $scope.showError = () => {
        if ($location.search().error) {
          return $location.search().error;
        }
        return false;
      };


      $scope.signup = () => {
        if (!$scope.name || !$scope.email || !$scope.password) {
          $scope.message = 'Please fill in your username, email and password';
        } else {
          // get selected avatar
          const avatars = document.getElementsByName('avatars');
          let selectedAvatar;
          for (let i = 0; i < avatars.length; i += 1) {
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
            if (response.data.signupStatus === 'success') {
              $window.localStorage.setItem('token', response.data.token);
              // $cookie.put('jwt',response.data.token);
              $location.path('/#/');
              $window.location.reload();
            } else {
              $scope.message = response.data.message;
            }
          }, (err) => {
            $scope.message = err;
          });
        }
      };

      $scope.avatars = [];
      AvatarService.getAvatars()
        .then((data) => {
          $scope.avatars = data;
        });
    }]);
