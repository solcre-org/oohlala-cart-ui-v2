app.service("ResumenCompraService", [
  '$rootScope',
  '$state',
  'OrdersService',
  function (
    $rootScope,
    $state,
    OrdersService
  ) {

    var _self = {
      data:{
        //quantity of products in the cart
        //needs to be calculated because some products have a QUANTITY attribute
        //so the number of products coulb de different than products.length
        finalProductsQuantity:0,
        //total price of all the products in the cart
        finalProductsPrice:0,
        //shipping price
        shippingPrice:0,
        //dissables the next step of the process in case something is missing in the state
        //control of this attribute is relegated to other services using the directive
        nextStepReady:false,
        nextStepReadyMessage:'',
        showNextStepMessage:false,
        orderLoading:false
      },

      initialize:function(){
        _self.getFinalProductsPrice();
      },

      //calculates the number of products and the price and stores it in the variables
      getFinalProductsPrice:function(){
        _self.data.finalProductPrice = 0;
        _self.data.finalProductsQuantity = 0;
        //go through the products array and add prices and quantities
        OrdersService.data.productsInCart.forEach(function(product, index){
          _self.data.finalProductPrice = _self.data.finalProductPrice + ((product.details.productPrice + product.details.extraPrice) * product.details.quantity);
          _self.data.finalProductsQuantity = _self.data.finalProductsQuantity + product.details.quantity;
        });
      }

    }
    return _self;

  }]);
