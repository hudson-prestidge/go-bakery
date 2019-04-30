window.onload = function () {
    const popup = document.querySelector("#notification-popup");
    const popupText = document.querySelector(".notification-text");
    getProductData(setupProductWindows);
    if (getUrlParameter('transaction') === 'complete') {
        popupText.textContent = "Order successful!";
        popup.classList.add("popping-up");
    }
};
const addProductToCart = function (productId) {
    const updateCart = new XMLHttpRequest();
    const popup = document.querySelector("#notification-popup");
    const popupText = document.querySelector(".notification-text");
    popup.addEventListener("animationend", function () {
        popup.classList.remove("popping-up");
    });
    updateCart.open("POST", "/api/v1/users/cart");
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
        const products = JSON.parse(this.response);
        callback(products);
    };
    getProducts.onerror = function (err) {
        console.log(err);
    };
    getProducts.send();
};
const setupProductWindows = function (products) {
    const randomizedData = shuffleArray(products);
    const windows = document.querySelectorAll('.product-window');
    for (let i = 0; i < windows.length; i++) {
        const productData = windows[i].querySelector('.product-data');
        const productId = windows[i].querySelector('.product-id');
        const productImage = windows[i].querySelector('.product-img');
        productId.textContent = `${randomizedData[i].Id}`;
        productImage.src = `../img/${randomizedData[i].Image_name}.jpg`;
        productData.textContent = `${randomizedData[i].Name}, \$${(randomizedData[i].Price / 100).toFixed(2)}`;
    }
    const productWindows = Array.from(windows);
    productWindows.forEach(function (productWindow) {
        let addButton = productWindow.querySelector('.add-product-button');
        let productData = productWindow.querySelector('.product-data');
        productWindow.addEventListener('mouseenter', function (e) {
            addButton.style.animation = 'slideUp 500ms forwards';
            productData.style.animation = 'slideDown 500ms forwards';
        });
        productWindow.addEventListener('mouseleave', function (e) {
            addButton.style.animation = 'slideDown 500ms forwards';
            productData.style.animation = 'slideUp 500ms forwards';
        });
        productWindow.addEventListener('click', function (e) {
            const productId = Number(productWindow.querySelector(".product-id").textContent);
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
        newArr.push(arrCopy[index]);
        arrCopy.splice(index, 1);
    }
    return newArr;
};
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
;
//# sourceMappingURL=index.js.map