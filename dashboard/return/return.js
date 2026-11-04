// LocalStorage Keys
const BOOKS_KEY = "library_books";
const ISSUES_KEY = "library_issues";

// Retrieve dataset arrays
function getBooks() {
    const raw = localStorage.getItem(BOOKS_KEY);
    return raw ? JSON.parse(raw) : [];
}

function getIssues() {
    const raw = localStorage.getItem(ISSUES_KEY);
    return raw ? JSON.parse(raw) : [];
}

// Persist updated datasets
function saveBooks(books) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

function saveIssues(issues) {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
}

// Render Active Pending Return Tables and History Archive
function renderTables(filteredData) {
    const allIssues = filteredData || getIssues();
    const activeTableBody = document.getElementById("returnTableBody");
    const historyTableBody = document.getElementById("historyTableBody");

    activeTableBody.innerHTML = "";
    historyTableBody.innerHTML = "";

    // Counters initialized
    let pendingCount = 0;
    let completedCount = 0;

    allIssues.forEach(item => {
        if (item.status === "Issued") {
            pendingCount++;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>#${item.issueId}</strong></td>
                <td>${item.memberName} <br><small style="color:var(--text-muted)">ID: ${item.memberId}</small></td>
                <td><strong>${item.bookName}</strong> <br><small style="color:var(--text-muted)">Book ID: ${item.bookId}</small></td>
                <td>${item.issueDate}</td>
                <td>${item.returnDate}</td>
                <td><span class="badge-pending">Borrowing Active</span></td>
                <td>
                    <button class="btn-return-action" onclick="openReturnModal('${item.issueId}')">📥 Receive Return</button>
                </td>
            `;
            activeTableBody.appendChild(tr);
        } else if (item.status === "Returned") {
            completedCount++;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>#${item.issueId}</strong></td>
                <td>${item.memberName} <small style="color:var(--text-muted)">(${item.memberId})</small></td>
                <td>${item.bookName}</td>
                <td>${item.issueDate}</td>
                <td>${item.actualReturnDate || item.returnDate}</td>
                <td><span class="badge-returned">✔ Returned</span></td>
            `;
            historyTableBody.appendChild(tr);
        }
    });

    if (pendingCount === 0) {
        activeTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 25px; color: var(--text-muted);">No active borrowings pending return.</td></tr>`;
    }

    if (completedCount === 0) {
        historyTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 25px; color: var(--text-muted);">No return history recorded yet.</td></tr>`;
    }

    // Update Counter Badges
    document.getElementById("pendingReturnsCount").innerText = pendingCount;
    document.getElementById("completedReturnsCount").innerText = completedCount;
    document.getElementById("historyCounter").innerText = `${completedCount} Returned`;
}

// ---------------- RETURN CONFIRMATION MODAL ----------------
function openReturnModal(issueId) {
    const issues = getIssues();
    const issue = issues.find(i => i.issueId === issueId);
    if (!issue) return;

    document.getElementById("modalIssueId").value = issue.issueId;
    document.getElementById("modalIssueText").innerText = "#" + issue.issueId;
    document.getElementById("modalMemberText").innerText = `${issue.memberName} (#${issue.memberId})`;
    document.getElementById("modalBookText").innerText = `${issue.bookName} (#${issue.bookId})`;
    document.getElementById("modalIssueDateText").innerText = issue.issueDate;
    document.getElementById("modalDueDateText").innerText = issue.returnDate;

    // Set today's date as default acceptance date
    document.getElementById("modalReturnDate").value = new Date().toISOString().split("T")[0];

    document.getElementById("returnModal").classList.add("active");
}

// Process Return, increment book quantity, and mark issue record closed
function processReturnConfirmation(event) {
    event.preventDefault();

    const issueId = document.getElementById("modalIssueId").value;
    const actualReturnDate = document.getElementById("modalReturnDate").value;

    let issues = getIssues();
    const issueIndex = issues.findIndex(i => i.issueId === issueId);

    if (issueIndex === -1) {
        showAlert("Transaction record not found.", "error");
        return;
    }

    const targetIssue = issues[issueIndex];
    let books = getBooks();
    const bookIndex = books.findIndex(b => b.id === targetIssue.bookId);

    // 1. Referential Update: Restore quantity (+1) in library_books
    if (bookIndex !== -1) {
        books[bookIndex].qty = Number(books[bookIndex].qty) + 1;
        saveBooks(books);
    }

    // 2. Close/Update issue record in library_issues
    issues[issueIndex].status = "Returned";
    issues[issueIndex].actualReturnDate = actualReturnDate;
    saveIssues(issues);

    closeModal("returnModal");
    renderTables();
    showAlert(`Successfully returned "${targetIssue.bookName}" from ${targetIssue.memberName}. Book inventory restored!`, "success");
}

// Display Alerts
function showAlert(message, type) {
    const alertBox = document.getElementById("alertMessage");
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;

    setTimeout(() => {
        alertBox.className = "alert-box";
        alertBox.textContent = "";
    }, 6000);
}

// Close Modal
function closeModal(id) {
    document.getElementById(id).classList.remove("active");
}

// Filter Pending Return Records
function searchReturnRecords() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const issues = getIssues();

    const filtered = issues.filter(i =>
        i.issueId.toLowerCase().includes(query) ||
        i.memberName.toLowerCase().includes(query) ||
        i.bookName.toLowerCase().includes(query) ||
        i.memberId.toLowerCase().includes(query) ||
        i.bookId.toLowerCase().includes(query)
    );

    renderTables(filtered);
}

// Logout Confirmation
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "../index.html";
    }
}

// Initialize on Load
window.onload = function() {
    renderTables();
};