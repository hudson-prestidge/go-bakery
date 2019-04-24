window.onload = function () {
    retrieveCartProducts(setupCartList);
    getUserData();
    const checkoutButton = document.querySelector('#checkoutbtn');
    checkoutButton.addEventListener('click', checkout);
};
const retrieveCartProducts = function (callback) {
    const getCart = new XMLHttpRequest;
    getCart.open("GET", "/api/v1/users/cart");
    getCart.onload = function () {
        const cartData = JSON.parse(this.response);
        const items = cartData.Items;
        const products = cartData.Products;
        const itemQuantities = {};
        products.forEach(function (p) {
            itemQuantities[p.Id] = 0;
        });
        items.forEach(function (n) {
            itemQuantities[n] += 1;
        });
        callback(products, itemQuantities);
    };
    getCart.onerror = function (err) {
        console.log(err);
    };
    getCart.send();
};
const checkout = function () {
    const checkoutCart = new XMLHttpRequest;
    checkoutCart.open("POST", "/api/v1/transactions");
    checkoutCart.onload = function () {
        window.location.replace("/");
    };
    checkoutCart.send();
};
const setupCartList = function (products, itemQuantities) {
    const cartList = document.querySelector("#cart-list");
    let subtotalPrice = 0;
    products.forEach(function (p) {
        let productRow = document.createElement("tr");
        productRow.classList.add("product-row");
        let productName = document.createElement("td");
        productName.textContent = p.Name;
        let productQuantity = document.createElement("td");
        productQuantity.textContent = `${itemQuantities[p.Id]}`;
        let productPrice = document.createElement("td");
        productPrice.textContent = `$${(p.Price / 100 * itemQuantities[p.Id]).toFixed(2)}`;
        subtotalPrice += (p.Price / 100 * itemQuantities[p.Id]);
        productRow.appendChild(productName);
        productRow.appendChild(productQuantity);
        productRow.appendChild(productPrice);
        cartList.appendChild(productRow);
    });
    let totalRow = document.createElement("tr");
    totalRow.classList.add("total-row");
    let namePlaceholder = document.createElement("td");
    namePlaceholder.textContent = "total:";
    let quantityPlaceholder = document.createElement("td");
    let totalPrice = document.createElement("td");
    totalPrice.textContent = `$${subtotalPrice.toFixed(2)}`;
    totalRow.appendChild(namePlaceholder);
    totalRow.appendChild(quantityPlaceholder);
    totalRow.appendChild(totalPrice);
    cartList.appendChild(totalRow);
};
//# sourceMappingURL=cart.js.map