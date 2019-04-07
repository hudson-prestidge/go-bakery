window.onload = function () {
    getCartProducts();
};
const getCartProducts = function () {
    const getCart = new XMLHttpRequest;
    getCart.open("GET", "/api/v1/users/cart");
    getCart.onload = function () {
        const cartData = JSON.parse(this.response);
        console.log(cartData);
    };
    getCart.onerror = function (err) {
        console.log(err);
    };
    getCart.send();
};
//# sourceMappingURL=cart.js.map