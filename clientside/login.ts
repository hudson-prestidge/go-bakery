window.onload = function() :void {
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  popup.addEventListener("animationend", function() {
    popup.classList.remove("popping-up")
  })
  const loginButton = document.querySelector("#form-submit-btn")
  loginButton.addEventListener('click', authenticateUser)
}

const authenticateUser = function() :void {
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  const usernameField = <HTMLInputElement> document.querySelector("#form-username-field")
  const username = usernameField.value
  const passwordField = <HTMLInputElement> document.querySelector("#form-password-field")
  const password = passwordField.value
  const loginRequest = new XMLHttpRequest
  loginRequest.open("POST", "/api/v1/users/login")
  loginRequest.onload = function() :void {
    if(loginRequest.status == 200) {
      window.location.replace("/")
    }

    if(loginRequest.status == 403) {
      popupText.textContent = this.response
      popup.classList.add("popping-up")
    }
  }
  loginRequest.onerror = function (err) :void {
    console.log(err)
  }
  loginRequest.send(JSON.stringify({"username": `${username}`, "password": `${password}`}))
}
