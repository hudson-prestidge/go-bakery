window.onload = function () {
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
};
//# sourceMappingURL=index.js.map