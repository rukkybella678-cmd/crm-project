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


// ========================================
// AUTH TOKEN
// ========================================

function getAuthHeaders() {

    const token = localStorage.getItem("crmToken");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}


// ========================================
// DATA
// ========================================

let customers = [];
let tasks = [];


// ========================================
// ELEMENTS
// ========================================

const taskForm = document.getElementById("taskForm");
const taskModal = document.getElementById("taskModal");
const addTaskButton = document.getElementById("addTaskButton");
const closeModal = document.getElementById("closeModal");
const taskTableBody = document.getElementById("taskTableBody");
const searchTask = document.getElementById("searchTask");
const filterStatus = document.getElementById("filterStatus");
const filterPriority = document.getElementById("filterPriority");
const taskCustomer = document.getElementById("taskCustomer");


// ========================================
// USER INFORMATION
// ========================================

const savedUser = localStorage.getItem("currentUser");

if (savedUser) {

    try {

        const user = JSON.parse(savedUser);

        const userName = document.getElementById("userName");

        if (userName && user.fullName) {
            userName.textContent = user.fullName;
        }

        const userAvatar = document.getElementById("userAvatar");

        if (userAvatar && user.fullName) {
            userAvatar.textContent =
                user.fullName.charAt(0).toUpperCase();
        }

    } catch (error) {

        console.error("Unable to load user information.");

    }

}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    try {

        const response = await fetch(
            `${API_URL}/customers`,
            {
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Customer API error");
        }

        customers = await response.json();

        if (taskCustomer) {

            taskCustomer.innerHTML = `
                <option value="">
                    Select customer
                </option>
            `;

            customers.forEach(function (customer) {

                const option =
                    document.createElement("option");

                option.value = customer.id;

                option.textContent = customer.name;

                taskCustomer.appendChild(option);

            });

        }

    } catch (error) {

        console.error(
            "Error loading customers:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );

    }

}


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    try {

        const response = await fetch(
            `${API_URL}/tasks`,
            {
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Task API error");
        }

        tasks = await response.json();

        displayTasks();

    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        taskTableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; padding:30px;">
                    Could not load tasks.
                </td>
            </tr>
        `;

    }

}


// ========================================
// DISPLAY TASKS
// ========================================

function displayTasks(list = tasks) {

    taskTableBody.innerHTML = "";

    if (list.length === 0) {

        taskTableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; padding:30px;">
                    No tasks found.
                </td>
            </tr>
        `;

        return;
    }


    list.forEach(function (task) {

        const customer =
            customers.find(function (item) {

                return String(item.id) ===
                    String(task.customerId);

            });


        const customerName =
            customer
                ? customer.name
                : "Unknown Customer";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(task.title)}
                </strong>
            </td>

            <td>
                ${escapeHTML(customerName)}
            </td>

            <td>
                ${escapeHTML(task.dueDate)}
            </td>

            <td>
                ${escapeHTML(task.priority)}
            </td>

            <td>
                ${escapeHTML(task.status)}
            </td>

            <td>

                ${
                    task.status !== "Completed"
                    ?
                    `
                    <button
                        type="button"
                        class="edit-button"
                        onclick="completeTask('${task.id}')">
                        Complete
                    </button>
                    `
                    :
                    ""
                }

                <button
                    type="button"
                    class="delete-button"
                    onclick="deleteTask('${task.id}')">
                    Delete
                </button>

            </td>

        `;

        taskTableBody.appendChild(row);

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
// OPEN TASK MODAL
// ========================================

if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        async function () {

            taskForm.reset();

            await loadCustomers();

            document.getElementById(
                "taskDueDate"
            ).value =
                new Date()
                    .toISOString()
                    .split("T")[0];

            taskModal.classList.add("show");

        }
    );

}


// ========================================
// CLOSE MODAL
// ========================================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function () {

            taskModal.classList.remove("show");

        }
    );

}


// ========================================
// SAVE TASK
// ========================================

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document.getElementById("taskTitle")
                    .value
                    .trim();


            const customerId =
                document.getElementById("taskCustomer")
                    .value;


            const dueDate =
                document.getElementById("taskDueDate")
                    .value;


            const priority =
                document.getElementById("taskPriority")
                    .value;


            const status =
                document.getElementById("taskStatus")
                    .value;


            const description =
                document.getElementById("taskDescription")
                    .value
                    .trim();


            if (!title || !customerId || !dueDate) {

                alert(
                    "Please complete the required fields."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/tasks`,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(),

                            body: JSON.stringify({

                                title: title,

                                customerId:
                                    customerId,

                                dueDate:
                                    dueDate,

                                priority:
                                    priority,

                                status:
                                    status,

                                description:
                                    description

                            })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to save task."
                    );

                    return;

                }


                alert(
                    "Task added successfully!"
                );


                taskModal.classList.remove(
                    "show"
                );

                taskForm.reset();


                await loadTasks();


            } catch (error) {

                console.error(
                    "SAVE TASK ERROR:",
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
// COMPLETE TASK
// ========================================

async function completeTask(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${id}`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({
                        status: "Completed"
                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not complete task"
            );

        }


        await loadTasks();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the CRM backend."
        );

    }

}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(id) {

    if (!confirm("Delete this task?")) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${id}`,
                {
                    method: "DELETE",

                    headers:
                        getAuthHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not delete task"
            );

        }


        await loadTasks();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the CRM backend."
        );

    }

}


// ========================================
// SEARCH AND FILTER
// ========================================

function filterTasks() {

    const search =
        searchTask.value
            .toLowerCase()
            .trim();


    const status =
        filterStatus.value;


    const priority =
        filterPriority.value;


    const filtered =
        tasks.filter(function (task) {

            const customer =
                customers.find(function (item) {

                    return String(item.id) ===
                        String(task.customerId);

                });


            const customerName =
                customer
                    ? customer.name.toLowerCase()
                    : "";


            const matchesSearch =

                String(task.title)
                    .toLowerCase()
                    .includes(search)

                ||

                customerName.includes(search)

                ||

                String(task.description || "")
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                status === "All" ||
                task.status === status;


            const matchesPriority =
                priority === "All" ||
                task.priority === priority;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );

        });


    displayTasks(filtered);

}


if (searchTask) {

    searchTask.addEventListener(
        "input",
        filterTasks
    );

}


if (filterStatus) {

    filterStatus.addEventListener(
        "change",
        filterTasks
    );

}


if (filterPriority) {

    filterPriority.addEventListener(
        "change",
        filterTasks
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

async function startTasksPage() {

    await loadCustomers();

    await loadTasks();

}


startTasksPage();