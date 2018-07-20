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
		  return [{"id":"55 - 132","details":{"id":132,"name":"Pack 32","extraPrice":490,"description":"32 Imanes 5x7,5","picture":"18_198_100.png","stock":500,"productId":55,"productPrice":0,"productDetail":"Foto Iman","productUrl":"http://www.oohlala.com.uy/foto-iman-2?cid=6","features":[-1,-2,54],"pictureQuant":32,"quantity":1}}];
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
