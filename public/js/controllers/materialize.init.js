/**
 * A controller for materialize-css custom functions
 * @param {object} $scope
 * @return {void}
 */

angular.module('mean.system')
.controller('materializeInit', ['$scope', '$window', '$location',
  ($scope, $window, $location) => {
    $(() => {
      $('.carousel.carousel-slider').carousel({ fullWidth: true });
      $('.button-collapse').sideNav();
      $('.parallax').parallax();
      const mainHeader = $('#main-header');
      const logo = $('a#header-logo-container');
      const location = $location.path();

      if (location === '/') {
        $scope.isLandingPage = true;
      } else if (location === '/app') {
        $scope.isLandingPage = false;
        $scope.isAppPage = true;
      } else {
        $scope.isLandingPage = false;
        $scope.isAppPage = false;
      }
    // Makes header position static when window is scrolled to 400
      $(window).scroll(() => {
        const scrollValue = $(this).scrollTop();
        if (scrollValue > 400) {
          mainHeader.addClass('fix-header');
          logo.removeClass('hide');
        } else {
          mainHeader.removeClass('fix-header');
          logo.addClass('hide');
        }
      });

    // Switches carousel image when an how-to-play step is clicked
      $scope.slider = (event, index) => {
        event.preventDefault();
        $('.carousel').carousel('set', index);
      };

    // Display modals on index page
      $scope.showModal = (event) => {
        event.preventDefault();
        $('.modal').modal();
      };

      $scope.signout = () => {
        $window.localStorage.removeItem('token');
        $window.location = '/signout';
      };

    // Adds a scroll effect to page when a navlink is clicked
      $('.scrollspy').scrollSpy({
        scrollOffset: 100
      });
    });
    $scope.username = window.user ? window.user.name : '';
  }]);
