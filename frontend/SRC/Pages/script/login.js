
        // Form submission handler
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            
            // Hide previous messages
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
            
            // Simple validation
            if (!email || !password) {
                errorMessage.textContent = 'Please fill in all fields.';
                errorMessage.style.display = 'block';
                return;
            }
            
            // Demo login (you can replace this with actual authentication)
            if (email === 'demo@example.com' && password === 'password') {
                successMessage.style.display = 'block';
                setTimeout(() => {
                    alert('Login successful! (This is a demo)');
                }, 1500);
            } else {
                errorMessage.style.display = 'block';
            }
        });

        // Forgot password handler
        document.getElementById('forgotPassword').addEventListener('click', function(e) {
            e.preventDefault();
            alert('Forgot password feature would redirect to password reset page.');
        });

        // Sign up button handler
        document.getElementById('signupBtn').addEventListener('click', function(e) {
            e.preventDefault();
            alert('Sign up feature would redirect to registration page.');
        });

        // Add floating label effect
        document.querySelectorAll('.form-group input').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.querySelector('label').style.color = '#4a90e2';
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.querySelector('label').style.color = '#adb5bd';
                }
            });
        });
    