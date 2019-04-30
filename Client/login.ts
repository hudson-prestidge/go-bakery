window.onload = function() {
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  popup.addEventListener("animationend", function() {
    popup.classList.remove("popping-up")
  })
  const loginButton = document.querySelector("#form-login-btn")
  loginButton.addEventListener('click', authenticateUser)

  if(getUrlParameter('attempt') === 'failed') {
    popupText.textContent = "Invalid username or password"
    popup.classList.add("popping-up")
  }
}

const authenticateUser = function() {
  const popup = document.querySelector("#notification-popup")
  const popupText = document.querySelector(".notification-text")
  const usernameField = <HTMLInputElement> document.querySelector("#form-username-field")
  const username = usernameField.value
  const passwordField = <HTMLInputElement> document.querySelector("#form-password-field")
  const password = passwordField.value
  const loginRequest = new XMLHttpRequest
  loginRequest.open("POST", "/api/v1/users/login")
  loginRequest.onload = function() {
    if(loginRequest.status == 200) {
      window.location.replace("/")
    }

    if(loginRequest.status == 403) {
      popupText.textContent = this.response
      popup.classList.add("popping-up")
    }
  }
  loginRequest.onerror = function (err) {
    console.log(err)
  }
  loginRequest.send(JSON.stringify({"username": `${username}`, "password": `${password}`}))
}

function getUrlParameter(name :string) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
