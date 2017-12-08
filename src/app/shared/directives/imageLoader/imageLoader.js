app.directive('imageLoader', [
  function () {
    return {
      restrict: 'A',
      scope: {
        model: '=ngModel'
      },
      link: function (scope, element, attrs) {
        element.addClass('no-foto');

        //Functions
        function clearImage(){
          if(element.is('img')){
            element.prop('src', '');
          }else{
            element.css('background-image', 'url()');
          }
          element.removeClass('loading');
          element.removeClass('no-foto');
        }

        function loadImage(pictureUrl){
          if(element.is('img')){
            element.prop('src', pictureUrl);
          }else{
            element.css('background-image', 'url(' + pictureUrl + ')');
          }
        }

        //Events
        scope.$watch('model', function (newValue, oldValue) {
          //Init clear
          clearImage();

          if(scope.model) {
            var img = new Image();
            var picture = configuration.cartImagesUrl +"/"+ scope.model;

            element.addClass('loading');
            element.addClass('hide');
            img.src = picture;


            img.onload = function () {
              loadImage(picture);
              element.removeClass('loading');
              element.removeClass('hide');
            };
            img.onerror = clearImage;
          } else {
            element.addClass('no-foto');
          }
        });
      }
    };
  }
]);
