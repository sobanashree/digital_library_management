// Storage keys used for cross-referencing datasets
const BOOKS_KEY = "library_books";
const MEMBERS_KEY = "library_members";
const ISSUES_KEY = "library_issues";

// Default seeds for standalone resilience
const fallbackBooks = [
    { id: "B101", name: "Clean Code", author: "Robert C. Martin", category: "Programming", qty: 5 },
    { id: "B102", name: "The Alchemist", author: "Paulo Coelho", category: "Fiction", qty: 2 },
    { id: "B103", name: "Atomic Habits", author: "James Clear", category: "Self Help", qty: 0 } // Sold out test case
];

const fallbackMembers = [
    { id: "M101", name: "Ananya Sharma", dept: "Computer Science", email: "ananya@example.com", mobile: "9876543210" },
    { id: "M102", name: "Karthik Raja", dept: "Mechanical", email: "karthik@example.com", mobile: "9812345678" }
];

// Read books array
function getBooks() {
    const raw = localStorage.getItem(BOOKS_KEY);
    if (!raw) {
        localStorage.setItem(BOOKS_KEY, JSON.stringify(fallbackBooks));
        return fallbackBooks;
    }
    return JSON.parse(raw);
}

// Read members array
function getMembers() {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) {
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(fallbackMembers));
        return fallbackMembers;
    }
    return JSON.parse(raw);
}

// Read issues transactions array
function getIssues() {
    const raw = localStorage.getItem(ISSUES_KEY);
    return raw ? JSON.parse(raw) : [];
}

// Populate Member Dropdown from LocalStorage
function populateMemberDropdown() {
    const members = getMembers();
    const select = document.getElementById("memberSelect");
    select.innerHTML = '<option value="">-- Choose Member --</option>';

    members.forEach(member => {
        const option = document.createElement("option");
        option.value = member.id;
        option.textContent = `${member.name} (${member.id} - ${member.dept})`;
        select.appendChild(option);
    });
}


// Populate Book Dropdown with live quantity indicators
function populateBookDropdown() {
    const books = getBooks();
    const select = document.getElementById("bookSelect");
    select.innerHTML = '<option value="">-- Choose Book --</option>';

    books.forEach(book => {
        const option = document.createElement("option");
        option.value = book.id;
        const qty = Number(book.qty);
        option.textContent = `${book.name} [ID: ${book.id}] - (${qty > 0 ? qty + ' available' : 'Out of stock'})`;
        
        // Disable option directly if completely out of stock
        if (qty <= 0) {
            option.disabled = true;
        }
        select.appendChild(option);
    });
}

// Initialize default date inputs (Issue date: Today, Return date: +14 days)
function initializeDefaultDates() {
    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 14);

    const todayStr = today.toISOString().split("T")[0];
    const returnStr = returnDate.toISOString().split("T")[0];

    const issueInput = document.getElementById("issueDate");
    const returnInput = document.getElementById("returnDate");

    issueInput.value = todayStr;
    issueInput.min = todayStr;

    returnInput.value = returnStr;
    returnInput.min = todayStr;
}

// Check stock and toggle button state when a book is picked
function checkSelectedBookAvailability() {
    const bookId = document.getElementById("bookSelect").value;
    const statusText = document.getElementById("stockStatusText");
    const submitBtn = document.getElementById("btnSubmitIssue");

    if (!bookId) {
        statusText.textContent = "";
        statusText.className = "stock-status";
        submitBtn.disabled = false;
        return;
    }

    const books = getBooks();
    const book = books.find(b => b.id === bookId);

    if (!book || Number(book.qty) <= 0) {
        statusText.textContent = "❌ Selected book is currently out of stock!";
        statusText.className = "stock-status out-of-stock";
        submitBtn.disabled = true;
    } else {
        statusText.textContent = `✔ In Stock (${book.qty} copies remaining)`;
        statusText.className = "stock-status in-stock";
        submitBtn.disabled = false;
    }
}

// Process and record issue transaction
function handleIssueBook(event) {
    event.preventDefault();

    const memberId = document.getElementById("memberSelect").value;
    const bookId = document.getElementById("bookSelect").value;
    const issueDate = document.getElementById("issueDate").value;
    const returnDate = document.getElementById("returnDate").value;

    // 1. Cross-reference existence checks
    const members = getMembers();
    const member = members.find(m => m.id === memberId);

    const books = getBooks();
    const bookIndex = books.findIndex(b => b.id === bookId);

    if (!member) {
        showAlert("Invalid or non-existent member selected.", "error");
        return;
    }

    if (bookIndex === -1) {
        showAlert("Invalid or non-existent book selected.", "error");
        return;
    }

    // 2. Quantity & availability check
    const targetBook = books[bookIndex];
    if (Number(targetBook.qty) <= 0) {
        showAlert(`"${targetBook.name}" is unavailable (0 copies in stock).`, "error");
        return;
    }

    // 3. Date sanity check
    if (new Date(returnDate) < new Date(issueDate)) {
        showAlert("Return Due Date cannot precede the Issue Date.", "error");
        return;
    }

    // 4. Perform Referentially Coupled Updates
    // A: Decrement available stock count in library_books
    books[bookIndex].qty = Number(targetBook.qty) - 1;
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));

    // B: Append transaction record to library_issues
    const issues = getIssues();
    const newIssueRecord = {
        issueId: "ISS-" + Date.now().toString().slice(-6),
        memberId: member.id,
        memberName: member.name,
        bookId: targetBook.id,
        bookName: targetBook.name,
        issueDate: issueDate,
        returnDate: returnDate,
        status: "Issued" // "Issued" or "Returned"
    };

    issues.unshift(newIssueRecord);
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));

    // 5. Update UI Views
    showAlert(`Success! "${targetBook.name}" issued to ${member.name}. Remaining copies: ${books[bookIndex].qty}.`, "success");
    resetFormState();
    populateBookDropdown();
    renderIssueTable();
}

// Display Banner Alert
function showAlert(message, type) {
    const alertBox = document.getElementById("alertMessage");
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;

    setTimeout(() => {
        alertBox.className = "alert-box";
        alertBox.textContent = "";
    }, 6000);
}

// Reset form inputs and refresh dropdown indicators
function resetFormState() {
    document.getElementById("issueForm").reset();
    initializeDefaultDates();
    checkSelectedBookAvailability();
}

// Render Issued Books Records Table
function renderIssueTable(customData) {
    const issues = customData || getIssues();
    const tbody = document.getElementById("issueTableBody");
    tbody.innerHTML = "";

    if (issues.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 25px; color: var(--text-muted);">No issue records found.</td></tr>`;
        updateCounters();
        return;
    }

    issues.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${item.issueId}</strong></td>
            <td>${item.memberName} <br><small style="color:var(--text-muted)">ID: ${item.memberId}</small></td>
            <td><strong>${item.bookName}</strong> <br><small style="color:var(--text-muted)">Book ID: ${item.bookId}</small></td>
            <td>${item.issueDate}</td>
            <td>${item.returnDate}</td>
            <td><span class="status-badge ${item.status === 'Issued' ? 'status-issued' : 'status-returned'}">${item.status}</span></td>
        `;
        tbody.appendChild(tr);
    });

    updateCounters();
}

// Metric Badges Count
function updateCounters() {
    const allIssues = getIssues();
    const active = allIssues.filter(i => i.status === "Issued").length;

    document.getElementById("totalActiveIssues").innerText = active;
    document.getElementById("totalIssueRecords").innerText = allIssues.length;
}

// Real-time table filter
function searchIssueRecords() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const issues = getIssues();

    const filtered = issues.filter(i => 
        i.issueId.toLowerCase().includes(query) ||
        i.memberName.toLowerCase().includes(query) ||
        i.bookName.toLowerCase().includes(query) ||
        i.memberId.toLowerCase().includes(query) ||
        i.bookId.toLowerCase().includes(query)
    );

    renderIssueTable(filtered);
}

// Logout Confirmation
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "../index.html";
    }
}

// Page Initialization
window.onload = function() {
    populateMemberDropdown();
    populateBookDropdown();
    initializeDefaultDates();
    renderIssueTable();
};