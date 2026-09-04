// ========================================
// SETTINGS PAGE
// ========================================

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

    const token = localStorage.getItem("crmToken");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}


// ========================================
// ELEMENTS
// ========================================

const settingsForm =
    document.getElementById("settingsForm");

const nameInput =
    document.getElementById("settingsName");

const emailInput =
    document.getElementById("settingsEmail");

const languageInput =
    document.getElementById("settingsLanguage");

const timezoneInput =
    document.getElementById("settingsTimezone");

const emailNotifications =
    document.getElementById("emailNotifications");

const customerNotifications =
    document.getElementById("customerNotifications");


// ========================================
// LOAD SETTINGS
// ========================================

async function loadSettings() {

    try {

        const response =
            await fetch(
                `${API_URL}/settings`,
                {
                    headers: getAuthHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not load settings"
            );

        }


        const settings =
            await response.json();


        if (nameInput) {
            nameInput.value =
                settings.name || "";
        }


        if (emailInput) {
            emailInput.value =
                settings.email || "";
        }


        if (languageInput) {
            languageInput.value =
                settings.language || "English";
        }


        if (timezoneInput) {
            timezoneInput.value =
                settings.timezone ||
                "West Africa Time (WAT)";
        }


        if (emailNotifications) {
            emailNotifications.checked =
                Boolean(settings.emailNotifications);
        }


        if (customerNotifications) {
            customerNotifications.checked =
                Boolean(settings.customerNotifications);
        }


    } catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );

        alert(
            "Could not load your settings."
        );

    }

}


// ========================================
// SAVE SETTINGS
// ========================================

if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                nameInput.value.trim();

            const email =
                emailInput.value.trim();

            const language =
                languageInput
                    ? languageInput.value
                    : "English";

            const timezone =
                timezoneInput
                    ? timezoneInput.value
                    : "West Africa Time (WAT)";

            const emailNotify =
                emailNotifications
                    ? emailNotifications.checked
                    : false;

            const customerNotify =
                customerNotifications
                    ? customerNotifications.checked
                    : false;


            if (!name || !email) {

                alert(
                    "Name and email are required."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/settings`,
                        {
                            method: "PUT",

                            headers:
                                getAuthHeaders(),

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                language: language,

                                timezone: timezone,

                                emailNotifications:
                                    emailNotify,

                                customerNotifications:
                                    customerNotify

                            })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to save settings."
                    );

                    return;

                }


                alert(
                    "Settings saved successfully!"
                );


            } catch (error) {

                console.error(
                    "SAVE SETTINGS ERROR:",
                    error
                );

                alert(
                    "Could not connect to the CRM backend."
                );

            }

        }
    );

}


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

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
// START
// ========================================

loadSettings();