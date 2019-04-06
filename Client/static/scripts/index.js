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
    addProductToCart(2);
    const getUserData = new XMLHttpRequest();
    getUserData.open("GET", "/api/v1/users");
    getUserData.onload = function () {
        const userData = JSON.parse(this.response)[0];
        const username = userData.Username;
        const userGreeting = document.querySelector('#user-greeting');
        userGreeting.textContent = `Welcome, ${username}!`;
    };
    getUserData.onerror = function (err) {
        console.log(err);
    };
    getUserData.send();
};
const addProductToCart = function (productId) {
    const updateCart = new XMLHttpRequest();
    updateCart.open("PUT", "/api/v1/users/cart");
    updateCart.setRequestHeader("Content-Type", "application/json");
    updateCart.onload = function () {
        console.log(`attempting to add to cart: {"id": "${productId}"}`);
    };
    updateCart.send(JSON.stringify({ "id": `${productId}` }));
};
//# sourceMappingURL=index.js.map