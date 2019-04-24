window.onload = function () {
  const getUserData = new XMLHttpRequest()
  getUserData.open("GET", "/api/v1/users")
  getUserData.onload = function() {
    const userData = JSON.parse(this.response)
    if(Array.isArray(userData)){
      const username = userData[0].Username;
      const userGreeting = document.querySelector('#user-greeting')
      userGreeting.textContent = `Welcome, ${username}!`
      const userDisplay = document.querySelector('#user-display')
      userDisplay.classList.remove('hidden')

      const loginLogoutLink = document.querySelector("#login-logout-link")
      loginLogoutLink.setAttribute("href", "/logout")
      loginLogoutLink.textContent = "Logout"
    }
  }
  getUserData.onerror = function(err) {
    console.log(err)
  }
  getUserData.send()
}
