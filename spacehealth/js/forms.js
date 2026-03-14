// Form handling and validation with Django backend integration

// API base URL
const API_BASE = "http://127.0.0.1:8000/api";

// Form validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validatePasswordMatch(password, confirmPassword) {
  return password === confirmPassword;
}

// Show error message
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const existingError = field.parentNode.querySelector(".error-message");

  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);

  field.style.borderColor = "#ff6b6b";
}

// Clear error message
function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const existingError = field.parentNode.querySelector(".error-message");

  if (existingError) {
    existingError.remove();
  }

  field.style.borderColor = "rgba(255, 255, 255, 0.1)";
}

// Show loading state
function showLoading(button) {
  const buttonText = button.querySelector(".button-text");
  const spinner = button.querySelector(".loading-spinner");

  buttonText.style.display = "none";
  spinner.style.display = "block";
  button.disabled = true;
}

// Hide loading state
function hideLoading(button) {
  const buttonText = button.querySelector(".button-text");
  const spinner = button.querySelector(".loading-spinner");

  buttonText.style.display = "block";
  spinner.style.display = "none";
  button.disabled = false;
}

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector(".submit-btn");
  const formData = new FormData(form);

  // Clear previous errors
  ["role", "email", "password"].forEach(clearError);

  // Validate form
  let isValid = true;

  if (!formData.get("role")) {
    showError("role", "Please select a role");
    isValid = false;
  }

  if (!formData.get("email")) {
    showError("email", "Email is required");
    isValid = false;
  } else if (!validateEmail(formData.get("email"))) {
    showError("email", "Please enter a valid email");
    isValid = false;
  }

  if (!formData.get("password")) {
    showError("password", "Password is required");
    isValid = false;
  }

  if (!isValid) return;

  // Show loading
  showLoading(submitBtn);

  try {
    const response = await fetch(`${API_BASE}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: formData.get("role"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const data = await response.json();
    hideLoading(submitBtn);

    if (!response.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // Save user info in localStorage
    localStorage.setItem("currentUser", JSON.stringify(data));

    alert("Login successful!");

    // Redirect based on role
    if (data.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "astronaut-dashboard.html";
    }
  } catch (error) {
    hideLoading(submitBtn);
    alert("Error connecting to backend.");
  }
}

// Handle register form submission
async function handleRegister(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector(".submit-btn");
  const formData = new FormData(form);

  // Clear errors
  ["role", "fullName", "email", "password", "confirmPassword"].forEach(clearError);

  // Validate form
  let isValid = true;

  if (!formData.get("role")) {
    showError("role", "Please select a role");
    isValid = false;
  }

  if (!formData.get("fullName")) {
    showError("fullName", "Full name is required");
    isValid = false;
  }

  if (!formData.get("email")) {
    showError("email", "Email is required");
    isValid = false;
  } else if (!validateEmail(formData.get("email"))) {
    showError("email", "Please enter a valid email");
    isValid = false;
  }

  if (!formData.get("password")) {
    showError("password", "Password is required");
    isValid = false;
  } else if (!validatePassword(formData.get("password"))) {
    showError("password", "Password must be at least 6 characters");
    isValid = false;
  }

  if (!formData.get("confirmPassword")) {
    showError("confirmPassword", "Please confirm your password");
    isValid = false;
  } else if (!validatePasswordMatch(formData.get("password"), formData.get("confirmPassword"))) {
    showError("confirmPassword", "Passwords do not match");
    isValid = false;
  }

  if (!isValid) return;

  // Show loading
  showLoading(submitBtn);

  try {
    const response = await fetch(`${API_BASE}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: formData.get("role"),
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const data = await response.json();
    hideLoading(submitBtn);

    if (!response.ok) {
      alert(data.error || "Registration failed");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(data));

    alert("Registration successful!");

    if (data.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "astronaut-dashboard.html";
    }
  } catch (error) {
    hideLoading(submitBtn);
    alert("Error connecting to backend.");
  }
}

// Initialize form handling
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});
