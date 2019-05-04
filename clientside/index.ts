window.onload = function() :void {
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  getProductData(setupProductWindows)

  if(getUrlParameter('transaction') === 'complete') {
    popupText.textContent = "Order successful!"
    popup.classList.add("popping-up")
  }
}

interface Product {
  Id: number,
  Name: string,
  Price: number
  Image_name: string
}

const addProductToCart = function (productId :Number) :void {
  const updateCart = new XMLHttpRequest()
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  popup.addEventListener("animationend", function() :void {
    popup.classList.remove("popping-up")
  })

  updateCart.open("POST", "/api/v1/users/cart")
  updateCart.setRequestHeader("Content-Type", "application/json")
  updateCart.onload = function() :void {
   popupText.textContent = this.response
   popup.classList.add("popping-up")
  }
  updateCart.send(JSON.stringify({"id": `${productId}`}))
}


const getProductData = function(callback?: (products :Product[]) => void) :void{
  const getProducts = new XMLHttpRequest()
  getProducts.open('GET', '/api/v1/products')
  getProducts.onload = function() :void {
    const products = JSON.parse(this.response)
    callback(products)
  }
  getProducts.onerror = function(err) :void {
    console.log(err)
  }
  getProducts.send()
}

const setupProductWindows = function (products :Product[]) :void {

  const randomizedData = shuffleArray(products)
  const windows = document.querySelectorAll('.product-window')
  for(let i = 0; i < windows.length; i++) {
    const productData = windows[i].querySelector('.product-data')
    const productId = windows[i].querySelector('.product-id')
    const productImage = <HTMLImageElement> windows[i].querySelector('.product-img')
    productId.textContent = `${randomizedData[i].Id}`
    productImage.src = `../img/${randomizedData[i].Image_name}.jpg`
    productData.textContent = `${randomizedData[i].Name}, \$${(randomizedData[i].Price/100).toFixed(2)}`
  }
  const productWindows :Element[] = Array.from(windows)

  productWindows.forEach(function(productWindow) :void {
    let addButton = <HTMLElement> productWindow.querySelector('.add-product-button')
    let productData = <HTMLElement> productWindow.querySelector('.product-data')

    productWindow.addEventListener('mouseenter', function(e) :void {
      addButton.style.animation = 'slideUp 500ms forwards'
      productData.style.animation = 'slideDown 500ms forwards'
    })

    productWindow.addEventListener('mouseleave', function(e) :void {
      addButton.style.animation = 'slideDown 500ms forwards'
      productData.style.animation = 'slideUp 500ms forwards'
    })

    productWindow.addEventListener('click', function(e) :void {
      const productId :number = Number(productWindow.querySelector(".product-id").textContent)
      addProductToCart(productId)
    })

  })
}

const shuffleArray = function (arr :any[]) :any[] {
  let arrCopy = arr.slice()
  let newArr :any[] = []
  let index :number
  while(arrCopy.length > 0) {
    index = Math.floor(Math.random()*arrCopy.length)
    newArr.push(arrCopy[index])
    arrCopy.splice(index, 1)
  }
  return newArr
}

function getUrlParameter(name :string) :string {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
