// ========================================
// REPORTS PAGE
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
// ELEMENTS
// ========================================

const reportCustomers =
    document.getElementById("reportCustomers");

const reportInteractions =
    document.getElementById("reportInteractions");

const reportTasks =
    document.getElementById("reportTasks");

const reportCompleted =
    document.getElementById("reportCompleted");

const activeCustomers =
    document.getElementById("activeCustomers");

const leadCustomers =
    document.getElementById("leadCustomers");

const inactiveCustomers =
    document.getElementById("inactiveCustomers");

const pendingTasksReport =
    document.getElementById("pendingTasksReport");

const progressTasksReport =
    document.getElementById("progressTasksReport");

const completedTasksReport =
    document.getElementById("completedTasksReport");

const callCount =
    document.getElementById("callCount");

const emailCount =
    document.getElementById("emailCount");

const meetingCount =
    document.getElementById("meetingCount");

const otherCount =
    document.getElementById("otherCount");

const userName =
    document.getElementById("userName");

const userAvatar =
    document.getElementById("userAvatar");

const logoutButton =
    document.getElementById("logoutButton");


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

        if (userAvatar && user.fullName) {

            userAvatar.textContent =
                user.fullName
                    .charAt(0)
                    .toUpperCase();

        }

    } catch (error) {

        console.error(
            "Could not load user information:",
            error
        );

    }

}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomerReport() {

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

        reportCustomers.textContent =
            customers.length;


        // Customer status

        let active = 0;
        let leads = 0;
        let inactive = 0;


        customers.forEach(function(customer) {

            const status =
                String(
                    customer.status || ""
                ).toLowerCase();


            if (
                status === "active" ||
                status === "customer"
            ) {

                active++;

            } else if (
                status === "lead" ||
                status === "leads"
            ) {

                leads++;

            } else if (
                status === "inactive"
            ) {

                inactive++;

            }

        });


        activeCustomers.textContent =
            active;

        leadCustomers.textContent =
            leads;

        inactiveCustomers.textContent =
            inactive;


    } catch (error) {

        console.error(
            "CUSTOMER REPORT ERROR:",
            error
        );

    }

}


// ========================================
// LOAD TASK REPORT
// ========================================

async function loadTaskReport() {

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


        // Total tasks

        reportTasks.textContent =
            tasks.length;


        let pending = 0;
        let progress = 0;
        let completed = 0;


        tasks.forEach(function(task) {

            const status =
                String(
                    task.status || ""
                ).toLowerCase();


            if (status === "completed") {

                completed++;

            } else if (
                status === "in progress" ||
                status === "in-progress"
            ) {

                progress++;

            } else {

                pending++;

            }

        });


        pendingTasksReport.textContent =
            pending;

        progressTasksReport.textContent =
            progress;

        completedTasksReport.textContent =
            completed;

        reportCompleted.textContent =
            completed;


    } catch (error) {

        console.error(
            "TASK REPORT ERROR:",
            error
        );

    }

}


// ========================================
// LOAD INTERACTION REPORT
// ========================================

async function loadInteractionReport() {

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


        // Total interactions

        reportInteractions.textContent =
            contacts.length;


        let calls = 0;
        let emails = 0;
        let meetings = 0;
        let other = 0;


        contacts.forEach(function(contact) {

            const type =
                String(
                    contact.type || ""
                ).toLowerCase();


            if (
                type === "call" ||
                type === "phone"
            ) {

                calls++;

            } else if (
                type === "email"
            ) {

                emails++;

            } else if (
                type === "meeting"
            ) {

                meetings++;

            } else {

                other++;

            }

        });


        callCount.textContent =
            calls;

        emailCount.textContent =
            emails;

        meetingCount.textContent =
            meetings;

        otherCount.textContent =
            other;


    } catch (error) {

        console.error(
            "INTERACTION REPORT ERROR:",
            error
        );

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
// START REPORTS
// ========================================

async function startReports() {

    loadUser();

    await Promise.all([
        loadCustomerReport(),
        loadTaskReport(),
        loadInteractionReport()
    ]);

}


startReports();