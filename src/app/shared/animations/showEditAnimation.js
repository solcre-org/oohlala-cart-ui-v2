app.animation('.showEditAnimation', [function() {
  return {
    addClass: function(element, className, doneFn) {
      angular.element(element).fadeIn();
      angular.element(element).addClass('show');
    },

    removeClass: function(element, className, doneFn) {
      angular.element(element).removeClass('show');
      angular.element(element).fadeOut();

    }
  }
}]);
