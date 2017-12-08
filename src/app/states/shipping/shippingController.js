app.controller("ShippingController", [
  '$scope',
  'ShippingService',

  function (
    $scope,
    ShippingService
  ) {

    $scope.data = ShippingService.data;

    ShippingService.initialize();

    $scope.validateForm = ShippingService.validateForm;
    $scope.onShippingMethodSelect = ShippingService.onShippingMethodSelect;


  }]);
