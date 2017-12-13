app.controller("CartController", [
  '$scope',
  'CartService',
  'OrdersService',
  function (
    $scope,
    CartService,
    OrdersService
  ) {

    $scope.data = CartService.data;

    CartService.initialize();

    $scope.productsInCart = OrdersService.data.productsInCart;

    $scope.updateQuantities = CartService.updateQuantities;
    $scope.deleteProduct = CartService.deleteProduct;
    $scope.goToCustomization = CartService.goToCustomization;

  }]);
