window.onload = function () {
    var signupButton = document.querySelector("#signup-submit-btn");
    signupButton.addEventListener("click", signupUser);
};
const signupUser = function () {
    const popup = document.querySelector("#notification-popup");
    const popupText = document.querySelector(".notification-text");
    const usernameField = document.querySelector("#signup-username-field");
    const username = usernameField.value;
    const passwordField = document.querySelector("#signup-password-field");
    const password = passwordField.value;
    const signupRequest = new XMLHttpRequest;
    signupRequest.open("POST", "/api/v1/users");
    signupRequest.onload = function () {
        console.log("test");
        if (signupRequest.status == 200) {
            const loginRequest = new XMLHttpRequest;
            loginRequest.open("POST", "/api/v1/users/login");
            loginRequest.onload = function () {
                if (loginRequest.status == 200) {
                    window.location.replace("/");
                }
            };
            loginRequest.onerror = function (err) {
                console.log(err);
            };
            loginRequest.send(JSON.stringify({ "username": `${username}`, "password": `${password}` }));
        }
        if (signupRequest.status == 403) {
            popupText.textContent = this.response;
            popup.classList.add("popping-up");
        }
    };
    signupRequest.onerror = function (err) {
        console.log(err);
    };
    signupRequest.send(JSON.stringify({ "username": `${username}`, "password": `${password}` }));
};
//# sourceMappingURL=signup.js.map