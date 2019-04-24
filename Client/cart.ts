window.onload = function() {
  retrieveCartProducts(setupCartList)
  getUserData()
  const checkoutButton = <HTMLElement> document.querySelector('#checkoutbtn')
  checkoutButton.addEventListener('click', checkout)
}

interface Product {
  Id: number,
  Name: string,
  Price: number
}

const retrieveCartProducts = function (callback?: (products:Product[], itemQuantities:{[Id:number] : number}) => void) :void {
  const getCart = new XMLHttpRequest
  getCart.open("GET", "/api/v1/users/cart")
  getCart.onload = function() {
    const cartData = JSON.parse(this.response)
    const items = cartData.Items

    const products = cartData.Products
    const itemQuantities:{[Id:number] : number} = {}
    products.forEach(function(p :Product){
      itemQuantities[p.Id] = 0
    })
    items.forEach(function(n :number) {
      itemQuantities[n] += 1
    })
    callback(products, itemQuantities)
  }
  getCart.onerror = function(err) {
    console.log(err)
  }
  getCart.send()
}

const checkout = function () :void {
  const checkoutCart = new XMLHttpRequest
  checkoutCart.open("POST", "/api/v1/transactions")
  checkoutCart.onload = function() {
    window.location.replace("/")
  }
  checkoutCart.send()
}


const setupCartList = function(products:Product[], itemQuantities:{[Id:number] : number}) {
  const cartList = document.querySelector("#cart-list")
  let subtotalPrice :number = 0;
  products.forEach(function(p:Product) {
    let productRow = document.createElement("tr")
    productRow.classList.add("product-row")

    let productName = document.createElement("td")
    productName.textContent = p.Name

    let productQuantity = document.createElement("td")
    productQuantity.textContent = `${itemQuantities[p.Id]}`

    let productPrice = document.createElement("td")
    productPrice.textContent = `$${(p.Price/100 * itemQuantities[p.Id]).toFixed(2)}`

    subtotalPrice += (p.Price/100 * itemQuantities[p.Id])

    productRow.appendChild(productName)
    productRow.appendChild(productQuantity)
    productRow.appendChild(productPrice)
    cartList.appendChild(productRow)
  })
  let totalRow = document.createElement("tr")
  totalRow.classList.add("total-row")

  let namePlaceholder = document.createElement("td")
  namePlaceholder.textContent = "total:"

  let quantityPlaceholder = document.createElement("td")

  let totalPrice = document.createElement("td")
  totalPrice.textContent = `$${subtotalPrice.toFixed(2)}`

  totalRow.appendChild(namePlaceholder)
  totalRow.appendChild(quantityPlaceholder)
  totalRow.appendChild(totalPrice)
  cartList.appendChild(totalRow)
}
