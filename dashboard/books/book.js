// Default SVG cover placeholder if no URL is provided or if loading fails
const DEFAULT_COVER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='140' viewBox='0 0 100 140'><rect width='100' height='140' fill='%23b37d3e'/><text x='50%' y='50%' fill='%23ffffff' font-size='11' font-family='sans-serif' text-anchor='middle' dominant-baseline='middle'>No Cover</text></svg>";



// Retrieve books array from LocalStorage
function getBooks() {
    let stored = localStorage.getItem("library_books");
    if (!stored) {
        localStorage.setItem("library_books", JSON.stringify(initialBooks));
        return initialBooks;
    }
    return JSON.parse(stored);
}

// Persist updated books array to LocalStorage
function saveBooks(books) {
    localStorage.setItem("library_books", JSON.stringify(books));
}

// Render data rows in the table
function renderTable(customData) {
    const books = customData || getBooks();
    const tbody = document.getElementById("bookTableBody");
    tbody.innerHTML = "";

    // Show empty state if list contains no items
    if (books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 25px; color: var(--text-muted);">No books available in the library.</td></tr>`;
        updateCounters();
        return;
    }

    books.forEach(book => {
        const coverImg = book.image ? book.image : DEFAULT_COVER;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <img src="${coverImg}" alt="${book.name}" class="book-thumb" onerror="this.src='${DEFAULT_COVER}'">
            </td>
            <td><strong>#${book.id}</strong></td>
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td><span class="category-tag">${book.category}</span></td>
            <td>${book.qty}</td>
            <td>
                <button class="btn-action btn-view" onclick="openView('${book.id}')">👁 View</button>
                <button class="btn-action btn-edit" onclick="openEdit('${book.id}')">✏ Edit</button>
                <button class="btn-action btn-delete" onclick="deleteBook('${book.id}')">🗑 Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    updateCounters();
}

// Recalculate summary metrics
function updateCounters() {
    const allBooks = getBooks();
    document.getElementById("totalTitles").innerText = allBooks.length;
    const totalQty = allBooks.reduce((sum, item) => sum + Number(item.qty), 0);
    document.getElementById("totalCopies").innerText = totalQty;
}

// ---------------- LIVE URL PREVIEW HANDLERS ----------------
// Displays thumbnail while typing or pasting link in Add Modal
function previewAddImageUrl() {
    const url = document.getElementById("addImageUrl").value.trim();
    const previewContainer = document.getElementById("addImgPreviewContainer");
    const previewImg = document.getElementById("addImgPreview");

    if (url) {
        previewImg.src = url;
        previewContainer.classList.add("active");
    } else {
        previewImg.src = "";
        previewContainer.classList.remove("active");
    }
}

// Displays thumbnail while typing or pasting link in Edit Modal
function previewEditImageUrl() {
    const url = document.getElementById("editImageUrl").value.trim();
    const previewImg = document.getElementById("editImgPreview");
    previewImg.src = url || DEFAULT_COVER;
}

// ---------------- 1. CREATE (ADD NEW BOOK) ----------------
function openAddModal() {
    document.getElementById("addForm").reset();
    document.getElementById("addImgPreview").src = "";
    document.getElementById("addImgPreviewContainer").classList.remove("active");
    document.getElementById("addModal").classList.add("active");
}

function addNewBook(event) {
    event.preventDefault();

    const id = document.getElementById("addId").value.trim().toUpperCase();
    const name = document.getElementById("addName").value.trim();
    const author = document.getElementById("addAuthor").value.trim();
    const category = document.getElementById("addCategory").value.trim();
    const qty = parseInt(document.getElementById("addQty").value, 10);
    
    // Fall back to default placeholder if no URL was provided
    const imageUrl = document.getElementById("addImageUrl").value.trim();
    const image = imageUrl !== "" ? imageUrl : DEFAULT_COVER;

    let books = getBooks();

    // Check duplicate ID
    if (books.some(b => b.id.toUpperCase() === id)) {
        alert("Book ID '" + id + "' already exists! Please enter a unique ID.");
        return;
    }

    books.push({ id, name, author, category, qty, image });
    saveBooks(books);

    closeModal("addModal");
    renderTable();
    alert("Book added successfully with Cover Image!");
}

// ---------------- 2. READ (VIEW BOOK DETAILS) ----------------
function openView(id) {
    const books = getBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;

    const viewImg = document.getElementById("viewImage");
    viewImg.src = book.image || DEFAULT_COVER;
    viewImg.onerror = function() { this.src = DEFAULT_COVER; };

    document.getElementById("viewId").innerText = book.id;
    document.getElementById("viewName").innerText = book.name;
    document.getElementById("viewAuthor").innerText = book.author;
    document.getElementById("viewCategory").innerText = book.category;
    document.getElementById("viewQty").innerText = book.qty + " copies available";

    document.getElementById("viewModal").classList.add("active");
}

// ---------------- 3. UPDATE (EDIT BOOK DETAILS) ----------------
function openEdit(id) {
    const books = getBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;

    document.getElementById("editId").value = book.id;
    document.getElementById("editName").value = book.name;
    document.getElementById("editAuthor").value = book.author;
    document.getElementById("editCategory").value = book.category;
    document.getElementById("editQty").value = book.qty;

    // Populate URL input if custom cover exists
    const currentImg = (book.image && book.image !== DEFAULT_COVER) ? book.image : "";
    document.getElementById("editImageUrl").value = currentImg;

    const previewImg = document.getElementById("editImgPreview");
    previewImg.src = book.image || DEFAULT_COVER;
    previewImg.onerror = function() { this.src = DEFAULT_COVER; };
    document.getElementById("editImgPreviewContainer").classList.add("active");

    document.getElementById("editModal").classList.add("active");
}

function saveBookChanges(event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;
    const name = document.getElementById("editName").value.trim();
    const author = document.getElementById("editAuthor").value.trim();
    const category = document.getElementById("editCategory").value.trim();
    const qty = parseInt(document.getElementById("editQty").value, 10);
    
    // Read updated URL or use fallback placeholder
    const imageUrl = document.getElementById("editImageUrl").value.trim();
    const image = imageUrl !== "" ? imageUrl : DEFAULT_COVER;

    let books = getBooks();
    let index = books.findIndex(b => b.id === id);

    if (index !== -1) {
        books[index] = { id, name, author, category, qty, image };
        saveBooks(books);

        closeModal("editModal");
        renderTable();
        alert("Book details updated successfully!");
    }
}

// ---------------- 4. DELETE (REMOVE BOOK) ----------------
function deleteBook(id) {
    const confirmDelete = confirm("Are you sure you want to delete book #" + id + "?");
    if (!confirmDelete) return;

    let books = getBooks();
    books = books.filter(b => b.id !== id);
    saveBooks(books);

    renderTable();
    alert("Book #" + id + " has been deleted!");
}

// ---------------- 5. SEARCH FILTER ----------------
function searchBooks() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const books = getBooks();

    const filtered = books.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query)
    );

    renderTable(filtered);
}

// ---------------- UTILITY / NAVIGATION HELPERS ----------------
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "../index.html";
    }
}

// Initialize on page load
window.onload = function() {
    renderTable();
};