window.onload = function () {
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  popup.addEventListener("animationend", function() {
    popup.classList.remove("popping-up")
  })
  var signupButton = document.querySelector("#signup-submit-btn")
  signupButton.addEventListener("click", signupUser)
}

const signupUser = function() {
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  const usernameField = <HTMLInputElement> document.querySelector("#signup-username-field")
  const username = usernameField.value
  const passwordField = <HTMLInputElement> document.querySelector("#signup-password-field")
  const password = passwordField.value
  const passwordRepeatField = <HTMLInputElement> document.querySelector("#signup-password-repeat-field")
  const passwordRepeat = passwordRepeatField.value

  if (username.length > 20 || username.length == 0 || !checkAlphanumeric(username)) {
    popupText.textContent = "Usernames must be 1-20 characters long and only contain letters and numbers."
    popup.classList.add("popping-up")
    return
  }

  if (password.length < 4 || !checkAlphanumeric(password)) {
    popupText.textContent = "Password must be at least four characters long and only contain letters and numbers."
    popup.classList.add("popping-up")
    return
  }

  if (password != passwordRepeat) {
    popupText.textContent = "Passwords do not match."
    popup.classList.add("popping-up")
    return
  }

  if (password == username) {
    popupText.textContent = "Username and password cannot be the same."
    popup.classList.add("popping-up")
    return
  }

  const signupRequest = new XMLHttpRequest
  signupRequest.open("POST", "/api/v1/users")
  signupRequest.onload = function() {
    if(signupRequest.status == 200) {
      const loginRequest = new XMLHttpRequest
      loginRequest.open("POST", "/api/v1/users/login")
      loginRequest.onload = function() {
        if(loginRequest.status == 200) {
          window.location.replace("/")
        }
      }
      loginRequest.onerror = function (err) {
        console.log(err)
      }
      loginRequest.send(JSON.stringify({"username": `${username}`, "password": `${password}`}))
    }

    if(signupRequest.status == 409) {
      popupText.textContent = this.response
      popup.classList.add("popping-up")
    }
  }
  signupRequest.onerror = function (err) {
    console.log(err)
  }
  signupRequest.send(JSON.stringify({"username": `${username}`, "password": `${password}`}))
}

const checkAlphanumeric = function(s :string) {
  const alphaNumRegex = /^[a-zA-Z0-9]*$/
  return alphaNumRegex.test(s)
}
