const USERS_KEY = "lms_registered_users";
const SESSION_KEY = "lms_active_session";

function switchAuthTab(tab) {
  const loginForm = document.getElementById("login-form");
  const regForm = document.getElementById("register-form");
  const tabLoginBtn = document.getElementById("tab-login-btn");
  const tabRegBtn = document.getElementById("tab-register-btn");

  if (tab === "login") {
    loginForm.classList.remove("hidden");
    regForm.classList.add("hidden");
    tabLoginBtn.classList.add("active");
    tabRegBtn.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    regForm.classList.remove("hidden");
    tabLoginBtn.classList.remove("active");
    tabRegBtn.classList.add("active");
  }
}

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = `toast show ${type === "error" ? "toast-error" : type === "success" ? "toast-success" : ""}`;
  setTimeout(() => {
    toast.className = "toast";
  }, 3500);
}

function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("reg-name").value.trim();
  const mobile = document.getElementById("reg-mobile").value.trim();
  const address = document.getElementById("reg-address").value.trim();
  const email = document.getElementById("reg-email").value.trim().toLowerCase();
  const password = document.getElementById("reg-password").value;

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

  const exists = users.some(u => u.email === email);
  if (exists) {
    showToast("This email is already registered. Please sign in!", "error");
    return;
  }

  users.push({ name, mobile, address, email, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  showToast("Registration successful! You can now log in.", "success");
  document.getElementById("register-form").reset();

  switchAuthTab("login");
  document.getElementById("login-email").value = email;
  document.getElementById("login-password").focus();
}

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const user = users.find(u => u.email === email);

  if (!user) {
    showToast("No account found with this email. Please register first.", "error");
    return;
  }

  if (user.password !== password) {
    showToast("Incorrect password. Please try again.", "error");
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email
  }));

  showToast("Login successful! Redirecting...", "success");

  // ஒரே ஃபோல்டரில் உள்ள dashboard.html-க்கு வழிநடத்துகிறது
 setTimeout(() => {
  window.location.href = "dashboard/dashboard.html";
}, 900);
}