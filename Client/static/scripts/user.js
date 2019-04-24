const getUserData = function () {
    const getUsers = new XMLHttpRequest();
    getUsers.open("GET", "/api/v1/users");
    getUsers.onload = function () {
        if (this.response != 'null') {
            const userData = JSON.parse(this.response)[0];
            const username = userData.Username;
            const userDisplay = document.querySelector('#user-display');
            userDisplay.classList.remove('hidden');
            const userGreeting = document.querySelector('#user-greeting');
            userGreeting.textContent = `Welcome, ${username}!`;
            const loginLogoutLink = document.querySelector("#login-logout-link");
            loginLogoutLink.setAttribute("href", "/logout");
            loginLogoutLink.textContent = "Logout";
        }
    };
    getUsers.onerror = function (err) {
        console.log(err);
    };
    getUsers.send();
};
getUserData();
//# sourceMappingURL=user.js.map