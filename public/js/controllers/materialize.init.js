/**
 * A controller for materialize-css custom functions
 * @param {object} $scope
 * @return {void}
 */

angular.module('mean.system')
.controller('materializeInit', ['$scope', ($scope) => {
  $(() => {
    $('.carousel.carousel-slider').carousel({ fullWidth: true });
    $('.button-collapse').sideNav();
    $('.parallax').parallax();

    const mainHeader = $('#main-header');
    const logo = $('a#header-logo-container');

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
      $('.carousel').carousel('set', index + 1);
    };

    // Display modals on index page
    $scope.showModal = (event) => {
      event.preventDefault();
      $('.modal').modal();
    };

    // Adds a scroll effect to page when a navlink is clicked
    $('.scrollspy').scrollSpy({
      scrollOffset: 100
    });
  });
}]);
