// ========================================
// PASSWORD SHOW / HIDE
// ========================================

function setupPasswordToggle(buttonId, inputId) {

    const button = document.getElementById(buttonId);
    const input = document.getElementById(inputId);

    if (!button || !input) {
        return;
    }

    button.addEventListener("click", function () {

        if (input.type === "password") {
            input.type = "text";
            button.textContent = "Hide";
        } else {
            input.type = "password";
            button.textContent = "Show";
        }

    });
}


// Login password
setupPasswordToggle("togglePassword", "password");

// Register password
setupPasswordToggle("toggleRegisterPassword", "registerPassword");

// Confirm password
setupPasswordToggle("toggleConfirmPassword", "confirmPassword");


// ========================================
// REGISTER USER
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const fullName =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (!fullName || !email || !password) {

            alert("Please complete all required fields.");

            return;
        }


        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;
        }


        if (password.length < 6) {

            alert("Password must be at least 6 characters.");

            return;
        }


        try {

            const response = await fetch(
                "http://localhost:3000/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        fullName: fullName,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Registration failed."
                );

                return;
            }


            alert("Account created successfully!");

            window.location.href = "login.html";


        } catch (error) {

            console.error("Registration error:", error);

            alert(
                "Could not connect to the CRM backend. " +
                "Make sure node server.js is running."
            );

        }

    });

}


// ========================================
// LOGIN USER
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        if (!email || !password) {

            alert("Please enter your email and password.");

            return;
        }


        try {

            const response = await fetch(
                "http://localhost:3000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Login failed."
                );

                return;
            }


            // ========================================
            // SAVE BACKEND TOKEN
            // ========================================

            localStorage.setItem(
                "crmToken",
                data.token
            );


            // Login status
            localStorage.setItem(
                "crmLoggedIn",
                "true"
            );


            // Save user information
            localStorage.setItem(
                "currentUser",
                JSON.stringify(data.user)
            );


            alert("Login successful!");


            // Go to dashboard
            window.location.href = "dashboard.html";


        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Could not connect to the CRM backend. " +
                "Make sure node server.js is running."
            );

        }

    });

}