app.factory("OrderResource", [
  '$resource',
  'Configuration',
  function (
    $resource,
    Configuration
  ) {

    return new $resource(configuration.cartOrderUrl, {},
      {
        save:{
          method:'POST',
          headers: {'Accept': 'application/vnd.ecommerce.v2+json'}
        }



      });

    }]);
