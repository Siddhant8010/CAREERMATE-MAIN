(function () {
  const signinImg = "https://i.pinimg.com/736x/90/30/b2/9030b2c9a9068af4d6f76ef2e304bc83.jpg";
  const registerImg = "https://i.pinimg.com/1200x/16/b0/80/16b080bb8978c6e6860a5c3450046253.jpg";
  const heroImage = document.getElementById("heroImage");

  // Toast notification function
  function showToast(type, title, message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    const icon = type === "success" ? "✓" : "✕";
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">×</button>
    `;
    
    container.appendChild(toast);
    
    // Close button handler
    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.classList.add("removing");
      setTimeout(() => toast.remove(), 300);
    });
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add("removing");
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const lead = document.getElementById("lead");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Check if admin login
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminLogin = urlParams.get('admin') === 'true';
  
  if (isAdminLogin) {
    const adminIndicator = document.getElementById("admin-indicator");
    const authTabs = document.getElementById("auth-tabs");
    
    if (adminIndicator) {
      adminIndicator.style.display = "block";
    }
    
    // Hide Login/Sign Up tabs completely for admin
    if (authTabs) {
      authTabs.style.display = "none";
    }
    
    // Update lead text for admin
    if (lead) {
      lead.textContent = "Access the admin dashboard to manage users, questions, and test results.";
      lead.style.textAlign = "center";
    }
  }

  // Restore remembered username
  const savedUser = localStorage.getItem("growhub_username");
  const loginUsername = document.getElementById("login-username");
  const remember = document.getElementById("remember");
  if (savedUser) loginUsername.value = savedUser;

  function setActive(isLogin) {

    tabLogin.setAttribute("aria-selected", String(isLogin));
    tabRegister.setAttribute("aria-selected", String(!isLogin));
    tabLogin.setAttribute("aria-pressed", String(isLogin));
    tabRegister.setAttribute("aria-pressed", String(!isLogin));

    if (isLogin) {
      heroImage.src = signinImg;
      heroImage.alt = "Child learning numbers in classroom";
      lead.textContent = "Log in to continue your Career Finding journey with CareerMate — your personal online Path Finder.";
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    } else {
      heroImage.src = registerImg;
      heroImage.alt = "Child raising hand in classroom";
      lead.textContent = "Sign Up to continue your Career Finding journey with CareerMate — your personal online Path Finder.";
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    }
  }

  tabLogin.addEventListener("click", () => setActive(true));
  tabRegister.addEventListener("click", () => setActive(false));

  // Password visibility toggle
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-password");
    if (!btn) return;
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;
    const isNowText = input.type === "password";
    input.type = isNowText ? "text" : "password";
    btn.setAttribute("aria-pressed", String(isNowText));
  });

  // ✅ LOGIN FORM HANDLER
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = document.getElementById("login-username");
    const pass = document.getElementById("login-password");
    const uErr = document.getElementById("login-username-error");
    const pErr = document.getElementById("login-password-error");

    let ok = true;
    if (!user.value.trim()) {
      uErr.classList.remove("hidden");
      ok = false;
    } else {
      uErr.classList.add("hidden");
    }

    if (!pass.value.trim()) {
      pErr.classList.remove("hidden");
      ok = false;
    } else {
      pErr.classList.add("hidden");
    }

    if (!ok) return;

    // ✅ Remember username if checked
    if (remember.checked) {
      localStorage.setItem("growhub_username", user.value.trim());
    } else {
      localStorage.removeItem("growhub_username");
    }

    // ✅ Call backend for login
    try {
      // Check if admin login
      const urlParams = new URLSearchParams(window.location.search);
      const isAdminLogin = urlParams.get('admin') === 'true';
      const loginEndpoint = isAdminLogin ? "/admin/login" : "/login";
      
      const res = await fetch(`http://localhost:3000${loginEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: user.value.trim(),
          password: pass.value.trim(),
        }),
      });

      const data = await res.json();
      console.log("📩 Login response:", data);

      if (data.success) {
        showToast("success", "Login Successful!", "Redirecting to your dashboard...");
        setTimeout(() => {
          window.location.href = isAdminLogin ? "/admindash" : "/dashboard";
        }, 1500);
      } else {
        showToast("error", "Login Failed", data.message || "Invalid username or password.");
      }
    } catch (err) {
      console.error("❌ Login request failed:", err);
      showToast("error", "Connection Error", "Could not connect to server. Please try again.");
    }
  });



  // ✅ SIGNUP FORM HANDLER
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("reg-email");
    const user = document.getElementById("reg-username");
    const pass = document.getElementById("reg-password");
    const eErr = document.getElementById("reg-email-error");
    const uErr = document.getElementById("reg-username-error");
    const pErr = document.getElementById("reg-password-error");

    let ok = true;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailValid) { eErr.classList.remove("hidden"); ok = false; } else { eErr.classList.add("hidden"); }
    if (!user.value.trim()) { uErr.classList.remove("hidden"); ok = false; } else { uErr.classList.add("hidden"); }
    if (pass.value.length < 6) { pErr.classList.remove("hidden"); ok = false; } else { pErr.classList.add("hidden"); }

    if (!ok) return;

    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          username: user.value.trim(),
          password: pass.value.trim(),
        }),
      });

      const data = await res.json();
      console.log("📩 Server response:", data);

      if (data.success) {
        showToast("success", "Signup Successful!", "Redirecting to complete your profile...");
        registerForm.reset();
        setTimeout(() => {
          window.location.href = "/registeration";
        }, 1500);
      } else {
        showToast("error", "Signup Failed", data.message || "Email already exists.");
      }
    } catch (err) {
      console.error("❌ Request failed:", err);
      showToast("error", "Connection Error", "Could not connect to server. Please try again.");
    }
  });

  // Set initial tab
  document.addEventListener("DOMContentLoaded", function () {
    const initialTab = document.body.getAttribute("data-initial-tab") || "login";
    if (initialTab === "register") {
      setActive(false);
    } else {
      setActive(true);
    }
  });
})();
