app.service("CustomizationService", [
  '$rootScope',
  '$timeout',
  '$state',
  '$stateParams',
  '$q',
  'OrdersService',
  'PictureResource',
  'LocalStorageService',
  'RequestFolderResource',
  function (
    $rootScope,
    $timeout,
    $state,
    $stateParams,
    $q,
    OrdersService,
    PictureResource,
    LocalStorageService,
    RequestFolderResource
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
        errorMessageBackgroundColor:'#d05959',
        errorMessage:'',
        orderPaid:false,
        confirmationMessage: '* Tiene que armar todos los productos antes de pasar al siguiente paso. Puede que necesite editar algunas imágenes dependiendo del tamaño.',
        orderLoading:false,
        shippingId:0,
        typeId:0,
        pictureQuantities:{},
        pictureProportions:{},
        orderArrayForFolder:[],
        orderArrayFromAPI:{},
        picturesFolder:'',
        orderFromCart:{}
      },

      initialize:function(){
        _self.data.orderArrayForFolder = [];
        _self.data.orderArrayFromAPI = {};
        _self.data.picturesFolder = '';
        _self.data.orderFromCart = $stateParams.order;

        //verify if the order exists and is not empty
        if(!$stateParams.order ||
          $stateParams.order.items.length == 0
        ){
          $state.go('cart');
        }else{
          _self.data.pictureQuantities = $stateParams.pictureQuantities;
          _self.data.pictureProportions = $stateParams.pictureProportions;
          _self.formatProducts($stateParams.order.items)
        }

        _self.data.orderPaid = true;
        _self.data.showErrorMessage = false;

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
        products.forEach(function(order, index){
          //products have a quantity field. For each product, it's necessary to generate
          //one product object for the quantity amm// promises.push(PictureResource.save(formData).$promise);

          // var folder = new RequestFolderResource();
          // folder.$save(function(response){
          for(i = 0; i < order.quantity; i++){
            //product id, the same if quantity is more than 1
            productInOrder.id = order.id
            // productInOrder.name = order.productDetail + ' - ' + order.name;
            //number of pictures in the product

            if(order.hasVersion){
              productInOrder.name = order.productDetail + ' - ' + order.name;
              productInOrder.maxPictures = _self.data.pictureQuantities[order.productVersionId.toString()];

              //picture proportions
              productInOrder.pictureProportions = _self.data.pictureProportions[order.productVersionId.toString()];
            }else{
              productInOrder.name = order.productDetail;
              productInOrder.maxPictures = _self.data.pictureQuantities[0][order.product];

              //picture proportions
              productInOrder.pictureProportions = _self.data.pictureProportions[0][order.product];
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

            //make array necesary to get the folder name from the backend upload service
            _self.data.orderArrayForFolder.push(order.productVersionId);
          }
        });
      },

      //when albums are loaded, a folder number is requested form the server
      //pictures should be upladed indicating that folder number
      requestFolder:function(){
        //the function returns a promise because a folder name is needed before uploading
        //the pictures
        return new Promise(function(resolve){

          var fd = new FormData();

          fd.append('new_folder', true);

          _self.data.orderArrayForFolder.forEach(function(value, index){
            var key = 'products_numbers['+index+']';
            fd.append(key,value);
          })

          RequestFolderResource.save(fd, function(response){
            _self.data.picturesFolder = response.data.orderFolderName;
            _self.data.orderArrayFromAPI = response.data.productWithFolder;
            _self.data.orderArrayFromAPIToSend = response.data.productWithFolder;
            resolve(response);
          })
        })
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
          _self.requestFolder().then(function(response){
            if(response.status != 201){

              _self.displayErrorMessage('Ocurrió un error en el servidor, por favor inténtelo de nuevo más tarde',6000, true);
              $rootScope.$digest();

            }else{

              _self.displayErrorMessage('Subiendo las fotos al servidor, por favor no refresque la página. Cuando se complete podrá ingresar sus datos para el envío.', -1, false);
              $rootScope.$digest();


              _self.data.allProductsSet = false;
              _self.data.orderLoading = true;
              var success = true;
              var promises = [];
              var orderDetail = 0;
              //first we go through the products array
              _self.data.productsInCart.forEach(function(product, productIndex){
                //for each product, we go through the pictures in it


                console.log(product.pictures);

                product.pictures.forEach(function(picture, pictureIndex){
                  //for each picture, we load the attributes in the formData to send

                  //if more than one picture is set to revelar, then the picture is re-sent
                  //changing the id to add 100 for each iteration
                  for(var i = 0; i < picture.quant; i++){

                    formData = new FormData();

                    //tell the server where to store the pictures
                    formData.append('order_id', _self.data.picturesFolder);
                    orderDetail = _self.data.orderArrayFromAPI[_self.data.orderArrayForFolder[productIndex]][0];


                    formData.append('order_detail_position', orderDetail);
                    formData.append('detail_position', 1);
                    //photo_numbers are consecutive, independent of the picture data
                    // formData.append('photo_number', pictureIndex + 1);

                    //the picture is named a generic name because the server overrides it.
                    //the file extension is taken from the blob type
                    // ---   (L) Regex   ---
                    pictureName = product.positionDetail+'.'+picture.file.type.toString().match(/\w*\/(\w*)$/)[1];

                    formData.append('image', picture.file, pictureName);
                    // formData.append('position_detail', product.positionDetail);
                    formData.append('message_file', product.giftMessage);

                    //if more than one picture is set to revelar, then the picture is re-sent
                    //changing the id to add 100 for each iteration
                    formData.append('photo_number', i * 100 + pictureIndex + 1);

                    //store promises from the $resource
                    promises.push(PictureResource.save(formData).$promise);

                  }
                })
                _self.data.orderArrayFromAPI[_self.data.orderArrayForFolder[productIndex]].splice(0,1);
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
                  // LocalStorageService.emptyCart();
                  //
                  $state.go('shipping', {'folder':_self.data.picturesFolder, 'orderArray':_self.data.orderArrayFromAPIToSend, 'order': _self.data.orderFromCart});

                }else{
                  _self.displayErrorMessage('Ocurrió un error en el servidor, por favor inténtelo de nuevo más tarde',6000);
                  // $state.go('confirmation', {'success': false, 'orderId':_self.data.orderId});
                  console.log('failed to send images')
                }
              })


            }
          });

        }

      },


      showOverflowError:function(){
        _self.displayErrorMessage('Se alcanzó el límite de fotos', 3000, true);
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
      },


      displayErrorMessage:function(message, time, isError){
        if(isError){
          _self.data.errorMessageBackgroundColor = '#d05959';
        }else{
          _self.data.errorMessageBackgroundColor = 'green';
        }
        _self.data.errorMessage = message;
        _self.data.showErrorMessage = true;
        if(time != -1){
          $timeout( function(){
            _self.data.showErrorMessage = false;
          }, time );
        }
      }

    }
    return _self;

  }]);
