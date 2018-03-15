app.directive('singleProductDirective', [
  '$rootScope',
  '$timeout',
  'SingleProductService',
  'Upload',
  function (
    $rootScope,
    $timeout,
    SingleProductService,
    Upload
  ) {
    return {
      restrict: 'E',
      templateUrl:'app/shared/directives/singleProduct/singleProductDirective.html',
      replace:true,
      scope: {
        showOverflow: '&',
        getReadyStatus: '&',
        model: '=',
        maxPictures: '=',
        proportions: '=',
        name: '=',
        revelado: '=',
        ready: '=',
        giftMessage: '=',
        paid: '=',
        mobileMode : '='

      },
      link: function (scope, element, attrs) {
        //THERE IS LOGIC IN THIS CONTROLLER BECAUSE OF MULTIPLE INSTANCES OF THE
        //DIRECTIVE SHARING THE SAME INSTANCE OF THE SERVICE.

        //maps the current state of the product
        //possible states are 'default', 'delete' and 'orden'
        //used only for styling and showing DOM elements
        scope.state = {'state': 'default'};
        //auxiliary array, tracks pictures as they are selected for delete
        scope.picturesToDelete = {};
        //shows gift text field
        scope.isGift = false;
        //counter to track current picture id
        //it is declared as an object so that it can be passed to the service
        //and it can update the value. If it was an int only the value is passed
        scope.lastPicture = {'id':0};
        //options for the sort plugin. Starts dissabled, state change enables it
        scope.sortableOptions={handle: '> .myHandle', disabled: true};
        //auxiliary array used to store previous sort in case the user cancels the sort
        scope.picturesSortAux = [];
        //opens the edit panel for revelado pictures
        scope.editMode = false;
        //image that is in edit mode
        scope.editingPicture = {};
        //available quantities for revelados
        scope.pictureQuantForPrint = [];

        // scope.pictureId = SingleProductService.data.pictureId;
        //Cropper object. Needs to be a scope attribute so that it can be accessed from multiple methods
        scope.croppingImage = null;
        //temporary store for quantity drop-down, in case the user cancels
        scope.croppingImageQuant = 1;
        //hides the picture before the Cropper UI is ready. ng-show on the img binds to this
        scope.editPictureReady = false;

        scope.loadedPictures = 0;

        SingleProductService.initialize();
        SingleProductService.setDropMessage(scope.paid);

        // scope.dropMessage = SingleProductService.data.dropMessage;

        scope.data = SingleProductService.data;

        scope.problem = false;

        //upload files to memory. No API interaction yet
        scope.upload = function(files){
          //logic that's completely independent from DOM elements is in the service
          //uploads pictures to the array, returns true if the array still has room
          //for more pictures.
          if(SingleProductService.upload(files, scope.model, scope.lastPicture, scope.maxPictures, scope.loadedPictures, scope.proportions, scope.getLoadedPictures)){
            scope.showOverflow();
          };
          // scope.getLoadedPictures();
        }

        //receives a string and sets it as the current state
        //resets some auxiliary variables
        scope.setState = function(newState){
          //turns of picture sorting and deletes sorting aux array
          //there is no "exit picture sorting mode" so it has to be here
          scope.sortableOptions.disabled = true;
          scope.picturesSortAux = [];
          //selected pictures to delete are stored in an array. state change resets it
          scope.resetPicturesToDelete();
          //sets state
          scope.state.state = newState;
        }

        //selecting pictures is broken with jQuery in the project, so it needs
        //to be done via the controller
        scope.markPicture = function(id){
          scope.picturesToDelete[id] = !scope.picturesToDelete[id];
        }

        //delete selected pictures
        scope.deletePictures = function(){
          //the logic is in the service
          //the methdod returns if the album is ready after the deletion
          SingleProductService.deletePictures(scope.model, scope.picturesToDelete);
          scope.setState('default');
          scope.getLoadedPictures();
        }

        //resets the array that stores the pictures to delete
        scope.resetPicturesToDelete = function(){
          scope.picturesToDelete = {};
        }

        //marks all pictures as ready to delete
        scope.setAllPicturesToDelete = function(){
          //becaus of how picturesToDelete uses its indexes, its important to
          //use the current index instead of picturesInProduct.length
          for(var i = 0; i<=scope.lastPicture.id; i++){
            //marks all as true
            scope.picturesToDelete[i] = true;
          }
        }

        //'orden' state needs a function because it does a few things on entering
        scope.enterSortState = function(){
          scope.setState('orden');
          //store the current picture order in case the user cancels the sorting
          scope.model.forEach(function(picture, index){
            //only stores ids, no need to duplicate file objects
            scope.picturesSortAux.push(picture.id);
          })
          // If the webpage is not being open on mobile, enable the drag-sorting
          // If it's open on mobile, arrows appear for sorting one by one
          if(!scope.mobileMode){
            //enable sorting
            scope.sortableOptions.disabled = false;
          }
        }

        // Changes the order of a specific picture when clicking on the arrow buttons
        scope.changeSort = function(picturePosition, moveLeft){
          if(moveLeft){
            scope.model.splice(picturePosition-1, 0, angular.copy(scope.model[picturePosition]));
            scope.model.splice(picturePosition+1, 1);
          }else{
            scope.model.splice(picturePosition+2, 0, angular.copy(scope.model[picturePosition]));
            scope.model.splice(picturePosition, 1);
          }


        }

        //in case the user cancels the sorting
        scope.reversePictureOrder = function(){
          var index = null;
          //go throguh the stored picture order
          for(var i in scope.picturesSortAux){
            //for each item, find the picture with that id and return the index
            index = scope.model.map(function(e){
              return e.id;
            }).indexOf(parseInt(scope.picturesSortAux[i]));
            if(index > -1){
              //push that picture again in the end of the array
              scope.model.push(scope.model[index]);
            }
          }
          //delete the first pictures (the ones with the new order)
          scope.model.splice(0, scope.picturesSortAux.length);
          //exit sorting state
          scope.setState('default');
        }

        //opens the modal and loads the picture to edit
        scope.openEditPicture = function(picture){
          scope.editingPicture = picture;
          scope.editMode = true;

          //the modal needs to be fully loaded before entering crop state
          $timeout( function(){
            scope.startCropping();
          }, 300 );
        }

        //creates and loads the cropper for the image
        scope.startCropping = function(){
          var ratio = NaN;
          if(scope.proportions != -1){
            ratio = scope.proportions;
          }

          scope.croppingImage = new Cropper(angular.element(element).find('#cropImage')[0], {
            // options for the cropper:
            //restrict the crop box to not exceed the size of the canvas
            viewMode: 1,
            //Define the dragging mode of the cropper. Other options: drag, none
            dragMode: 'crop',
            //Re-render the cropper when resize the window.
            responsive: true,
            //Show the grid background of the container.
            background: true,
            //Enable to move the image.
            movable: false,
            //Enable to scale the image.
            scalable: false,
            //Enable to zoom the image.
            zoomable: false,
            //set aspect ratio based on the product proportions
            aspectRatio: ratio,
            //Restore the cropped area after resize the window.
            restore:true,
            //Enable to toggle drag mode between "crop" and "move" when click twice on the cropper.
            toggleDragModeOnDblclick:false,
            //when cropper is fully loaded
            ready: function(){
              //set the initial crop box at 100% of the image size
              scope.croppingImage.setData({
                width:scope.editingPicture.width,
                height:scope.editingPicture.height
              });
              scope.editPictureReady = true;
              scope.loadNumberOfCopies();
            }
          });
        }

        //calculates the number of copies available for each pictures in revelado
        scope.loadNumberOfCopies = function(){
          //this variable stores the number of pictures already selected for revleado
          var pictureQuantTotal = 0;
          //this variable stores the number of pictures available
          var  maxPictureQuant = 0;
          //go through the pictures array and load each quant
          scope.model.forEach(function(picture, index){
            pictureQuantTotal = pictureQuantTotal + picture.quant;
          })

          //you can always select one picture, so if the number of available pictures
          //is less than 1, 1 is selected always
          if(scope.maxPictures - pictureQuantTotal + scope.editingPicture.quant < 1){
            maxPictureQuant = 1;
          }else{
            //if not, the remaining number is calculated
            maxPictureQuant = scope.maxPictures - pictureQuantTotal + scope.editingPicture.quant;
          }

          scope.pictureQuantForPrint = [];

          //values are pushed into the array, depending on the available pictures
          for(var i = 1; i <= maxPictureQuant; i++){
            scope.pictureQuantForPrint.push(i);
          }
          $rootScope.$digest();
        }

        //rotates the cropping box 90 degrees
        scope.rotateCounter = function(){
          var currentCropper = {};
          //gets the current cropper configuration
          currentCropper = scope.croppingImage.getData();
          //sets the aspect ratio exchanging current values

          if(scope.proportions != -1){
            scope.croppingImage.setAspectRatio(currentCropper.height / currentCropper.width);

            //makes the cropper box as big as possible
            scope.croppingImage.setData({
              width:scope.editingPicture.width,
              height:scope.editingPicture.height
            })
          }else{
            scope.croppingImage.setData({
              width:currentCropper.height,
              height:currentCropper.width
            })
          }

          //PREVIOUS BEHAVIOUR: ROTATE BUTTON ROTATES THE IMAGE NOT THE CROPPER BOX

          // var auxWidth = 0;
          // //set the cropping area to a 10th the picture size, and centered.
          // scope.croppingImage.setData({
          //   width:scope.editingPicture.height/10,
          //   height:scope.editingPicture.width/10,
          //   x:scope.editingPicture.width/2,
          //   y:scope.editingPicture.height/2
          // });
          //
          // scope.croppingImage.rotate(-90);
          // //because the picture is now rotated, width becomes height and vice-versa
          // //it's necessary to store that change for further rotations
          // auxWidth = scope.editingPicture.width;
          // scope.editingPicture.width = scope.editingPicture.height;
          // scope.editingPicture.height = auxWidth;
        }

        //close the crop image modal, reset variables
        scope.closeEditPicture = function(){
          scope.editMode = false;
          //if the cropper instance is not destroyed, only the first image can be edited ever
          scope.croppingImage.destroy();
          scope.croppingImage = null;
          //hide the image for the next cropper window
          scope.editPictureReady = false;
        }

        //tracks the number and proportions of loaded pictures and determines if the product is ready
        scope.getLoadedPictures = function(){
          var allProportionsOk = true;
          scope.loadedPictures = 0;
          scope.model.forEach(function(picture, index){
            //it has to account for the number of copies in each album
            scope.loadedPictures = scope.loadedPictures + picture.quant;
            allProportionsOk = allProportionsOk && picture.proportions;
          })
          if(scope.loadedPictures == scope.maxPictures){
            if(allProportionsOk){
              //scope.ready tracks if the album is ready to upload
              scope.ready = true;
              //problem paints the album picture color in red to indicate a problem with the album
              scope.problem = false;
            }else{
              scope.ready = false;
              scope.problem = true;
            }
          }else{
            scope.ready = false;
            scope.problem = false;
          }
          //getReadyStatus() maps to getReady in the controller
          scope.getReadyStatus();

        }



        //when the crop is done, the image needs to be stored
        scope.getCroppedImage = function(){
          //convert the cropped image to a blob
          scope.croppingImage.getCroppedCanvas().toBlob(function(blob){
            //the blob is stored, it will be converted to FormData at the end of the process

            // get the base64 of the file
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function () {
              //overwrite the object properties to the array properties
              scope.editingPicture.base64 = reader.result;
              scope.editingPicture.file = blob;
              scope.editingPicture.quant = scope.croppingImageQuant;
              scope.editingPicture.proportions = true;
              scope.getLoadedPictures();
              $rootScope.$digest();
            };
            //error on converstion is not yet implemented
            reader.onerror = function (error) {
              console.log('Error: ', error);
            };
            // }, 'image/jpeg', 1);
          });
          //changes are stored so the modal is closed
          scope.closeEditPicture();
        }
      }
    }
  }
]);
