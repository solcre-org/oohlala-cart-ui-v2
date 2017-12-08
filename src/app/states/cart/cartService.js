app.service("CartService", [
  '$rootScope',
  '$state',
  'OrdersService',
  'ResumenCompraService',
  'LocalStorageService',
  function (
    $rootScope,
    $state,
    OrdersService,
    ResumenCompraService,
    LocalStorageService
  ) {

    var _self = {
      data:{
        nextStepReady:false,
        order:{},
        errorInQuantity:[],
        pictureQuantities:{},
        pictureProportions:{}
      },

      initialize:function(){
        //enables the "Siguiente Paso" button
        _self.data.nextStepReady = true;
        ResumenCompraService.data.nextStepReady = true;
        OrdersService.data.productsInCart = LocalStorageService.getProductsFromLS();

        _self.updateQuantities();

      },

      //function triggered whenever a product is deleted or a quantity changed
      updateQuantities:function(){
        //if there is a NaN or a number < 1 problem will be true
        var problem = false;
        var productIdQuantity = [];
        _self.data.errorInQuantity = [];

        //dissable button before verification
        _self.data.nextStepReady = false
        ResumenCompraService.data.nextStepReady = false;
        //go through the products looknig at quantities
        OrdersService.data.productsInCart.forEach(function(product, index){
          //if it's not a number, or is less than 1, display error
          if(!product.details.quantity || product.details.quantity < 1){
            ResumenCompraService.data.nextStepReadyMessage = '* Cantidad invalida, por favor corregirla';
            //if one quantity fails, then the error needs to be applied
            problem = true;
            _self.data.errorInQuantity[index] = true;
          }
          /*This next section will check the stock and display an error
          when the number of products exceeds it.
          First it's checked if the stock is tracked by product */
          if(configuration.stockInProduct){
            /*in case it is, an object is created in the productId position with:
            {'quantity': quantity of the product, 'inputs': [which versions are of this product]}
            */
            if(productIdQuantity[product.details.productId]){
              productIdQuantity[product.details.productId].quantity = productIdQuantity[product.details.productId].quantity + product.details.quantity;
              productIdQuantity[product.details.productId].inputs[index] = true;
            }else{
              productIdQuantity[product.details.productId] = {};
              productIdQuantity[product.details.productId].quantity = product.details.quantity;
              productIdQuantity[product.details.productId].inputs = [];
              productIdQuantity[product.details.productId].inputs[index] = true;
            }
          }else{
            /* if stock is tracked by version */
            if(product.details.quantity > product.details.stock){
              ResumenCompraService.data.nextStepReadyMessage = '* Uno de los productos superó el stock, por favor corregirlo';
              //if one quantity fails, then the error needs to be applied
              problem = true;
              _self.data.errorInQuantity[index] = true;
            }
          }
        });
        /* After the quantity array is checked for every product Id,
        the products array is checked to see if any products are over stock
        */
        if(configuration.stockInProduct){
          OrdersService.data.productsInCart.forEach(function(product, index){

            if(product.details.stock < productIdQuantity[product.details.productId].quantity){
              /*If one of them is, the positions array is copied to the errorInQuantity array to indicate those have a problem
              */
              ResumenCompraService.data.nextStepReadyMessage = '* Uno de los productos superó el stock, por favor corregirlo';
              for(var i = 0; i < productIdQuantity[product.details.productId].inputs.length; i++){
                _self.data.errorInQuantity[i] = _self.data.errorInQuantity[i] || productIdQuantity[product.details.productId].inputs[i];
                problem = true;
              }
            }
          });
        }

        //if no quantity failed:
        if(!problem){
          //update details in resumenCompra partial
          ResumenCompraService.getFinalProductsPrice();

          //if the cart is empty, prevent navigation
          if(OrdersService.data.productsInCart.length > 0){
            //re-enable the Siguiente Paso button
            _self.data.nextStepReady = true;
            ResumenCompraService.data.nextStepReady = true;
          }

          //updates quantities in local storage
          LocalStorageService.updateQuantities();
        }
      },

      //deletes a product from the product list. Receives Id of the product to delete
      deleteProduct:function(id){
        var indexToDelete = -1;
        //goes through the product list looking for the id
        OrdersService.data.productsInCart.forEach(function(product, index){
          if(product.details.id == id){
            //when it's found, the item is deleted from the array
            OrdersService.data.productsInCart.splice(index, 1);
          }
        })
        //updateQuantities needs to be called to make sure the new quantities are correct
        _self.updateQuantities();
      },

      //navigates to the next state
      goToShipping:function(){
        //first, the items information is formatted correctly
        _self.formatOrder();
        $state.go('shipping', {
          'order':_self.data.order,
          'pictureQuantities':_self.data.pictureQuantities,
          'pictureProportions': _self.data.pictureProportions
        });
      },

      //formats the item information to be used by the next state
      formatOrder:function(){
        //single item object to be pushed into the array
        var item = {};
        var pictureQuantitiesNoVersion = [];
        var pictureProportionsNoVersion = [];
        //addition of single product prices
        var totalPrice = 0;
        //this corresponds to the object structure the API is expecting
        _self.data.order = {'items':[]};
        //for each element in the cart, the values are stored in the auxiliary object
        OrdersService.data.productsInCart.forEach(function(product, index){

          if(product.details.id){
            item.hasVersion = true;
            item.productVersionId = product.details.id;
            _self.data.pictureQuantities[product.details.id.toString()] = product.details.pictureQuant;
            _self.data.pictureProportions[product.details.id.toString()] = _self.getPictureProportions(product.details.name);
          }else{
            //if the product has no version, a flag is set and a version id is assigned
            //prouct information is stored in index 0 of the arrays of every
            //product in the cart with no versions
            item.hasVersion = false;
            item.productVersionId = null;
            pictureQuantitiesNoVersion[product.details.productId] = product.details.pictureQuant;
            _self.data.pictureQuantities[0] = pictureQuantitiesNoVersion;
            pictureProportionsNoVersion[product.details.productId] = _self.getPictureProportions(product.details.name);
            _self.data.pictureProportions[0] = pictureProportionsNoVersion;

          }
          item.product = product.details.productId;
          item.quantity = product.details.quantity;

          //the auxiliary item is stored in the array
          _self.data.order.items.push(item);
          //the object needs to be reset in between products
          item = {};

          //the total price is updated based on the price of the individual product
          totalPrice = totalPrice + (product.details.productPrice + product.details.extraPrice) * product.details.quantity;
        });
        //the final price is stored
        _self.data.order.total = totalPrice;
      },

      //reads the name of the prodcuts, finds the picture size and returns the proportions
      //for example, 'cuadro 13x13' returns 1; 'portarretratos 12x24' returns 0,5
      getPictureProportions:function(description){
        //first, finds a match in the name of two numbers separated by x or X
        var proportions = description.match(/[\d]+([.,][\d]+)?\s?[xX]\s?[\d]+([.,][\d]+)?/);
        //if there is a match, it continues processing, if not, return -1
        if(proportions){
          //then, erases spaces, changes "," to "." and gets the numbers in an array
          //then divides them, rounds to 2 decimal spaces and returns the result
          proportions = proportions[0].replace(/\s/g,'').replace(/\,/g, '.').split(description.match(/[xX]/)[0]);
          return (Math.round(proportions[0]/proportions[1] * 100) / 100);
        }else{
          return -1;
        }
      }

    }
    return _self;

  }]);
