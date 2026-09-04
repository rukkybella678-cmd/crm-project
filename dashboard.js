// ========================================
// DASHBOARD
// ========================================

// Check login
if (localStorage.getItem("crmLoggedIn") !== "true") {
    window.location.href = "login.html";
}


// ========================================
// API
// ========================================

const API_URL = "http://localhost:3000/api";


// ========================================
// ELEMENTS
// ========================================

const totalCustomers =
    document.getElementById("totalCustomers");

const newCustomers =
    document.getElementById("newCustomers");

const totalInteractions =
    document.getElementById("totalInteractions");

const pendingTasks =
    document.getElementById("pendingTasks");

const userName =
    document.getElementById("userName");

const logoutButton =
    document.getElementById("logoutButton");


// ========================================
// AUTH HEADERS
// ========================================

function getAuthHeaders() {

    const token =
        localStorage.getItem("crmToken");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}


// ========================================
// LOAD USER
// ========================================

function loadUser() {

    const savedUser =
        localStorage.getItem("currentUser");

    if (!savedUser) {
        return;
    }

    try {

        const user =
            JSON.parse(savedUser);

        if (userName && user.fullName) {

            userName.textContent =
                user.fullName;

        }

    } catch (error) {

        console.error(
            "Could not load user:",
            error
        );

    }

}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    try {

        const response =
            await fetch(
                `${API_URL}/customers`,
                {
                    headers: getAuthHeaders()
                }
            );

        if (!response.ok) {
            throw new Error(
                "Could not load customers"
            );
        }

        const customers =
            await response.json();


        // Total customers

        if (totalCustomers) {

            totalCustomers.textContent =
                customers.length;

        }


        // New customers

        // Customers created in the last 30 days

        const now =
            new Date();

        const thirtyDaysAgo =
            new Date();

        thirtyDaysAgo.setDate(
            now.getDate() - 30
        );


        const recentCustomers =
            customers.filter(function(customer) {

                const createdDate =
                    new Date(
                        customer.createdAt ||
                        customer.created_at ||
                        customer.date
                    );

                return (
                    !isNaN(createdDate) &&
                    createdDate >= thirtyDaysAgo
                );

            });


        if (newCustomers) {

            newCustomers.textContent =
                recentCustomers.length;

        }

    } catch (error) {

        console.error(
            "CUSTOMER DASHBOARD ERROR:",
            error
        );

        if (totalCustomers) {
            totalCustomers.textContent = "0";
        }

        if (newCustomers) {
            newCustomers.textContent = "0";
        }

    }

}


// ========================================
// LOAD CONTACTS
// ========================================

async function loadContacts() {

    try {

        const response =
            await fetch(
                `${API_URL}/contacts`,
                {
                    headers: getAuthHeaders()
                }
            );

        if (!response.ok) {
            throw new Error(
                "Could not load contacts"
            );
        }

        const contacts =
            await response.json();


        if (totalInteractions) {

            totalInteractions.textContent =
                contacts.length;

        }

    } catch (error) {

        console.error(
            "CONTACT DASHBOARD ERROR:",
            error
        );

        if (totalInteractions) {

            totalInteractions.textContent =
                "0";

        }

    }

}


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    try {

        const response =
            await fetch(
                `${API_URL}/tasks`,
                {
                    headers: getAuthHeaders()
                }
            );

        if (!response.ok) {
            throw new Error(
                "Could not load tasks"
            );
        }

        const tasks =
            await response.json();


        const pending =
            tasks.filter(function(task) {

                return (
                    task.status !== "Completed"
                );

            });


        if (pendingTasks) {

            pendingTasks.textContent =
                pending.length;

        }

    } catch (error) {

        console.error(
            "TASK DASHBOARD ERROR:",
            error
        );

        if (pendingTasks) {

            pendingTasks.textContent =
                "0";

        }

    }

}


// ========================================
// LOGOUT
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            const token =
                localStorage.getItem("crmToken");


            try {

                if (token) {

                    await fetch(
                        `${API_URL}/logout`,
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );

                }

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }


            localStorage.removeItem(
                "crmLoggedIn"
            );

            localStorage.removeItem(
                "crmToken"
            );

            localStorage.removeItem(
                "currentUser"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ========================================
// START DASHBOARD
// ========================================

async function startDashboard() {

    loadUser();

    await Promise.all([
        loadCustomers(),
        loadContacts(),
        loadTasks()
    ]);

}


startDashboard();