const getUserData = function () {
    const getUsers = new XMLHttpRequest();
    getUsers.open("GET", "/api/v1/users");
    getUsers.onload = function () {
        const userData = JSON.parse(this.response)[0];
        if (!userData) {
            return;
        }
        const username = userData.Username;
        const userDisplay = document.querySelector('#user-display');
        userDisplay.classList.remove('hidden');
        const userGreeting = document.querySelector('#user-greeting');
        userGreeting.textContent = `Welcome, ${username}!`;
        const loginLogoutLink = document.querySelector("#login-logout-link");
        loginLogoutLink.setAttribute("href", "/logout");
        loginLogoutLink.textContent = "Logout";
        const signupLink = document.querySelector("#signup-link");
        signupLink.style.display = "none";
    };
    getUsers.onerror = function (err) {
        console.log(err);
    };
    getUsers.send();
};
getUserData();
//# sourceMappingURL=user.js.map