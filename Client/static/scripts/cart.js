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
        let productQuantity = document.createElement("input");
        productQuantity.classList.add('product-quantity');
        let productQuantityCell = document.createElement("td");
        productQuantity.value = `${itemQuantities[p.Id]}`;
        productQuantityCell.appendChild(productQuantity);
        let updateQuantityButton = document.createElement("button");
        updateQuantityButton.textContent = "Update";
        let updateQuantityCell = document.createElement("td");
        updateQuantityCell.appendChild(updateQuantityButton);
        updateQuantityButton.addEventListener('click', function () {
            itemQuantities[p.Id] = Number(productQuantity.value);
            updateCart(itemQuantities);
        });
        let productPrice = document.createElement("td");
        productPrice.textContent = `$${(p.Price / 100 * itemQuantities[p.Id]).toFixed(2)}`;
        subtotalPrice += (p.Price / 100 * itemQuantities[p.Id]);
        let removeFromCartButton = document.createElement("button");
        removeFromCartButton.textContent = "Remove From Cart";
        let buttonCell = document.createElement("td");
        removeFromCartButton.addEventListener('click', function (e) {
            delete itemQuantities[p.Id];
            console.log(itemQuantities);
            updateCart(itemQuantities);
        });
        buttonCell.appendChild(removeFromCartButton);
        productRow.appendChild(productName);
        productRow.appendChild(productQuantity);
        productRow.appendChild(updateQuantityCell);
        productRow.appendChild(productPrice);
        productRow.appendChild(buttonCell);
        cartList.appendChild(productRow);
    });
    let totalRow = document.createElement("tr");
    totalRow.classList.add("total-row");
    let namePlaceholder = document.createElement("td");
    namePlaceholder.textContent = "Total:";
    totalRow.appendChild(namePlaceholder);
    let quantityPlaceholder = document.createElement("td");
    totalRow.appendChild(quantityPlaceholder);
    quantityPlaceholder = document.createElement("td");
    totalRow.appendChild(quantityPlaceholder);
    let totalPrice = document.createElement("td");
    totalPrice.textContent = `$${subtotalPrice.toFixed(2)}`;
    totalRow.appendChild(totalPrice);
    cartList.appendChild(totalRow);
};
const updateCart = function (itemQuantities) {
    let newCart = [];
    for (let key in itemQuantities) {
        while (itemQuantities[key] > 0 && key != '0') {
            newCart.push(Number(key));
            itemQuantities[key]--;
        }
    }
    const updateCartRequest = new XMLHttpRequest;
    updateCartRequest.open("PUT", "/api/v1/users/cart");
    updateCartRequest.setRequestHeader("Content-Type", "application/json");
    updateCartRequest.onload = function () {
        location.reload();
    };
    updateCartRequest.send(JSON.stringify({ "list": `${newCart}` }));
};
//# sourceMappingURL=cart.js.map