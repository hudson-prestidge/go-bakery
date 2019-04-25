window.onload = function() :void {
  getProductData(setupProductWindows)
}

const addProductToCart = function (productId :Number) :void {
  const updateCart = new XMLHttpRequest()
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  popup.addEventListener("animationend", function() {
    popup.classList.remove("popping-up")
  })

  updateCart.open("POST", "/api/v1/users/cart")
  updateCart.setRequestHeader("Content-Type", "application/json")
  updateCart.onload = function() {
   popupText.textContent = this.response
   popup.classList.add("popping-up")
  }
  updateCart.send(JSON.stringify({"id": `${productId}`}))
}


const getProductData = function(callback?: (products :Element[]) => void) :void{
  const getProducts = new XMLHttpRequest()
  getProducts.open('GET', '/api/v1/products')
  getProducts.onload = function() {
    const data = JSON.parse(this.response)
    const randomizedData = shuffleArray(data)
    const windows = document.querySelectorAll('.product-window')
    for(let i = 0; i < windows.length; i++) {
      const productData = windows[i].querySelector('.product-data')
      const productId = windows[i].querySelector('.product-id')
      const productImage = <HTMLImageElement> windows[i].querySelector('.product-img')
      productId.textContent = `${randomizedData[i].Id}`
      productImage.src = `../img/${randomizedData[i].Image_name}.jpg`
      productData.textContent = `${randomizedData[i].Name}, \$${(randomizedData[i].Price/100).toFixed(2)}`
    }
    const products :Element[] = Array.from(windows)
    callback(products)
  }
  getProducts.onerror = function(err) {
    console.log(err)
  }
  getProducts.send()
}

const setupProductWindows = function (products :Element[]) :void{
  products.forEach(function(product) :void {
    let addButton = <HTMLElement>product.querySelector('.add-product-button')
    let productData = <HTMLElement>product.querySelector('.product-data')

    product.addEventListener('mouseenter', function(e) :void {
      addButton.style.animation = 'slideUp 500ms forwards'
      productData.style.animation = 'slideDown 500ms forwards'
    })

    product.addEventListener('mouseleave', function(e) :void {
      addButton.style.animation = 'slideDown 500ms forwards'
      productData.style.animation = 'slideUp 500ms forwards'
    })

    product.addEventListener('click', function(e) :void {
      const productId :number = Number(product.querySelector(".product-id").textContent)
      addProductToCart(productId)
    })

  })
}

const shuffleArray = function (arr :any[]) {
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
