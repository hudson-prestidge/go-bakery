window.onload = function () {
    const getUserData = new XMLHttpRequest();
    getUserData.open("GET", "/api/v1/users");
    getUserData.onload = function () {
        const userData = JSON.parse(this.response)[0];
        const username = userData.Username;
        const userGreeting = document.querySelector('#user-greeting');
        userGreeting.textContent = `Welcome, ${username}!`;
    };
    getUserData.onerror = function (err) {
        console.log(err);
    };
    getUserData.send();
};
//# sourceMappingURL=signup.js.map