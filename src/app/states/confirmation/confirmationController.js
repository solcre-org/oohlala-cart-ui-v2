app.controller("ConfirmationController", [
  '$scope',
  'ConfirmationService',
  function (
    $scope,
    ConfirmationService
  ) {

    $scope.data = ConfirmationService.data;

    ConfirmationService.initialize();

  }]);
