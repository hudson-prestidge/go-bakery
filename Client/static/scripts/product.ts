window.addEventListener('load', function(e) {
  console.log('loaded page')
  getProducts()
})

const getProducts = function() {
  const getProd = new XMLHttpRequest()
  getProd.open('GET', '/api/v1/products')
  getProd.onload = function() {
    const data = JSON.parse(this.response)
    console.log(data)
    const windows = document.querySelectorAll('.product-data')
    for(let i = 0; i < data.length; i++) {
      windows[i].textContent = `${data[i].Id}: ${data[i].Name}`
    }
  }
  getProd.onerror = function(err) {
    console.log(err)
  }
  getProd.send()
}
