window.addEventListener('load', function (e) {
    const products = Array.from(document.getElementsByClassName('product-window'));
    products.forEach(function (product) {
        let addButton = product.querySelector('.add-product-button');
        product.addEventListener('mouseenter', function (e) {
            addButton.classList.add('sliding-in');
            addButton.classList.remove('sliding-out');
        });
        product.addEventListener('mouseleave', function (e) {
            addButton.classList.remove('sliding-in');
            addButton.classList.add('sliding-out');
        });
    });
    getProducts();
});
const getProducts = function () {
    const getProd = new XMLHttpRequest();
    getProd.open('GET', '/api/v1/products');
    getProd.onload = function () {
        const data = JSON.parse(this.response);
        const windows = document.querySelectorAll('.product-data');
        for (let i = 0; i < data.length; i++) {
            windows[i].textContent = `${data[i].Id}: ${data[i].Name}, \$${(data[i].Price / 100).toFixed(2)}`;
        }
    };
    getProd.onerror = function (err) {
        console.log(err);
    };
    getProd.send();
};
//# sourceMappingURL=product.js.map