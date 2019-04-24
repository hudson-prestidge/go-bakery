window.onload = function () {
    const getUserData = new XMLHttpRequest();
    getUserData.open("GET", "/api/v1/users");
    getUserData.onload = function () {
        const userData = JSON.parse(this.response);
        if (Array.isArray(userData)) {
            const username = userData[0].Username;
            const userGreeting = document.querySelector('#user-greeting');
            userGreeting.textContent = `Welcome, ${username}!`;
            const userDisplay = document.querySelector('#user-display');
            userDisplay.classList.remove('hidden');
            const loginLogoutLink = document.querySelector("#login-logout-link");
            loginLogoutLink.setAttribute("href", "/logout");
            loginLogoutLink.textContent = "Logout";
        }
    };
    getUserData.onerror = function (err) {
        console.log(err);
    };
    getUserData.send();
    getProductData(setupProductWindows);
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
const getProductData = function (callback) {
    const getProducts = new XMLHttpRequest();
    getProducts.open('GET', '/api/v1/products');
    getProducts.onload = function () {
        const data = JSON.parse(this.response);
        const randomizedData = shuffleArray(data);
        console.log(data);
        console.log(randomizedData);
        const windows = document.querySelectorAll('.product-window');
        for (let i = 0; i < windows.length; i++) {
            const productData = windows[i].querySelector('.product-data');
            const productImage = windows[i].querySelector('.product-img');
            productImage.src = `../img/${randomizedData[i].Image_name}.jpg`;
            productData.textContent = `${randomizedData[i].Name}, \$${(randomizedData[i].Price / 100).toFixed(2)}`;
        }
        const products = Array.from(windows);
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
        let productData = product.querySelector('.product-data');
        product.addEventListener('mouseenter', function (e) {
            addButton.style.animation = 'slideUp 500ms forwards';
            productData.style.animation = 'slideDown 500ms forwards';
        });
        product.addEventListener('mouseleave', function (e) {
            addButton.style.animation = 'slideDown 500ms forwards';
            productData.style.animation = 'slideUp 500ms forwards';
        });
        product.addEventListener('click', function (e) {
            const productInfo = product.querySelector(".product-data");
            const productId = parseInt(productInfo.textContent.match(/(\d)+:/)[1]);
            addProductToCart(productId);
        });
    });
};
const shuffleArray = function (arr) {
    let arrCopy = arr.slice();
    let newArr = [];
    let index;
    while (arrCopy.length > 0) {
        index = Math.floor(Math.random() * arrCopy.length);
        console.log(index);
        newArr.push(arrCopy[index]);
        arrCopy.splice(index, 1);
    }
    return newArr;
};
//# sourceMappingURL=index.js.map