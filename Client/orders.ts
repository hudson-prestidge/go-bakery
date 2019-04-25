window.onload = function() {
  getTransactionData(displayTransactionData)
}

interface Transaction {
  Id: number,
  Product_list: number[]
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
    console.log(orderRow)
    let subtotalPriceNode = document.createElement("td")
    let placeholder = document.createElement("td")
    orderRow.appendChild(placeholder)
    placeholder = document.createElement("td")
    orderRow.appendChild(placeholder)
    subtotalPriceNode.textContent = `$${subtotalPrice.toFixed(2)}`
    orderRow.appendChild(subtotalPriceNode)
    orderList.appendChild(orderRow)
  }
}
