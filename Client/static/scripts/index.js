window.onload = function () {
    getProductData(setupProductWindows);
    getUserData();
};
const addProductToCart = function (productId) {
    const updateCart = new XMLHttpRequest();
    const popup = document.querySelector("#notification-popup");
    const popupText = document.querySelector(".notification-text");
    popup.addEventListener("animationend", function () {
        popup.classList.remove("popping-up");
    });
    updateCart.open("PUT", "/api/v1/users/cart");
    updateCart.setRequestHeader("Content-Type", "application/json");
    updateCart.onload = function () {
        popupText.textContent = this.response;
        popup.classList.add("popping-up");
    };
    updateCart.send(JSON.stringify({ "id": `${productId}` }));
};
const getUserData = function () {
    const getUsers = new XMLHttpRequest();
    getUsers.open("GET", "/api/v1/users");
    getUsers.onload = function () {
        if (this.response != 'null') {
            const userData = JSON.parse(this.response)[0];
            const username = userData.Username;
            const userDisplay = document.querySelector('#user-display');
            userDisplay.classList.remove('hidden');
            const userGreeting = document.querySelector('#user-greeting');
            userGreeting.textContent = `Welcome, ${username}!`;
            const loginLogoutLink = document.querySelector("#login-logout-link");
            loginLogoutLink.setAttribute("href", "/logout");
            loginLogoutLink.textContent = "Logout";
        }
    };
    getUsers.onerror = function (err) {
        console.log(err);
    };
    getUsers.send();
};
const getProductData = function (callback) {
    const getProducts = new XMLHttpRequest();
    getProducts.open('GET', '/api/v1/products');
    getProducts.onload = function () {
        const data = JSON.parse(this.response);
        const windows = document.querySelectorAll('.product-data');
        for (let i = 0; i < windows.length; i++) {
            windows[i].textContent = `${data[i].Id}: ${data[i].Name}, \$${(data[i].Price / 100).toFixed(2)}`;
        }
        const products = Array.from(document.getElementsByClassName('product-window'));
        callback(products);
    };
    getProducts.onerror = function (err) {
        console.log(err);
    };
    getProducts.send();
};
const setupProductWindows = function (products) {
    products.forEach(function (product) {
        let addButton = product.querySelector('.add-product-button');
        product.addEventListener('mouseenter', function (e) {
            addButton.style.animation = 'slideIn 500ms forwards';
        });
        product.addEventListener('mouseleave', function (e) {
            addButton.style.animation = 'slideOut 500ms forwards';
        });
        product.addEventListener('click', function (e) {
            const productInfo = product.querySelector(".product-data");
            const productId = parseInt(productInfo.textContent.match(/(\d)+:/)[1]);
            addProductToCart(productId);
        });
    });
};
//# sourceMappingURL=index.js.map