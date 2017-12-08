app.factory("PictureResource", [
  '$resource',
  'Configuration',
  function (
    $resource,
    Configuration
  ) {

    return new $resource(configuration.apiUrl+configuration.uploadUri, {},
      {
        save:{
          method:'POST',
          headers : {
            'Content-Type': undefined
        }
        /*  transformRequest:function(data) {


            if (data === undefined){
            return data;
          }
            var fd = new FormData();
            angular.forEach(data, function(value, key) {
              if (value instanceof FileList) {
                if (value.length == 1) {
                  fd.append(key, value[0]);
                } else {
                  angular.forEach(value, function(file, index) {
                    fd.append(key + '_' + index, file);
                  });
                }
              } else {
                fd.append(key, value);
              }
            });
            return fd;
          }
*/
        }



      });

    }]);
