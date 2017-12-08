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
      templateUrl: 'app/states/cart/index.html',
      controller: 'CartController'
    }

    var shipping = {
      name: 'shipping',
      params: {'order':{}, 'pictureQuantities':{}, 'pictureProportions':{}},
      templateUrl: 'app/states/shipping/index.html',
      controller: 'ShippingController'
    }

    var customization = {
      name: 'customization',
      templateUrl: 'app/states/customization/index.html',
      controller: 'CustomizationController'
    }

    var confirmation = {
      name: 'confirmation',
      params:{'success':null, 'orderId':null},
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
    '$rootScope',
    '$state',
    'Configuration',
    'OrdersService',
    function (
      $rootScope,
      $state,
      Configuration,
      OrdersService
    ) {

      angular.element('#oohlalaCart').removeClass('loading');
      //checks if I have an order variable from Smarty.
      if(Order.id != -1 && Order.id !== undefined && Order.id !== null){
        $state.go('customization');
      }else{
        $state.go('cart');
      }

    }
  ]);
