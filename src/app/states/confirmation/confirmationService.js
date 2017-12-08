app.service("ConfirmationService", [
  '$state',
  '$stateParams',
  'Configuration',
  function (
    $state,
    $stateParams,
    Configuration
  ) {

    var _self = {
      data:{
        success:false,
        title:'',
        message:'',
        dataMessage:''

      },

      initialize:function(){
        _self.data.success = $stateParams.success;
        if(_self.data.success){
          _self.data.title = Confirmation.successTitle;
          _self.data.message = Confirmation.successMessage;
          _self.data.dataMessage = 'realizado';
        }else{
          _self.data.title = Configuration.confirmationFailTitle;
          _self.data.message = Configuration.confirmationFailMessage + '<span class="bold-order">'+$stateParams.orderId+'</span>'+ Configuration.confirmationFailMessageClose;
          _self.data.dataMessage = 'error';
        }
      }



    }
    return _self;

  }]);
