window.onload = function() :void {
  retrieveCartProducts(setupCartList)
  getUserData()
  const popup = document.querySelector("#notification-popup")
  popup.addEventListener("animationend", function() {
    popup.classList.remove("popping-up")
  })
}

interface Product {
  Id: number,
  Name: string,
  Price: number
}


const retrieveCartProducts = function (callback?: (products:Product[], itemQuantities:{[Id:number] : number}) => void) :void {
  const getCart = new XMLHttpRequest
  getCart.open("GET", "/api/v1/users/cart")
  getCart.onload = function() :void {
    let cartData
    try{
      cartData = JSON.parse(this.response)
    }
    catch (e) {
      const checkoutButton = document.querySelector("#checkoutbtn")
      checkoutButton.addEventListener('click', noItemsPopup)
      return
    }
      const items :number[] = cartData.Items
      const products :Product[] = cartData.Products
      const itemQuantities:{[Id:number] : number} = {}
      products.forEach(function(p :Product){
        itemQuantities[p.Id] = 0
      })
      items.forEach(function(n :number) {
        itemQuantities[n] += 1
      })
      callback(products, itemQuantities)

  }
  getCart.onerror = function(err) :void {
    console.log(err)
  }
  getCart.send()
}

const checkout = function () :void {
  const checkoutCart = new XMLHttpRequest
  checkoutCart.open("POST", "/api/v1/transactions")
  checkoutCart.onload = function() :void {
    window.location.replace("/?transaction=complete")
  }
  checkoutCart.send()
}


const setupCartList = function(products:Product[], itemQuantities:{[Id:number] : number}) :void {
  const cartList = document.querySelector("#cart-list")
  const checkoutButton = document.querySelector("#checkoutbtn")
  checkoutButton.addEventListener('click', checkout)
  let subtotalPrice :number = 0;
  products.forEach(function(p:Product) :void {
    let productRow = document.createElement("tr")
    productRow.classList.add("product-row")

    let productName = document.createElement("td")
    productName.textContent = p.Name

    let productQuantity = document.createElement("input")
    productQuantity.classList.add('product-quantity')
    let productQuantityCell = document.createElement("td")
    productQuantity.value = `${itemQuantities[p.Id]}`
    productQuantityCell.appendChild(productQuantity)

    let updateQuantityButton = document.createElement("button")
    updateQuantityButton.textContent = "Update"
    let updateQuantityCell = document.createElement("td")
    updateQuantityCell.appendChild(updateQuantityButton)

    updateQuantityButton.addEventListener('click', function() :void {
      if (!isNumber(productQuantity.value)) {
        const popup = document.querySelector("#notification-popup")
        const popupText = document.querySelector(".notification-text")
        popupText.textContent = "Invalid number of items."
        popup.classList.add("popping-up")
        return
      }
      itemQuantities[p.Id] = Number(productQuantity.value)
      updateCart(itemQuantities)
    })

    let productPrice = document.createElement("td")
    productPrice.textContent = `$${(p.Price/100 * itemQuantities[p.Id]).toFixed(2)}`

    subtotalPrice += (p.Price/100 * itemQuantities[p.Id])

    let removeFromCartButton = document.createElement("button")
    removeFromCartButton.textContent = "Remove From Cart"
    let buttonCell = document.createElement("td")

    removeFromCartButton.addEventListener('click', function(e :Event) :void{
      itemQuantities[p.Id] = 0
      updateCart(itemQuantities)
    })


    buttonCell.appendChild(removeFromCartButton)

    productRow.appendChild(productName)
    productRow.appendChild(productQuantity)
    productRow.appendChild(updateQuantityCell)
    productRow.appendChild(productPrice)
    productRow.appendChild(buttonCell)
    cartList.appendChild(productRow)
  })
  let totalRow = document.createElement("tr")
  totalRow.classList.add("total-row")

  let namePlaceholder = document.createElement("td")
  namePlaceholder.textContent = "Total:"
  totalRow.appendChild(namePlaceholder)

  let quantityPlaceholder = document.createElement("td")
  totalRow.appendChild(quantityPlaceholder)

  quantityPlaceholder = document.createElement("td")
  totalRow.appendChild(quantityPlaceholder)

  let totalPrice = document.createElement("td")
  totalPrice.textContent = `$${subtotalPrice.toFixed(2)}`
  totalRow.appendChild(totalPrice)

  cartList.appendChild(totalRow)
}

const noItemsPopup = function () :void {
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  popupText.textContent = "Add a product to your cart to check out!"
  popup.classList.add("popping-up")
}

const updateCart = function (itemQuantities :{[key:number] : number}) :void {
  let newCart :number[] = []
  for(let key in itemQuantities) {
    while (itemQuantities.hasOwnProperty(key) && itemQuantities[key] > 0) {
      newCart.push(parseInt(key, 10))
      itemQuantities[key] --
    }
  }
  const updateCartRequest = new XMLHttpRequest
  updateCartRequest.open("PUT", "/api/v1/users/cart")
  updateCartRequest.setRequestHeader("Content-Type", "application/json")
  updateCartRequest.onload = function () {
    location.reload()
  }
  updateCartRequest.send(JSON.stringify({"list": `${newCart}`}))
}

const isNumber = function (s :string) {
    const numRegex = /^[0-9]*$/
    return numRegex.test(s)
}
