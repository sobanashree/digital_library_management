
const BOOKS_KEY = "library_books";
const MEMBERS_KEY = "library_members";
const ISSUES_KEY = "library_issues";

function readData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        return [];
    }
}

function generateReports() {

    const books = readData(BOOKS_KEY);
    const members = readData(MEMBERS_KEY);
    const issues = readData(ISSUES_KEY);

    let totalCopies = 0;
    let availableCopies = 0;
    let issuedCopies = 0;

    // Calculate book copies
    for (let i = 0; i < books.length; i++) {
        let qty = Number(books[i].qty) || 0;

        availableCopies += qty;
    }

    // Calculate active issued books
    for (let i = 0; i < issues.length; i++) {
        if (issues[i].status === "Issued") {
            issuedCopies++;
        }
    }

    totalCopies = availableCopies + issuedCopies;

    // Update metrics
    document.getElementById("metricTotalBooks").innerText = books.length;

    document.getElementById("metricTotalCopies").innerText =
        totalCopies + " Total physical copies";

    document.getElementById("metricTotalMembers").innerText =
        members.length;

    document.getElementById("metricAvailableCopies").innerText =
        availableCopies;

    document.getElementById("metricIssuedCopies").innerText =
        issuedCopies;

    buildCategoryBreakdownTable(books);
    buildActiveBorrowingsTable(issues, members);
}


// Category report
function buildCategoryBreakdownTable(books) {

    const tbody = document.getElementById("categoryTableBody");

    tbody.innerHTML = "";

    const categoryMap = {};

    for (let i = 0; i < books.length; i++) {

        let category = books[i].category || "General";
        let qty = Number(books[i].qty) || 0;

        if (!categoryMap[category]) {
            categoryMap[category] = {
                titleCount: 0,
                totalQty: 0
            };
        }

        categoryMap[category].titleCount++;
        categoryMap[category].totalQty += qty;
    }

    for (let category in categoryMap) {

        let data = categoryMap[category];

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${category}</td>
            <td>${data.titleCount} Titles</td>
            <td>${data.totalQty} Copies</td>
            <td>${data.totalQty > 0 ? "Available" : "Out of Stock"}</td>
        `;

        tbody.appendChild(row);
    }

    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">No books available</td>
            </tr>
        `;
    }
}


// Active borrowing report
function buildActiveBorrowingsTable(issues, members) {

    const tbody = document.getElementById("activeLoansTableBody");

    tbody.innerHTML = "";

    let count = 0;

    for (let i = 0; i < issues.length; i++) {

        let item = issues[i];

        if (item.status === "Issued") {

            count++;

            let member = members.find(m =>
                String(m.id) === String(item.memberId)
            );

            let department = member ?
                (member.dept || member.department || "N/A") : "N/A";

            let row = document.createElement("tr");

            row.innerHTML = `
                <td>#${item.issueId || "N/A"}</td>
                <td>${item.memberName || "N/A"}</td>
                <td>${department}</td>
                <td>${item.bookName || "N/A"}</td>
                <td>${item.issueDate || "N/A"}</td>
                <td>${item.returnDate || "N/A"}</td>
            `;

            tbody.appendChild(row);
        }
    }

    document.getElementById("activeLogTag").innerText =
        count + " Active Loans";

    if (count === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">No active loans currently</td>
            </tr>
        `;
    }
}


// Logout
function logout() {

    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "../index.html";
    }
}


// Load report
window.onload = generateReports;


// Update report when another tab changes LocalStorage
window.addEventListener("storage", function(event) {
    generateReports();
});
