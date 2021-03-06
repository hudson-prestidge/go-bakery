const getUserData = function() :void{
  const getUsers = new XMLHttpRequest()
  getUsers.open("GET", "/api/v1/users")
  getUsers.onload = function() :void {
    const userData = JSON.parse(this.response)[0]
    if(!userData) {
      return
    }
    const username = userData.Username;
    const userDisplay = document.querySelector('#user-display')
    userDisplay.classList.remove('hidden')
    const userGreeting = document.querySelector('#user-greeting')
    userGreeting.textContent = `Welcome, ${username}!`

    const loginLogoutLink = document.querySelector("#login-logout-link")
    loginLogoutLink.setAttribute("href", "/logout")
    loginLogoutLink.textContent = "Logout"

    const signupLink = <HTMLElement> document.querySelector("#signup-link")
    signupLink.setAttribute("href", "/orderhistory.html")
    signupLink.textContent = "Orders"
  }
  getUsers.onerror = function(err) :void {
    console.log(err)
  }
  getUsers.send()
}

getUserData()
