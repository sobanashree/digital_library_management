/**
 * Digital Library Management System - Dashboard Script
 * Location: dashboard/dashboard.js
 *
 * Folder structure:
 *   index.html                      (login page, root)
 *   dashboard/dashboard.html
 *   dashboard/books/book.html
 *   dashboard/members/member.html
 *   dashboard/issue/issue.html
 *   dashboard/return/return.html
 *   dashboard/reports/report.html
 *   dashboard/about/about.html
 */

// Page Navigation (used by Quick Action buttons)
function showMessage(page) {
    if (!page) return;

    switch (page.trim().toLowerCase()) {
        case "dashboard":
            window.location.href = "dashboard.html";
            break;
        case "books":
            window.location.href = "books/book.html";
            break;
        case "members":
            window.location.href = "members/member.html";
            break;
        case "issue book":
            window.location.href = "issue/issue.html";
            break;
        case "return book":
            window.location.href = "return/return.html";
            break;
        case "reports":
            window.location.href = "reports/report.html";
            break;
        case "about":
            window.location.href = "about/about.html";
            break;
        default:
            alert(page + " page will be added soon.");
    }
}

// Logout Function (dashboard.html is inside /dashboard, so index.html is one level up)
function logout(event) {
    if (event) event.preventDefault();

    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("lms_active_session");
        sessionStorage.clear();
        window.location.replace("../index.html");
    }
}

// Attach events after the page loads
document.addEventListener("DOMContentLoaded", function () {
    // Logout link
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    // Quick Action buttons
    document.querySelectorAll("button[data-page]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            showMessage(btn.dataset.page);
        });
    });
});
