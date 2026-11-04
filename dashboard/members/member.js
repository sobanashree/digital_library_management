// Initial sample members seed data
const initialMembers = [
    { id: "M101", name: "Ananya Sharma", dept: "Computer Science", email: "ananya@example.com", mobile: "9876543210" },
    { id: "M102", name: "Karthik Raja", dept: "Mechanical", email: "karthik@example.com", mobile: "9812345678" },
    { id: "M103", name: "Priya Venkatesh", dept: "Electronics", email: "priya@example.com", mobile: "9745612340" },
    { id: "M104", name: "Siddharth Verma", dept: "Information Tech", email: "siddharth@example.com", mobile: "9654123890" }
];

// Fetch members from LocalStorage
function getMembers() {
    let stored = localStorage.getItem("library_members");
    if (!stored) {
        localStorage.setItem("library_members", JSON.stringify(initialMembers));
        return initialMembers;
    }
    return JSON.parse(stored);
}

// Save updated array to LocalStorage
function saveMembers(members) {
    localStorage.setItem("library_members", JSON.stringify(members));
}

// Render the member table
function renderTable(customData) {
    const members = customData || getMembers();
    const tbody = document.getElementById("memberTableBody");
    tbody.innerHTML = "";

    if (members.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 25px; color: var(--text-muted);">No members registered yet.</td></tr>`;
        updateCounter();
        return;
    }

    members.forEach(member => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${member.id}</strong></td>
            <td>${member.name}</td>
            <td><span class="dept-badge">${member.dept}</span></td>
            <td>${member.email}</td>
            <td>${member.mobile}</td>
            <td>
                <button class="btn-action btn-view" onclick="openView('${member.id}')">👁 View</button>
                <button class="btn-action btn-edit" onclick="openEdit('${member.id}')">✏ Edit</button>
                <button class="btn-action btn-delete" onclick="deleteMember('${member.id}')">🗑 Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    updateCounter();
}

// Update total members count
function updateCounter() {
    const allMembers = getMembers();
    document.getElementById("totalMembers").innerText = allMembers.length;
}

// Validation helpers
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidMobile(mobile) {
    const re = /^[0-9]{10}$/;
    return re.test(mobile);
}

// ---------------- 1. ADD MEMBER ----------------
function openAddModal() {
    document.getElementById("addForm").reset();
    document.getElementById("addModal").classList.add("active");
}

function addMember(event) {
    event.preventDefault();

    const id = document.getElementById("addId").value.trim().toUpperCase();
    const name = document.getElementById("addName").value.trim();
    const dept = document.getElementById("addDept").value.trim();
    const email = document.getElementById("addEmail").value.trim();
    const mobile = document.getElementById("addMobile").value.trim();

    // Field Validations
    if (!isValidEmail(email)) {
        alert("Please enter a valid email address (e.g. name@domain.com).");
        return;
    }

    if (!isValidMobile(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    let members = getMembers();

    // Check duplicate Member ID
    if (members.some(m => m.id.toUpperCase() === id)) {
        alert("Member ID '" + id + "' already exists! Please use a unique ID.");
        return;
    }

    members.push({ id, name, dept, email, mobile });
    saveMembers(members);

    closeModal("addModal");
    renderTable();
    alert("Member registered successfully!");
}

// ---------------- 2. VIEW DETAILS ----------------
function openView(id) {
    const members = getMembers();
    const member = members.find(m => m.id === id);
    if (!member) return;

    document.getElementById("viewId").innerText = member.id;
    document.getElementById("viewName").innerText = member.name;
    document.getElementById("viewDept").innerText = member.dept;
    document.getElementById("viewEmail").innerText = member.email;
    document.getElementById("viewMobile").innerText = member.mobile;

    document.getElementById("viewModal").classList.add("active");
}

// ---------------- 3. EDIT MEMBER ----------------
function openEdit(id) {
    const members = getMembers();
    const member = members.find(m => m.id === id);
    if (!member) return;

    document.getElementById("editId").value = member.id;
    document.getElementById("editName").value = member.name;
    document.getElementById("editDept").value = member.dept;
    document.getElementById("editEmail").value = member.email;
    document.getElementById("editMobile").value = member.mobile;

    document.getElementById("editModal").classList.add("active");
}

function saveMemberChanges(event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;
    const name = document.getElementById("editName").value.trim();
    const dept = document.getElementById("editDept").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const mobile = document.getElementById("editMobile").value.trim();

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!isValidMobile(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    let members = getMembers();
    let index = members.findIndex(m => m.id === id);

    if (index !== -1) {
        members[index] = { id, name, dept, email, mobile };
        saveMembers(members);

        closeModal("editModal");
        renderTable();
        alert("Member details updated successfully!");
    }
}

// ---------------- 4. DELETE MEMBER ----------------
function deleteMember(id) {
    const confirmDelete = confirm("Are you sure you want to delete member #" + id + "?");
    if (!confirmDelete) return;

    let members = getMembers();
    members = members.filter(m => m.id !== id);
    saveMembers(members);

    renderTable();
    alert("Member #" + id + " has been deleted successfully!");
}

// ---------------- 5. SEARCH FILTER ----------------
function searchMembers() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const members = getMembers();

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query) ||
        m.dept.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.mobile.includes(query)
    );

    renderTable(filtered);
}

// Modal and Navigation Helpers
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "../index.html";
    }
}

// Initialize on Load
window.onload = function() {
    renderTable();
};