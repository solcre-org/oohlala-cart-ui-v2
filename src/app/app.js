var app = angular.module('oohlalaCart', [
  'ngResource',
  'ngFileUpload',
  'ui.sortable',
  'ngAnimate',
  'ui.router',
  'ngSanitize',
  'LocalStorageModule'
]);

app.constant('Configuration',configuration);



try{ Order;}
catch(e) {
  Order = {'id': -1};
}
app.constant('Order', Order);


try{ Shipping; }
catch(e) {
  Shipping = {'_embedded':{'products':[]}};
}

app.constant('Shipping', Shipping);


app.config([
  '$stateProvider',
  'localStorageServiceProvider',
  function(
    $stateProvider,
    localStorageServiceProvider
  ) {

    var cart = {
      name: 'cart',
      url: '',
      templateUrl: 'app/states/cart/index.html',
      controller: 'CartController'
    }

    var shipping = {
      name: 'shipping',
      params: {'folder':null, 'orderArray':null, 'order':null},
      templateUrl: 'app/states/shipping/index.html',
      controller: 'ShippingController'
    }

    var customization = {
      name: 'customization',
      params: {'order':{}, 'pictureQuantities':{}, 'pictureProportions':{}},
      templateUrl: 'app/states/customization/index.html',
      controller: 'CustomizationController'
    }

    var confirmation = {
      name: 'confirmation',
      url: '/confirmation',
      templateUrl: 'app/states/confirmation/index.html',
      controller: 'ConfirmationController'
    }

    $stateProvider.state(cart);
    $stateProvider.state(shipping);
    $stateProvider.state(customization);
    $stateProvider.state(confirmation);

    //configure local storage options for the cart
    localStorageServiceProvider.setPrefix('oohlala');
    localStorageServiceProvider.setStorageType('localStorage');

  }]);

  app.run([
    '$state',
    function (
      $state
    ) {

      angular.element('#oohlalaCart').removeClass('loading');

// console.log(windiw)
//
//       if(!$state.$current.name){
//         $state.go('cart');
//       }

    }
  ]);
