window.onload = function() :void {
  getProductData(setupProductWindows)
  getUserData()
}

const addProductToCart = function (productId :Number) :void {
  const updateCart = new XMLHttpRequest()
  updateCart.open("PUT", "/api/v1/users/cart")
  updateCart.setRequestHeader("Content-Type", "application/json")
  updateCart.onload = function() {
    console.log(`attempting to add to cart: {"id": "${productId}"}`)
  }
  updateCart.send(JSON.stringify({"id": `${productId}`}))
}

const getUserData = function() :void{
  const getUsers = new XMLHttpRequest()
  getUsers.open("GET", "/api/v1/users")
  getUsers.onload = function() {
    const userData = JSON.parse(this.response)[0]
    const username = userData.Username;
    const userGreeting = document.querySelector('#user-greeting')
    userGreeting.textContent = `Welcome, ${username}!`
  }
  getUsers.onerror = function(err) {
    console.log(err)
  }
  getUsers.send()
}

const getProductData = function(callback?: (products :Element[]) => void) :void{
  const getProducts = new XMLHttpRequest()
  getProducts.open('GET', '/api/v1/products')
  getProducts.onload = function() {
    const data = JSON.parse(this.response)
    const windows = document.querySelectorAll('.product-data')
    for(let i = 0; i < windows.length; i++) {
      windows[i].textContent = `${data[i].Id}: ${data[i].Name}, \$${(data[i].Price/100).toFixed(2)}`
    }
    const products :Element[] = Array.from(document.getElementsByClassName('product-window'))
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

    product.addEventListener('mouseenter', function(e) :void {
      addButton.style.animation = 'slideIn 500ms forwards'
    })

    product.addEventListener('mouseleave', function(e) :void {
      addButton.style.animation = 'slideOut 500ms forwards'
    })

    product.addEventListener('click', function(e) :void {
      const productInfo :Element = product.querySelector(".product-data")
      const productId :Number = parseInt(productInfo.textContent.match(/(\d)+:/)[1])
      addProductToCart(productId)
    })

  })
}
