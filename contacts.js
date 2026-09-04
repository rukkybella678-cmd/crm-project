// ========================================
// LOGIN CHECK
// ========================================

if (localStorage.getItem("crmLoggedIn") !== "true") {
    window.location.href = "login.html";
}


// ========================================
// API
// ========================================

const API_URL = "http://localhost:3000/api";

const TOKEN = localStorage.getItem("crmToken");

if (!TOKEN) {
    alert("Please login again.");
    window.location.href = "login.html";
}


// ========================================
// DATA
// ========================================

let customers = [];
let contacts = [];


// ========================================
// USER INFORMATION
// ========================================

const savedUser = localStorage.getItem("currentUser");

if (savedUser) {

    try {

        const user = JSON.parse(savedUser);

        const userName =
            document.getElementById("userName");

        if (userName && user.fullName) {
            userName.textContent = user.fullName;
        }

        const userAvatar =
            document.getElementById("userAvatar");

        if (userAvatar && user.fullName) {
            userAvatar.textContent =
                user.fullName.charAt(0).toUpperCase();
        }

    } catch (error) {

        console.error("Unable to load user.");

    }
}


// ========================================
// ELEMENTS
// ========================================

const contactForm =
    document.getElementById("contactForm");

const contactModal =
    document.getElementById("contactModal");

const addContactButton =
    document.getElementById("addContactButton");

const closeModal =
    document.getElementById("closeModal");

const contactTableBody =
    document.getElementById("contactTableBody");

const searchContact =
    document.getElementById("searchContact");

const contactCustomer =
    document.getElementById("contactCustomer");


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    try {

        const response =
            await fetch(`${API_URL}/customers`, {

                headers: {
                    "Authorization": `Bearer ${TOKEN}`
                }

            });


        if (!response.ok) {

            if (response.status === 401) {

                localStorage.removeItem("crmToken");
                localStorage.removeItem("crmLoggedIn");
                localStorage.removeItem("currentUser");

                alert("Your login session has expired. Please login again.");

                window.location.href = "login.html";

                return;
            }

            throw new Error("Could not load customers");

        }


        customers = await response.json();


        contactCustomer.innerHTML = `
            <option value="">
                Select customer
            </option>
        `;


        customers.forEach(function (customer) {

            const option =
                document.createElement("option");

            option.value = customer.id;

            option.textContent = customer.name;

            contactCustomer.appendChild(option);

        });


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the CRM backend."
        );

    }

}


// ========================================
// LOAD CONTACTS
// ========================================

async function loadContacts() {

    try {

        const response =
            await fetch(`${API_URL}/contacts`, {

                headers: {
                    "Authorization": `Bearer ${TOKEN}`
                }

            });


        if (!response.ok) {

            if (response.status === 401) {

                localStorage.removeItem("crmToken");
                localStorage.removeItem("crmLoggedIn");
                localStorage.removeItem("currentUser");

                alert("Your login session has expired. Please login again.");

                window.location.href = "login.html";

                return;
            }

            throw new Error("Could not load contacts");

        }


        contacts = await response.json();

        displayContacts();


    } catch (error) {

        console.error(error);

        contactTableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; padding:30px;">
                    Could not load contacts.
                </td>
            </tr>
        `;

    }

}


// ========================================
// DISPLAY CONTACTS
// ========================================

function displayContacts(list = contacts) {

    contactTableBody.innerHTML = "";


    if (list.length === 0) {

        contactTableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; padding:30px;">
                    No contacts found.
                </td>
            </tr>
        `;

        return;
    }


    list.forEach(function (contact) {

        const customer =
            customers.find(function (item) {

                return String(item.id) ===
                    String(contact.customerId);

            });


        const customerName =
            customer
                ? customer.name
                : "Unknown Customer";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHTML(customerName)}
            </td>

            <td>
                ${escapeHTML(contact.type)}
            </td>

            <td>
                ${escapeHTML(contact.date)}
            </td>

            <td>
                ${escapeHTML(contact.subject)}
            </td>

            <td>
                ${escapeHTML(contact.notes || "-")}
            </td>

            <td>

                <button
                    type="button"
                    class="delete-button"
                    onclick="deleteContact('${contact.id}')">
                    Delete
                </button>

            </td>

        `;


        contactTableBody.appendChild(row);

    });

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value || "";

    return div.innerHTML;

}


// ========================================
// OPEN MODAL
// ========================================

addContactButton.addEventListener(
    "click",
    async function () {

        contactForm.reset();

        await loadCustomers();


        document.getElementById("contactDate").value =
            new Date().toISOString().split("T")[0];


        contactModal.classList.add("show");

    }
);


// ========================================
// CLOSE MODAL
// ========================================

closeModal.addEventListener(
    "click",
    function () {

        contactModal.classList.remove("show");

    }
);


// ========================================
// SAVE CONTACT
// ========================================

contactForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const customerId =
            contactCustomer.value;

        const type =
            document.getElementById("contactType").value;

        const date =
            document.getElementById("contactDate").value;

        const subject =
            document.getElementById("contactSubject")
                .value
                .trim();

        const notes =
            document.getElementById("contactNotes")
                .value
                .trim();


        if (!customerId || !type || !date || !subject) {

            alert(
                "Please complete the required fields."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/contacts`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${TOKEN}`

                        },

                        body: JSON.stringify({

                            customerId:
                                customerId,

                            type:
                                type,

                            date:
                                date,

                            subject:
                                subject,

                            notes:
                                notes

                        })

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                if (response.status === 401) {

                    alert(
                        "Your login session has expired. Please login again."
                    );

                    localStorage.removeItem("crmToken");
                    localStorage.removeItem("crmLoggedIn");
                    localStorage.removeItem("currentUser");

                    window.location.href =
                        "login.html";

                    return;
                }


                alert(
                    result.message ||
                    "Unable to save contact."
                );

                return;

            }


            alert(
                "Contact added successfully!"
            );


            contactModal.classList.remove("show");

            contactForm.reset();


            await loadContacts();


        } catch (error) {

            console.error(error);

            alert(
                "Could not connect to the CRM backend."
            );

        }

    }
);


// ========================================
// DELETE CONTACT
// ========================================

async function deleteContact(id) {

    if (!confirm("Delete this contact record?")) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/contacts/${id}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${TOKEN}`

                    }

                }
            );


        if (!response.ok) {

            if (response.status === 401) {

                localStorage.removeItem("crmToken");
                localStorage.removeItem("crmLoggedIn");
                localStorage.removeItem("currentUser");

                alert(
                    "Your login session has expired. Please login again."
                );

                window.location.href =
                    "login.html";

                return;
            }


            throw new Error(
                "Could not delete contact"
            );

        }


        await loadContacts();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the CRM backend."
        );

    }

}


// ========================================
// SEARCH
// ========================================

searchContact.addEventListener(
    "input",
    function () {

        const search =
            searchContact.value
                .toLowerCase()
                .trim();


        const filtered =
            contacts.filter(function (contact) {

                const customer =
                    customers.find(function (item) {

                        return String(item.id) ===
                            String(contact.customerId);

                    });


                const customerName =
                    customer
                        ? customer.name.toLowerCase()
                        : "";


                return (

                    customerName.includes(search)

                    ||

                    String(contact.type)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(contact.subject)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(contact.notes || "")
                        .toLowerCase()
                        .includes(search)

                );

            });


        displayContacts(filtered);

    }
);


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await fetch(
                    `${API_URL}/logout`,
                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${TOKEN}`

                        }

                    }
                );

            } catch (error) {

                console.error(
                    "Logout request failed:",
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
// INITIALIZE
// ========================================

async function startContactsPage() {

    await loadCustomers();

    await loadContacts();

}


startContactsPage();