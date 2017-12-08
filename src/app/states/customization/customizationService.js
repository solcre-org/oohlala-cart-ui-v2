app.service("CustomizationService", [
  '$rootScope',
  '$timeout',
  '$state',
  '$q',
  'OrdersService',
  'PictureResource',
  'LocalStorageService',
  function (
    $rootScope,
    $timeout,
    $state,
    $q,
    OrdersService,
    PictureResource,
    LocalStorageService
  ) {

    var _self = {
      data:{
        //array used to store the products in the correct format
        productsInCart:[],
        //order number, unique for the whole cart order
        orderId:0,
        //variable that tracks if all the products in the cart are ready to send
        //enables the submit button, funtionality not yet implemented
        allProductsSet:false,
        //adds the show class to the toast-holder div to show the overflow error
        showErrorMessage:true,
        errorMessage:'La orden no está paga. Por favor abónela y vuelva a esta página.',
        orderPaid:false,
        confirmationMessage: '* Tiene que armar todos los productos antes de pasar al siguiente paso. Puede que necesite editar algunas imágenes dependiendo del tamaño.',
        orderLoading:false,
        shippingId:0,
        typeId:0,
        pictureQuantities:{},
        pictureProportions:{}
      },

      initialize:function(){

        if(angular.equals(Order, {})){
          //if the order is empty, the user is redirected to the cart
          $state.go('cart');
        }else{
          _self.data.pictureQuantities = Order.extraData[0].quantity;
          _self.data.shippingId = parseInt(Order.extraData[0].shipping);
          _self.data.typeId = parseInt(Order.extraData[0].shippingType);
          _self.data.pictureProportions = Order.extraData[0].proportions;
          //the products are formatted to fit the customization process
          _self.formatProducts(Order);
          //if the order is not empty, paid status is checked
          //ORDER PAID STATUS IS NOT CHECKED, CONFIGURATION IS AVAILABLE EVEN IF THE ORDER IS UNPAID
          //if(Order.paid){
          if(true){
            //default values for the state are not-paid, so if it's paid, variables change
            _self.data.orderPaid = true;
            _self.data.showErrorMessage = false;
          }
        }
        //receives the order from the cart and runs a formatting method
        $rootScope.sectionId = 'listado-compra';
      },

      //receives the order object as parameter
      formatProducts:function(products){
        //object that represents a single product in the order
        //after the information is loaded it will be pushed to the array
        var productInOrder = {};
        //the order id is stored as a variable in the directive
        _self.data.orderId = products.id;
        products._embedded.items.forEach(function(order, index){
          //skip storing the shipping
          if(order._embedded.product.id != _self.data.shippingId && order._embedded.product.id != _self.data.typeId){
            //products have a quantity field. For each product, it's necessary to generate
            //one product object for the quantity ammount
            for(i = 0; i < order.quantity; i++){
              //product id, the same if quantity is more than 1
              // if(order._embedded.productVersion != null){
              // productInOrder.id = order._embedded.productVersion.id;
              productInOrder.id = order.id
              // }else{
              // productInOrder.id = order.id
              // }
              //order info
              productInOrder.name = order.productInformation;
              //number of pictures in the product
              if(order._embedded.productVersion){
                productInOrder.maxPictures = _self.data.pictureQuantities[order._embedded.productVersion.id.toString()];
                //picture proportions
                productInOrder.pictureProportions = _self.data.pictureProportions[order._embedded.productVersion.id.toString()];
              }else{
                productInOrder.maxPictures = _self.data.pictureQuantities[0][order._embedded.product.id.toString()];
                //picture proportions
                productInOrder.pictureProportions = _self.data.pictureProportions[0][order._embedded.product.id.toString()];
              }

              //indicates if the product is revelado. Markup and options change.
              //productInOrder.revelado = order.isRevelado;
              productInOrder.revelado = false;
              //tracks is product is ready for sending. Default false, obviousy
              productInOrder.ready = false;
              //positionDetail tracks the product number if the quantity is more than 1.
              //Each of the same product has a consecutive number
              productInOrder.positionDetail = i + 1;
              //text message in case of gift
              productInOrder.giftMessage = "";
              //array with the pictures loaded in the product
              productInOrder.pictures = [];
              //the product is pushed into the array
              _self.data.productsInCart.push(productInOrder);

              //object is reset for subsequent product
              productInOrder = {};
            }
          }
        });
      },


      //uploads the images in the products to the server
      uploadToServer:function(){
        //variable that indicates if the products are ready to send
        var readyToUpload = true;
        //volatile object used to store the information to send
        var pictureToUpload = {};
        var formData;
        var pictureName = '';
        _self.data.productsInCart.forEach(function(product, index){
          //if only one product is not ready to upload, the variable is set to false
          if(!product.ready){
            readyToUpload = false;
          }
        });
        //if any of the products failed, then the variable is false and the method does nothing
        if(readyToUpload){
          _self.data.allProductsSet = false;
          _self.data.confirmationMessage = 'Subiendo las fotos al servidor, por favor no refresques la página.'
          _self.data.orderLoading = true;
          var success = true;
          var promises = [];
          //first we go through the products array
          _self.data.productsInCart.forEach(function(product, productIndex){
            //for each product, we go through the pictures in it
            product.pictures.forEach(function(picture, pictureIndex){
              //for each picture, we load the attributes in the formData to send

              formData = new FormData();

              formData.append('id_orders_detail', product.id);
              //photo_numbers are consecutive, independent of the picture data
              formData.append('photo_number', pictureIndex + 1);

              //the picture is named a generic name because the server overrides it.
              //the file extension is taken from the blob type
              // ---   (L) Regex   ---
              pictureName = product.id.toString()+'-'+product.positionDetail+'.'+picture.file.type.toString().match(/\w*\/(\w*)$/)[1];

              formData.append('image', picture.file, pictureName);
              formData.append('position_detail', product.positionDetail);
              formData.append('message_file', product.giftMessage);


              //if more than one picture is set to revelar, then the picture is re-sent
              //changing the id to add 100 for each iteration
              for(var i = 0; i < picture.quant; i++){

                formData.append('photo_number', i * 100 + pictureIndex + 1);

                //store promises from the $resource
                promises.push(PictureResource.save(formData).$promise);

              }
            })
          })
          //when all the promises are stored, the systems waits for them to finish
          $q.all(promises).then(function(responses){
            //then the array is checked for errors
            responses.forEach(function(response, index){
              //if at least one response failed, the error page is displayed
              if(response.status != 201){
                success = false;
              }
            })
            //if no failed, the confirmation page is displayed
            if(success){
              //Local Storage is emptied
              LocalStorageService.emptyCart();

              $state.go('confirmation', {'success':true, 'orderId':_self.data.orderId});
            }else{
              $state.go('confirmation', {'success': false, 'orderId':_self.data.orderId});
            }
          })
        }
      },


      showOverflowError:function(){
        _self.data.errorMessage = "Se alcanzó el limite de fotos";
        _self.data.showErrorMessage = true;
        $timeout( function(){
          _self.data.showErrorMessage = false;
        }, 3000 );
      },

      //polls each product asking if they are ready to submit
      getReady:function(){
        var allReady = true;
        //$timeout is necesary to wait for angular $digest before polling
        $timeout(function(){
          _self.data.productsInCart.forEach(function(product, index){
            //if one product is not ready, set it as false
            if(!product.ready){
              allReady = false;
            }
          });
          _self.data.allProductsSet = allReady;
        });
      }

    }
    return _self;

  }]);
