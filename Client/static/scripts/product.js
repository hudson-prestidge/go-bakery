window.addEventListener('load', function (e) {
    console.log('loaded page');
    getProducts();
});
var getProducts = function () {
    var getProd = new XMLHttpRequest();
    getProd.open('GET', '/api/v1/products');
    getProd.onload = function () {
        var data = JSON.parse(this.response);
        console.log(data);
        var windows = document.querySelectorAll('.product-data');
        for (var i = 0; i < data.length; i++) {
            windows[i].textContent = data[i].Id + ": " + data[i].Name;
        }
    };
    getProd.onerror = function (err) {
        console.log(err);
    };
    getProd.send();
};
//# sourceMappingURL=product.js.map