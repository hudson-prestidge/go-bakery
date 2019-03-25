window.addEventListener('load', function(e) {
  const products :Element[] = Array.from(document.getElementsByClassName('product-window'))
  products.forEach(function(product) :void {
    let addButton = <HTMLElement>product.querySelector('.add-product-button')

    product.addEventListener('mouseenter', function(e) :void {
      addButton.style.animation = 'slideIn 500ms forwards'
    })

    product.addEventListener('mouseleave', function(e) :void {
      addButton.style.animation = 'slideOut 500ms forwards'
    })
  })
  getProducts()
})

const getProducts = function() :void{
  const getProd = new XMLHttpRequest()
  getProd.open('GET', '/api/v1/products')
  getProd.onload = function() {
    const data = JSON.parse(this.response)
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
