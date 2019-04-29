window.onload = function() {
  getTransactionData(displayTransactionData)
}

interface Transaction {
  Id: number,
  Product_list: number[]
  Order_time: Date
}

interface Product {
  Id: number,
  Name: string,
  Price: number
}

const getTransactionData = function (callback?: (products :Product[], transactionData :Transaction[]) => void) :void {
  const getTransactions = new XMLHttpRequest()
  getTransactions.open("GET", "/api/v1/transactions")
  getTransactions.onload = function () {
    const transactionData = JSON.parse(this.response)
    if (transactionData == null) {
      const popup = document.querySelector("#notification-popup")
      const popupText = document.querySelector(".notification-text")
      popupText.textContent = "No transaction data to display - try buying something!"
      popup.classList.add("popping-up")
      return
    }
    const getProducts = new XMLHttpRequest()
    getProducts.open("GET", "/api/v1/products")
    getProducts.onload = function () {
      let products = JSON.parse(this.response)
      callback(products, transactionData)
    }
    getProducts.send()
  }
  getTransactions.send()
}

const displayTransactionData = function (products :Product[], transactionData :Transaction[]) :void {
  const itemQuantities:{[Id:number] : number}[] = []
  for(let i = 0; i < transactionData.length; i++) {
    itemQuantities[i] = {}
    for (let j = 0; j < transactionData[i].Product_list.length; j++) {
      let currentValue = transactionData[i].Product_list[j]
      if(typeof itemQuantities[i][currentValue] == 'number') {
        itemQuantities[i][currentValue]++
      } else {
        itemQuantities[i][currentValue] = 1;
      }
    }
  }
  const orderList = document.querySelector("#order-list")
  for(let i = 0; i < itemQuantities.length; i++) {
    let subtotalPrice :number = 0
    let orderRow = document.createElement("tr")
    orderRow.classList.add("order-row")

    let orderNumber = document.createElement("td")
    orderNumber.textContent = transactionData[i].Id.toString()
    orderRow.appendChild(orderNumber)
    for (let key in itemQuantities[i]) {
      let product = products.filter( (p) => p.Id == Number(key) )[0]
      let productName = document.createElement("td")
      productName.textContent = product.Name
      let productQuantity = document.createElement("td")
      productQuantity.textContent = itemQuantities[i][key].toString()

      let productPrice = document.createElement("td")
      productPrice.textContent = `$${(product.Price/100 * itemQuantities[i][key]).toFixed(2)}`

      subtotalPrice += product.Price/100 * itemQuantities[i][key]
      orderRow.appendChild(productName)
      orderRow.appendChild(productQuantity)
      orderRow.appendChild(productPrice)
      orderList.appendChild(orderRow)
      orderRow = document.createElement("tr")
      orderRow.classList.add("order-row")
      let placeholder = document.createElement("td")
      orderRow.appendChild(placeholder)
    }
    let placeholder = document.createElement("td")
    placeholder.textContent = "Total:"
    orderRow.appendChild(placeholder)
    placeholder = document.createElement("td")
    orderRow.appendChild(placeholder)
    placeholder = document.createElement("td")
    orderRow.appendChild(placeholder)

    let subtotalPriceNode = document.createElement("td")
    subtotalPriceNode.textContent = `$${subtotalPrice.toFixed(2)}`
    orderRow.appendChild(subtotalPriceNode)

    let orderTime = document.createElement("td")
    var date = new Date(transactionData[i].Order_time)
    orderTime.textContent = `${date.toDateString()} ${date.toLocaleTimeString()}`
    orderRow.appendChild(orderTime)
    orderRow.classList.add("final-row")
    orderList.appendChild(orderRow)
  }
}
