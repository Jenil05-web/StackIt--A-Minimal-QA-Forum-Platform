// Password strength checker
const passwordInput = document.getElementById("password");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

function checkPasswordStrength(password) {
  let strength = 0;
  let feedback = "";

  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/)) strength++;
  if (password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^A-Za-z0-9]/)) strength++;

  const strengthLabels = [
    { text: "Very Weak", color: "#ff6b6b" },
    { text: "Weak", color: "#feca57" },
    { text: "Fair", color: "#48cae4" },
    { text: "Good", color: "#4ecdc4" },
    { text: "Strong", color: "#4ecdc4" },
  ];

  if (password.length === 0) {
    feedback = "Enter a password";
    strength = 0;
  } else {
    feedback = strengthLabels[Math.min(strength - 1, 4)].text;
  }

  strengthFill.style.width = strength * 20 + "%";
  strengthText.textContent = feedback;

  if (strength > 0) {
    strengthFill.style.background =
      strengthLabels[Math.min(strength - 1, 4)].color;
  }
}

passwordInput.addEventListener("input", function () {
  checkPasswordStrength(this.value);
});

// Form validation
const form = document.getElementById("signupForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const terms = document.getElementById("terms").checked;

  // Validation
  if (username.length < 3) {
    alert("Username must be at least 3 characters long");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (!terms) {
    alert("Please accept the Terms of Service");
    return;
  }

  // Simulate form submission
  submitBtn.textContent = "Creating Account...";
  submitBtn.disabled = true;

  setTimeout(() => {
    alert("Account created successfully! Welcome to AskHub!");
    submitBtn.textContent = "Create Account";
    submitBtn.disabled = false;
  }, 2000);
});

// Social login buttons
document.getElementById("googleBtn").addEventListener("click", function () {
  alert("Google signup would be implemented here");
});

document.getElementById("githubBtn").addEventListener("click", function () {
  alert("GitHub signup would be implemented here");
});

document.getElementById("loginLink").addEventListener("click", function (e) {
  e.preventDefault();
  alert("Redirect to login page");
});

// Real-time password confirmation
document
  .getElementById("confirmPassword")
  .addEventListener("input", function () {
    const password = document.getElementById("password").value;
    const confirmPassword = this.value;

    if (confirmPassword && password !== confirmPassword) {
      this.style.borderColor = "#ff6b6b";
    } else if (confirmPassword && password === confirmPassword) {
      this.style.borderColor = "#4ecdc4";
    } else {
      this.style.borderColor = "#e1e8ed";
    }
  });
