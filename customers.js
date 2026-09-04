// ========================================
// CUSTOMERS PAGE
// ========================================


// ========================================
// LOGIN CHECK
// ========================================

if (localStorage.getItem("crmLoggedIn") !== "true") {
    window.location.href = "login.html";
}


// ========================================
// API
// ========================================

const API_URL = "http://localhost:3000/api/customers";


// ========================================
// GET TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("crmToken");
}


// ========================================
// AUTH HEADERS
// ========================================

function getAuthHeaders(includeContentType = false) {

    const headers = {
        "Authorization": `Bearer ${getToken()}`
    };

    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


// ========================================
// ELEMENTS
// ========================================

const modal = document.getElementById("customerModal");

const addButton =
    document.getElementById("addCustomerButton");

const closeButton =
    document.getElementById("closeModal");

const cancelButton =
    document.getElementById("cancelCustomer");

const form =
    document.getElementById("customerForm");

const tableBody =
    document.getElementById("customerTableBody");

const searchInput =
    document.getElementById("searchCustomer");

const logoutButton =
    document.getElementById("logoutButton");

const userName =
    document.getElementById("userName");

const userAvatar =
    document.getElementById("userAvatar");


// ========================================
// LOAD USER
// ========================================

function loadUser() {

    try {

        const savedUser =
            localStorage.getItem("currentUser");

        if (!savedUser) {
            return;
        }

        const user =
            JSON.parse(savedUser);

        const name =
            user.name ||
            user.fullName ||
            user.username ||
            "User";

        if (userName) {
            userName.textContent = name;
        }

        if (userAvatar) {
            userAvatar.textContent =
                name.charAt(0).toUpperCase();
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

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="5"
                style="text-align:center; padding:30px;">
                Loading customers...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(API_URL, {
                method: "GET",
                headers: getAuthHeaders()
            });

        if (response.status === 401) {

            logoutUser();

            return;
        }

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load customers"
            );

        }

        const customers =
            Array.isArray(result)
                ? result
                : result.customers || [];

        displayCustomers(customers);

    } catch (error) {

        console.error(
            "Error loading customers:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center; padding:30px;">
                    Unable to load customers.
                </td>
            </tr>
        `;

    }

}


// ========================================
// DISPLAY CUSTOMERS
// ========================================

function displayCustomers(customers) {

    tableBody.innerHTML = "";

    if (!customers || customers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center; padding:30px;">
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }


    customers.forEach(function (customer) {

        const row =
            document.createElement("tr");


        const name =
            customer.name || "";

        const email =
            customer.email || "";

        const phone =
            customer.phone || "";

        const status =
            customer.status || "Lead";


        row.innerHTML = `
            <td>
                <strong>
                    ${escapeHTML(name)}
                </strong>
            </td>

            <td>
                ${escapeHTML(email)}
            </td>

            <td>
                ${escapeHTML(phone)}
            </td>

            <td>
                <span class="status ${getStatusClass(status)}">
                    ${escapeHTML(status)}
                </span>
            </td>

            <td>

                <button
                    type="button"
                    class="table-action edit-btn"
                    data-id="${customer.id}">
                    Edit
                </button>

                <button
                    type="button"
                    class="table-action delete-btn"
                    data-id="${customer.id}">
                    Delete
                </button>

            </td>
        `;

        tableBody.appendChild(row);

    });

}


// ========================================
// STATUS CLASS
// ========================================

function getStatusClass(status) {

    return String(status)
        .toLowerCase()
        .replace(/\s+/g, "-");

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null ? "" : String(value);

    return div.innerHTML;

}


// ========================================
// OPEN MODAL
// ========================================

function openCustomerModal() {

    if (!modal) {
        return;
    }

    if (form) {
        form.reset();
    }

    modal.classList.add("show");

}


// ========================================
// CLOSE MODAL
// ========================================

function closeCustomerModal() {

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    if (form) {
        form.reset();
    }

}


// ========================================
// ADD CUSTOMER BUTTON
// ========================================

if (addButton) {

    addButton.addEventListener(
        "click",
        openCustomerModal
    );

}


// ========================================
// CLOSE BUTTON
// ========================================

if (closeButton) {

    closeButton.addEventListener(
        "click",
        closeCustomerModal
    );

}


// ========================================
// CANCEL BUTTON
// ========================================

if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        closeCustomerModal
    );

}


// ========================================
// CLOSE WHEN CLICKING OUTSIDE
// ========================================

if (modal) {

    modal.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {
                closeCustomerModal();
            }

        }
    );

}


// ========================================
// ADD CUSTOMER
// ========================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("customerName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("customerEmail")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("customerPhone")
                    .value
                    .trim();


            const status =
                document
                    .getElementById("customerStatus")
                    .value;


            if (!name || !email || !phone) {

                alert(
                    "Please complete all customer fields."
                );

                return;
            }


            try {

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers:
                            getAuthHeaders(true),

                        body: JSON.stringify({

                            name: name,
                            email: email,
                            phone: phone,
                            status: status

                        })

                    });


                if (response.status === 401) {

                    logoutUser();

                    return;
                }


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to add customer."
                    );

                    return;
                }


                alert(
                    "Customer added successfully!"
                );


                closeCustomerModal();

                await loadCustomers();


            } catch (error) {

                console.error(
                    "Error adding customer:",
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
// EDIT CUSTOMER
// ========================================

async function editCustomer(id) {

    if (!id) {
        return;
    }


    const name =
        prompt("Customer Name:");

    if (name === null) {
        return;
    }


    const email =
        prompt("Customer Email:");

    if (email === null) {
        return;
    }


    const phone =
        prompt("Customer Phone:");

    if (phone === null) {
        return;
    }


    const status =
        prompt(
            "Status (Lead, Active, Inactive):",
            "Lead"
        );

    if (status === null) {
        return;
    }


    if (
        !name.trim() ||
        !email.trim() ||
        !phone.trim()
    ) {

        alert(
            "Please complete all customer fields."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {

                    method: "PUT",

                    headers:
                        getAuthHeaders(true),

                    body: JSON.stringify({

                        name: name.trim(),

                        email: email.trim(),

                        phone: phone.trim(),

                        status: status.trim()

                    })

                }
            );


        if (response.status === 401) {

            logoutUser();

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to update customer."
            );

            return;
        }


        alert(
            "Customer updated successfully!"
        );


        await loadCustomers();


    } catch (error) {

        console.error(
            "Error updating customer:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );

    }

}


// ========================================
// DELETE CUSTOMER
// ========================================

async function deleteCustomer(id) {

    if (!id) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this customer?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {

                    method: "DELETE",

                    headers:
                        getAuthHeaders()

                }
            );


        if (response.status === 401) {

            logoutUser();

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to delete customer."
            );

            return;
        }


        alert(
            "Customer deleted successfully."
        );


        await loadCustomers();


    } catch (error) {

        console.error(
            "Error deleting customer:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );

    }

}


// ========================================
// TABLE ACTIONS
// ========================================

if (tableBody) {

    tableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest("button");


            if (!button) {
                return;
            }


            const id =
                button.getAttribute("data-id");


            if (!id) {
                return;
            }


            if (
                button.classList.contains(
                    "edit-btn"
                )
            ) {

                editCustomer(id);

                return;
            }


            if (
                button.classList.contains(
                    "delete-btn"
                )
            ) {

                deleteCustomer(id);

            }

        }
    );

}


// ========================================
// SEARCH CUSTOMERS
// ========================================

let allCustomers = [];


async function loadCustomersForSearch() {

    try {

        const response =
            await fetch(API_URL, {
                method: "GET",
                headers: getAuthHeaders()
            });


        if (response.status === 401) {

            logoutUser();

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {
            return;
        }


        allCustomers =
            Array.isArray(result)
                ? result
                : result.customers || [];


    } catch (error) {

        console.error(
            "Search loading error:",
            error
        );

    }

}


// ========================================
// SEARCH INPUT
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            if (!search) {

                displayCustomers(allCustomers);

                return;
            }


            const filtered =
                allCustomers.filter(
                    function (customer) {

                        return (

                            String(
                                customer.name || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                customer.email || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                customer.phone || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                customer.status || ""
                            )
                                .toLowerCase()
                                .includes(search)

                        );

                    }
                );


            displayCustomers(filtered);

        }
    );

}


// ========================================
// LOGOUT
// ========================================

function logoutUser() {

    localStorage.removeItem(
        "crmLoggedIn"
    );

    localStorage.removeItem(
        "crmToken"
    );

    localStorage.removeItem(
        "currentUser"
    );

    sessionStorage.clear();

    window.location.href =
        "login.html";

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logoutUser
    );

}


// ========================================
// INITIAL LOAD
// ========================================

async function initializeCustomersPage() {

    loadUser();

    await loadCustomers();

    await loadCustomersForSearch();

}


// Start

initializeCustomersPage();