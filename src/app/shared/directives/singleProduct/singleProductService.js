app.service("SingleProductService", [
  '$rootScope',
  '$timeout',
  'Upload',
  'Configuration',
  function (
    $rootScope,
    $timeout,
    Upload,
    Configuration
  ) {

    var _self = {
      data:{
        dropMessage:""
      },

      initialize:function(){

      },

      setDropMessage:function(paid){
        if(paid){
          _self.data.dropMessage = "Haga click para añadir fotos o arrástrelas hasta aquí. <em>(Máx. 10mb)</em>";
        }else{
          _self.data.dropMessage = "Debe abonar la orden para poder agregar fotos.";
        }
      },


      //THERE IS ONLY ONE INSTANCE OF THIS SERVICE SHARED BETWEEN EVERY DIRECTIVE
      //THAT'S WHY THE METHODS HAVE TO BE INDEPENDENT FROM DOM ELEMENTS

      //store picture file in target array
      upload:function (files, targetArray, id, maxPictures, loadedPictures, proportions, callbackFunction) {
        //tells the controller if the album got overflown or if a file is too large
        // Error variable is used as a global flag for errors
        var overflownAlbum = false;
        var fileOverSizeLimit = false;
        var error = false;
        var objectToSave = {};
        //could receive multiple files
        files.forEach(function(pictureFile, index){
          // If the picture is over 10MB in size, mark the flag to display the error message
          // and exit this iteration.
          // The rest of the files should upload correctly
          if(pictureFile.size > 10000000){
            error = true;
            fileOverSizeLimit = true;
            return false;
          }

          if(loadedPictures >= maxPictures){
            error = true;
            overflownAlbum = true;
          }else{
            //assigns a new id to the file. Each controller tracks their own ids.
            objectToSave.id = _self.getPictureId(id);
            //assigns a quantity number for revelado of this picture
            objectToSave.quant = 1;
            //Its necesary to save the file to upload to the server afterwards
            objectToSave.file = pictureFile;

            //save object to the array
            targetArray.push(objectToSave);
            //converts the picture to base64 to store in the array as data
            //_self.getBase64(pictureFile, targetArray, targetArray.length-1);
            _self.getBase64(pictureFile, targetArray, objectToSave, proportions, callbackFunction);
            //reset object for next file
            objectToSave = {};
            loadedPictures++;
          }
        })
        return {'error': error, 'overflownAlbum': overflownAlbum, 'fileOverSizeLimit': fileOverSizeLimit};
      },

      //recieves an object with 'id' property. Increments it and returns it.
      getPictureId:function(id){
        id.id = id.id + 1;
        return id.id;
      },

      //returns a file in base64
      getBase64:function(file, array, object, proportions, callbackFunction) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          object.base64 = reader.result;
          //when the base64 is loaded, a new image object is created to get the image size
          var auxImage = new Image();
          //the base64 is loaded as imge src
          auxImage.src = reader.result;
          auxImage.onload = function(){
            //a timeout is needed to make sure the change is rendered in the digest cycle
            $timeout(function(){



              //image size is stored in the object for rotation
              object.width = auxImage.width;
              object.height = auxImage.height;
              //evaluates if the picture poportions are within the album's by the accuracy specified in the configuration file
              if(proportions!=-1){

                //THE NEXT LINE IS COMMENTED BECAUSE THE CUSTOMER ASKED NOT TO MAKE
                //PROPORTION ACCURATE RESIZING COMPULSORY.
                //TO REVERT, COMMENT ocject.proportions = true; AND UNCOMMENT THE FOLLOWING LINE
                object.proportions = true;

                // object.proportions = Math.abs((auxImage.width / auxImage.height) - proportions ) < Configuration.proportionAccuracy

              }else{
                object.proportions = true;
              }

              callbackFunction();
            });
            // $rootScope.$digest();



          }
        };
        //error on converstion is not yet implemented
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      },

      //receives an array of pictures and an array of selections
      //index of each selection corresponds to the id of the image to delete
      deletePictures:function(picturesArray, deleteArray){
        var index = null;
        //go through the selection array
        for(var i in deleteArray){
          if(deleteArray[i]){
            //find the index of the picture with the id corresponding to the index of the selection
            index = picturesArray.map(function(e){return e.id;}).indexOf(parseInt(i));
            if(index > -1){
              //delete that item
              picturesArray.splice(index, 1);
            }
          }
        }
      }


    }

    return _self;

  }]);
