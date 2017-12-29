app.service("ShippingService", [
  '$rootScope',
  '$stateParams',
  '$timeout',
  '$sanitize',
  '$anchorScroll',
  'ResumenCompraService',
  'OrderResource',
  'PaymentGatewayResource',
  'Order',
  'Shipping',
  'LocalStorageService',
  function (
    $rootScope,
    $stateParams,
    $timeout,
    $sanitize,
    $anchorScroll,
    ResumenCompraService,
    OrderResource,
    PaymentGatewayResource,
    Order,
    Shipping,
    LocalStorageService
  ) {

    var _self = {
      data:{
        userDetails:{},
        formValidation:false,
        shippingMethods:[],
        shippingTypes:[],
        paymentMethods:configuration.paymentMethods,
        order:{},
        showSendError:false,
        pictureQuantities:{},
        pictureProportions:{},
        shippingPrice:[0, 0],
        orderFolderName:'',
        productWithFolder:null

      },

      initialize:function(){
        //scrolls to the top of the page
        $anchorScroll('topForScroll');
        //section id name for DOM element classes
        $rootScope.sectionId = 'envio';
        //enables the "Siguiente Paso" button
        ResumenCompraService.data.nextStepReady = true;

        _self.data.userDetails.pickup = 0;
        ResumenCompraService.data.shippingPrice = _self.data.userDetails.pickup;
        //the next button is disabled during the post time to prevent multiple submits.
        //this is the message
        ResumenCompraService.data.orderLoading = false;
        ResumenCompraService.data.nextStepReadyMessage = '* procesando su solicitud, por favor no refresque el navegador.';

        //the items for the order are received via $stateparams
        _self.data.order = $stateParams.order;
        // _self.data.pictureQuantities = $stateParams.pictureQuantities;
        // _self.data.pictureProportions = $stateParams.pictureProportions;

        //receives the details to associate the pictures
        _self.data.orderFolderName = $stateParams.folder;
        _self.data.productWithFolder = $stateParams.orderArray;

        _self.processShippingMethods()
      },

      processShippingMethods:function(){
        var pickupShipping = {};
        var normalShipping = {};
        if(Shipping !== null){
          _self.data.shippingMethods = angular.copy(Shipping._embedded.products);
        }
        pickupShipping.id = -1;
        pickupShipping.title = 'Retiro en el local';
        pickupShipping.price = 0;
        _self.data.shippingMethods.push(angular.copy(pickupShipping));

        if(ShippingType !== null){
          _self.data.shippingTypes = angular.copy(ShippingType._embedded.products);
        }
        normalShipping.id = -1;
        normalShipping.title = 'Producción normal'
        normalShipping.price = 0;
        _self.data.shippingTypes.push(angular.copy(normalShipping));
      },

      //function that checks if the input in the form is correct
      validateForm:function(){
        //offset for the scroll-to-error when there is an error in the form
        $anchorScroll.yOffset = 200;
        ResumenCompraService.data.showNextStepMessage = true;
        ResumenCompraService.data.nextStepReadyMessage = '* hay algunos campos con error, por favor verifíquelos.';
        //formValidation allows the partial to show error messages
        _self.data.formValidation = true;
        //if any of these fields is empty, the function returns false and exits
        if(!_self.data.userDetails.name){
          return false;
        }
        _self.data.userDetails.name = $sanitize(_self.data.userDetails.name);
        if(!_self.data.userDetails.mail){
          return false;
        }
        _self.data.userDetails.mail = $sanitize(_self.data.userDetails.mail);
        if(!_self.data.userDetails.cell){
          return false;
        }
        _self.data.userDetails.cell = $sanitize(_self.data.userDetails.cell);

        //phone is not compulsory
        _self.data.userDetails.phone = $sanitize(_self.data.userDetails.phone);

        if(!_self.data.userDetails.pickup){
          $anchorScroll('formaDeEnvio');
          return false;
        }else{
          //it only checks for address if the pickup selection is not checked
          if(_self.data.userDetails.pickup != -1){
            if(!_self.data.userDetails.address){
              $anchorScroll('formaDeEnvio');
              return false;
            }
            _self.data.userDetails.address = $sanitize(_self.data.userDetails.address);
            if(!_self.data.userDetails.landmarks){
              $anchorScroll('formaDeEnvio');
              return false;
            }
            _self.data.userDetails.landmarks = $sanitize(_self.data.userDetails.landmarks);
          }
        }
        // if(!_self.data.userDetails.type){
        //   $anchorScroll('velocidadDeProduccion');
        //   return false;
        // }

        if(!_self.data.userDetails.payment){
          $anchorScroll('formaDePago');
          return false;
        }
        //if none were false, the order is sent to the server
        _self.sendOrder();
      },

      //function called on ng-change from shipping method; hides the address fields
      //and updates the shipping price in the resumen at the right hand
      onShippingMethodSelect:function(shippingPrice, index){
        _self.data.shippingPrice[index] = shippingPrice;
        ResumenCompraService.data.shippingPrice = 0;
        for(var i = 0; i < _self.data.shippingPrice.length; i++){
          ResumenCompraService.data.shippingPrice = ResumenCompraService.data.shippingPrice + _self.data.shippingPrice[i];
        }
      },

      //sends the order to the server
      sendOrder:function(){
        var shipping = {};
        var aux =  {};
        //the navigation message is reset in case it was set somewhere else
        ResumenCompraService.data.nextStepReadyMessage = '* procesando su solicitud, por favor no refresque el navegador.';
        //while the process is sending, the next button is disabled to prevent multiple submits
        ResumenCompraService.data.nextStepReady = false;
        ResumenCompraService.data.orderLoading = true;

        //regex that isolate the fist name and last names of the customer
        _self.data.order.name = _self.data.userDetails.name.match(/^\s*([\S]+)\s*(.*$)/)[1];
        _self.data.order.last_name = _self.data.userDetails.name.match(/^\s*([\S]+)\s*(.*$)/)[2];

        //the db wants name and last name separate so it's necesary to split the field entry
        // _self.data.userDetails.name.split(" ").forEach(function(name, index){
        //   //the first thing is the name
        //   if(index == 0){
        //     _self.data.order.name = name;
        //     //the second thing is the last name
        //   }else if(index == 1){
        //     _self.data.order.last_name = name;
        //     //whatever is left is appended to the last name
        //   }else{
        //     _self.data.order.last_name = _self.data.order.last_name + " " + name;
        //   }
        // })

        //the rest of the fields are stored downright
        if(_self.data.userDetails.phone){
          _self.data.order.phone = _self.data.userDetails.cell + ' - ' + _self.data.userDetails.phone;
        }else{
          _self.data.order.phone = _self.data.userDetails.cell;
        }

        //add the shipping selection to the order as a product, if it's different than shop pickup
        if(_self.data.userDetails.pickup != -1){
          _self.data.order.address = _self.data.userDetails.address + ", " + _self.data.userDetails.landmarks;
          shipping.product = parseInt(_self.data.userDetails.pickup);
          shipping.quantity = 1;
          _self.data.order.items.push(angular.copy(shipping));
        }

        //FORCE NORMAL PRODUCTION TYPE
        _self.data.userDetails.type = -1;

        //add shipping type selection to the order as a product, if it's different than normal shipping
        if(_self.data.userDetails.type != -1){
          shipping = {}
          shipping.product = parseInt(_self.data.userDetails.type);
          shipping.quantity = 1;
          _self.data.order.items.push(angular.copy(shipping));
        }

        _self.data.order.email = _self.data.userDetails.mail;
        //hardcoded to 1 because it only support MercadoPago. Should pickup from array configuration.paymentMethods
        _self.data.order.payment_gateway = 1;

        //store picture quantities of each product in the database
        aux['shipping'] = _self.data.userDetails.pickup;
        aux['shippingType'] = _self.data.userDetails.type;
        // aux['quantity'] = angular.copy(_self.data.pictureQuantities);
        // aux['proportions'] = angular.copy(_self.data.pictureProportions);
        aux['data'] = {};
        aux.data['orderFolderName'] = _self.data.orderFolderName;
        aux.data['productWithFolder'] = _self.data.productWithFolder;

        _self.data.order.extraData = angular.copy(aux);
        //when the object is created the OrderResource is created

        var orderToSend = new OrderResource(_self.data.order);
        orderToSend.$save(function(response){
          if(response.id){
            //if the response is successful, empty the cart
            LocalStorageService.emptyCart();
            //payment gateway id is harcoded to 1, because we're only using MercadoPago for now
            PaymentGatewayResource.get({order_id:response.id, payment_gateway_id:1, payment_method_id:_self.data.userDetails.payment}, function(response){
              if(response.payment_url){
                window.location.href = response.payment_url;
              }else{
                _self.showSendError();
              }
            });
          }else{
            //status 200 error callback
            _self.showSendError();
          }
        },
        function(response){
          //status 400 error callback
          _self.showSendError();
        })

      },

      //shows the error message and hides it 10 seconds later
      showSendError:function(){
        _self.data.showSendError = true;
        //changes the next step button text
        ResumenCompraService.data.orderLoading = false;
        ResumenCompraService.data.nextStepReadyMessage = '* error de envío';
        $timeout( function(){
          //after 10 seconds, hides the error and re-enables the send button
          _self.data.showSendError = false;
          ResumenCompraService.data.nextStepReady = true;
        }, 10000 );
      }

    }
    return _self;

  }]);
