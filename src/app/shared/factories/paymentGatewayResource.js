app.factory("PaymentGatewayResource", [
  '$resource',
  'Configuration',
  function (
    $resource,
    Configuration
  ) {


    return new $resource(configuration.paymentGatewayUrl, {
      'order_id':'@orderId',
      'payment_gateway_id':'1',
      'payment_method_id=':'@paymentMethod'},{
        get:{
          method: 'GET',
          headers: {'accept':'application/vnd.ecommerce.v2+json'}
        }
      });
    }]);
