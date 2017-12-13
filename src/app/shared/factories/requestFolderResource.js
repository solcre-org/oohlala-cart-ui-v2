app.factory("RequestFolderResource", [
  '$resource',
  'Configuration',
  function (
    $resource,
    Configuration
  ) {

    return new $resource(configuration.apiUrl+configuration.requestFolderUri, {},
      {
        save:{
          method:'POST'
          ,
          headers : {
            'Content-Type': undefined
          }
        }



      });

    }]);
