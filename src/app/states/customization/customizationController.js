app.controller("CustomizationController", [
  '$scope',
  'CustomizationService',

  function (
    $scope,
    CustomizationService
  ) {

    $scope.data = CustomizationService.data;

    CustomizationService.initialize();

    $scope.uploadToServer = CustomizationService.uploadToServer;
    $scope.showOverflowError = CustomizationService.showOverflowError;
    $scope.getReady = CustomizationService.getReady;

    $scope.requestFolder = CustomizationService.requestFolder;

  }]);
