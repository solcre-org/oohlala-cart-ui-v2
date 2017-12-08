app.service("LocalStorageService", [
  'localStorageService',
  'OrdersService',
  'Configuration',
  function (
    localStorageService,
    OrdersService,
    Configuration
  ){
    var _self = {

      data:{

      },

      initialize:function(){

      },

      getProductsFromLS:function(){
        var cart = localStorageService.get(configuration.orderLS);
        if(cart){
          return cart;
        }else{
          return [];
        }

      },

      //when this function is called, the order is updated in LS storing whatever is in memory
      updateQuantities:function(){
        var quantity = 0;
        localStorageService.set(configuration.orderLS, OrdersService.data.productsInCart);
        localStorageService.get(configuration.orderLS).forEach(function(product, index){
          quantity = quantity + product.details.quantity;
        });
        localStorageService.set(configuration.quantityLS, quantity);
        angular.element(document).trigger('updateCartQuantity');
      },

      emptyCart:function(){
        localStorageService.clearAll();
        angular.element(document).trigger('updateCartQuantity');
      }

    }
    return _self;
  }]);
