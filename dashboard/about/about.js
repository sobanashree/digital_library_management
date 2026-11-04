/**
 * About page script
 * Location: dashboard/about/about.js
 * about.html is two levels below the root, so index.html is at ../../index.html
 */

function logout(event) {
    if (event) event.preventDefault();

    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("lms_active_session");
        sessionStorage.clear();
        window.location.replace("../../index.html");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});
