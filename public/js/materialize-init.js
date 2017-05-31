$(document).ready(function(){
  $(function(){
    // $('.carousel').carousel();
    $('.carousel.carousel-slider').carousel({fullWidth: true});
    $('.button-collapse').sideNav();
    $('.parallax').parallax();
    $('.modal').modal();
    
    var page = $('#page'); 
    var mainHeader = $('#main-header');
    var logo = $('a#header-logo-container');
    $(window).scroll(function(){
    var scrollValue = $(this).scrollTop();
    if (scrollValue > 400) {
      mainHeader.addClass('fix-header');
      logo.removeClass('hide');
    }
    else{
      mainHeader.removeClass('fix-header');
      logo.addClass('hide');
    }
    
    });
    $('#how-to-play a:not(.carousel-item)')
    .each(function(index){
      $(this).click(function(event){
        event.preventDefault();
        $('.carousel').carousel('set', index + 1);
      });
    });
    $('.scrollspy').scrollSpy({
      scrollOffset: 100
    });
  }); 
});