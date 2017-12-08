app.directive('resumenCompraDirective', [
  '$rootScope',
  'ResumenCompraService',
  function (
    $rootScope,
    ResumenCompraService
  ) {
    return {
      restrict: 'E',
      templateUrl:'app/shared/directives/resumenCompra/resumenCompraDirective.html',
      replace:true,
      scope: {
        onNextStateClick:'&',
        showShippingCost:'='
      },
      link: function (scope, element, attrs) {

        scope.data = ResumenCompraService.data;

        ResumenCompraService.initialize();

      }
    }
  }
]);
