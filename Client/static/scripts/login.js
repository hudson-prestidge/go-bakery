window.onload = function () {
    const popup = document.querySelector("#notification-popup");
    const popupText = document.querySelector(".notification-text");
    if (getUrlParameter('attempt') === 'failed') {
        popupText.textContent = "Invalid username or password";
        popup.classList.add("popping-up");
    }
};
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
;
//# sourceMappingURL=login.js.map