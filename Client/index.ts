window.onload = function() :void {
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

  const getUserData = new XMLHttpRequest()
  getUserData.open("GET", "/api/v1/users")
  getUserData.onload = function() {
    const userData = JSON.parse(this.response)[0]
    const username = userData.Username;
    const userGreeting = document.querySelector('#user-greeting')
    userGreeting.textContent = `Welcome, ${username}!`
  }
  getUserData.onerror = function(err) {
    console.log(err)
  }
  getUserData.send()
}
