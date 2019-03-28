window.addEventListener('load', function (e) {
    const products = Array.from(document.getElementsByClassName('product-window'));
    products.forEach(function (product) {
        let addButton = product.querySelector('.add-product-button');
        product.addEventListener('mouseenter', function (e) {
            addButton.style.animation = 'slideIn 500ms forwards';
        });
        product.addEventListener('mouseleave', function (e) {
            addButton.style.animation = 'slideOut 500ms forwards';
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
            windows[i].textContent = `${data[i].Id}: ${data[i].Name}, \$${data[i].Price / 100}`;
        }
    };
    getProd.onerror = function (err) {
        console.log(err);
    };
    getProd.send();
};
//# sourceMappingURL=product.js.map