// Global state
let currentPage = "dashboard"
let sidebarOpen = false

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  showPage("dashboard")
  updateActiveNavItem("dashboard")
  loadAvailableTests()
})

// Navigation functions
function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page")
  pages.forEach((page) => page.classList.remove("active"))

  // Show selected page
  const targetPage = document.getElementById(pageId + "-page")
  if (targetPage) {
    targetPage.classList.add("active")
    currentPage = pageId
    updateActiveNavItem(pageId)
  }

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
}

function updateActiveNavItem(pageId) {
  // Remove active class from all nav items
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => item.classList.remove("active"))

  // Add active class to current nav item
  const activeItem = document.querySelector(`[data-page="${pageId}"]`)
  if (activeItem) {
    activeItem.classList.add("active")
  }
}

// Profile dropdown functions
function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown")
  dropdown.classList.toggle("show")

  // Close dropdown when clicking outside
  document.addEventListener("click", function closeDropdown(e) {
    if (!e.target.closest(".profile-dropdown")) {
      dropdown.classList.remove("show")
      document.removeEventListener("click", closeDropdown)
    }
  })
}

// Mobile sidebar functions
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.classList.toggle("show")
  sidebarOpen = !sidebarOpen
}

function closeSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.classList.remove("show")
  sidebarOpen = false
}

// Interactive functions
function takeTest() {
  window.location.href = '/test-rules';
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear session and redirect to main page
    fetch('/logout', { method: 'POST' })
      .then(() => {
        window.location.href = '/';
      })
      .catch(() => {
        // Fallback: just redirect to main page
        window.location.href = '/';
      });
  }
}

// Progress animation
function animateProgress() {
  const progressBars = document.querySelectorAll(".progress-fill")
  progressBars.forEach((bar) => {
    // Get width from data attribute or existing style
    const width = bar.dataset.width ? `${bar.dataset.width}%` : bar.style.width
    bar.style.width = "0%"
    setTimeout(() => {
      bar.style.width = width
    }, 500)
  })
}

// Initialize animations when page loads
window.addEventListener("load", () => {
  setTimeout(animateProgress, 1000)
})

// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeSidebar()
  }
})

// Smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href")
    // Only handle if href is not just "#" and has content after the hash
    if (href && href.length > 1 && href !== "#") {
      e.preventDefault()
      try {
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      } catch (error) {
        console.warn('Invalid selector:', href)
      }
    }
  })
})

// Fetch and update dashboard stats
async function refreshDashboardStats() {
  try {
    const response = await fetch('/api/dashboard/stats');
    if (response.ok) {
      const stats = await response.json();
      console.log('📊 Dashboard stats updated:', stats);
      
      // Update UI elements if they exist
      const testsCompletedEl = document.querySelector('.stat-number');
      if (testsCompletedEl && stats.testsCompleted !== undefined) {
        testsCompletedEl.textContent = stats.testsCompleted;
      }
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  }
}

// Auto-refresh stats every 30 seconds if on dashboard page
setInterval(() => {
  if (currentPage === 'dashboard') {
    refreshDashboardStats();
  }
}, 30000);

// Load available tests from backend
async function loadAvailableTests() {
  try {
    const response = await fetch('/api/tests');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.tests) {
        console.log(`✅ Loaded ${data.tests.length} tests`);
        displayAvailableTests(data.tests);
      }
    }
  } catch (error) {
    console.error('Failed to load tests:', error);
  }
}

// Display available tests in the dashboard
function displayAvailableTests(tests) {
  const testsContainer = document.getElementById('available-tests-container');
  if (!testsContainer) return;
  
  testsContainer.innerHTML = '';
  
  tests.forEach(test => {
    const testCard = document.createElement('div');
    testCard.className = 'test-card';
    
    testCard.innerHTML = `
      <h4>${test.name}</h4>
      <p>${test.description}</p>
      <button class="btn btn-primary" onclick="startTest('${test._id}')">Start Test</button>
    `;
    testsContainer.appendChild(testCard);
  });
}

// Start a specific test
function startTest(testId) {
  // Redirect to test page with test ID
  window.location.href = `/test?testId=${testId}`;
}
// Theme toggle
function toggleTheme() {
  const body = document.body
  const themeIcon = document.getElementById("theme-icon")

  body.classList.toggle("dark-mode")

  if (body.classList.contains("dark-mode")) {
    themeIcon.classList.remove("fa-moon")
    themeIcon.classList.add("fa-sun")
    localStorage.setItem("theme", "dark")
  } else {
    themeIcon.classList.remove("fa-sun")
    themeIcon.classList.add("fa-moon")
    localStorage.setItem("theme", "light")
  }
}

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme")
  const body = document.body
  const themeIcon = document.getElementById("theme-icon")

  if (savedTheme === "dark") {
    body.classList.add("dark-mode")
    themeIcon.classList.remove("fa-moon")
    themeIcon.classList.add("fa-sun")
  }
})

