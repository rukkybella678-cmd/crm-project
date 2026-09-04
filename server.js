const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const app = express();
const PORT = 3000;


// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "..")));


// ======================================
// CUSTOMER STORAGE
// ======================================

const DATA_FILE = path.join(__dirname, "customers.json");

function loadCustomers() {

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "[]");
    }

    try {

        const data = fs.readFileSync(DATA_FILE, "utf8");

        return JSON.parse(data);

    } catch (error) {

        console.error("Error reading customers.json:", error);

        return [];

    }

}

let customers = loadCustomers();


function saveCustomers() {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(customers, null, 2)
    );

}


// ======================================
// CONTACT STORAGE
// ======================================

const CONTACTS_FILE = path.join(__dirname, "contacts.json");


function loadContacts() {

    if (!fs.existsSync(CONTACTS_FILE)) {
        fs.writeFileSync(CONTACTS_FILE, "[]");
    }

    try {

        const data = fs.readFileSync(CONTACTS_FILE, "utf8");

        return JSON.parse(data);

    } catch (error) {

        console.error("Error reading contacts.json:", error);

        return [];

    }

}

let contacts = loadContacts();


function saveContacts() {

    fs.writeFileSync(
        CONTACTS_FILE,
        JSON.stringify(contacts, null, 2)
    );

}


// ======================================
// TASK STORAGE
// ======================================

const TASKS_FILE = path.join(__dirname, "tasks.json");


function loadTasks() {

    if (!fs.existsSync(TASKS_FILE)) {
        fs.writeFileSync(TASKS_FILE, "[]");
    }

    try {

        const data = fs.readFileSync(TASKS_FILE, "utf8");

        return JSON.parse(data);

    } catch (error) {

        console.error("Error reading tasks.json:", error);

        return [];

    }

}

let tasks = loadTasks();


function saveTasks() {

    fs.writeFileSync(
        TASKS_FILE,
        JSON.stringify(tasks, null, 2)
    );

}


// ======================================
// USER STORAGE
// ======================================

const USERS_FILE = path.join(__dirname, "users.json");


function loadUsers() {

    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, "[]");
    }

    try {

        const data = fs.readFileSync(USERS_FILE, "utf8");

        return JSON.parse(data);

    } catch (error) {

        console.error("Error reading users.json:", error);

        return [];

    }

}


let users = loadUsers();


function saveUsers() {

    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2)
    );

}


// ======================================
// LOGIN TOKEN STORAGE
// ======================================

const activeTokens = new Map();


// ======================================
// AUTHENTICATION MIDDLEWARE
// ======================================

function authenticate(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });

    }


    if (!authHeader.startsWith("Bearer ")) {

        return res.status(401).json({
            success: false,
            message: "Invalid authentication format."
        });

    }


    const token = authHeader.replace("Bearer ", "").trim();

    const userId = activeTokens.get(token);


    if (!userId) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });

    }


    req.userId = userId;

    next();

}


// ======================================
// TEST API
// ======================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "CRM backend is working!"
    });

});


// ======================================
// CUSTOMER API
// ======================================


// GET CUSTOMERS

app.get("/api/customers", authenticate, (req, res) => {

    res.json(customers);

});


// ADD CUSTOMER

app.post("/api/customers", authenticate, (req, res) => {

    const {
        name,
        email,
        phone,
        status
    } = req.body;


    if (!name || !email || !phone) {

        return res.status(400).json({

            success: false,

            message:
                "Name, email and phone are required."

        });

    }


    const customer = {

        id: Date.now().toString(),

        name: name.trim(),

        email: email.trim(),

        phone: phone.trim(),

        status: status || "Lead",

        createdAt: new Date().toISOString()

    };


    customers.push(customer);

    saveCustomers();


    res.status(201).json({

        success: true,

        message: "Customer added successfully.",

        customer: customer

    });

});


// UPDATE CUSTOMER

app.put("/api/customers/:id", authenticate, (req, res) => {

    const customer = customers.find(
        customer => customer.id === req.params.id
    );


    if (!customer) {

        return res.status(404).json({

            success: false,

            message: "Customer not found."

        });

    }


    const {
        name,
        email,
        phone,
        status
    } = req.body;


    if (!name || !email || !phone) {

        return res.status(400).json({

            success: false,

            message:
                "Name, email and phone are required."

        });

    }


    customer.name = name.trim();

    customer.email = email.trim();

    customer.phone = phone.trim();

    customer.status = status || "Lead";


    saveCustomers();


    res.json({

        success: true,

        message: "Customer updated successfully.",

        customer: customer

    });

});


// DELETE CUSTOMER

app.delete("/api/customers/:id", authenticate, (req, res) => {

    const exists = customers.some(
        customer => customer.id === req.params.id
    );


    if (!exists) {

        return res.status(404).json({

            success: false,

            message: "Customer not found."

        });

    }


    customers = customers.filter(
        customer => customer.id !== req.params.id
    );


    saveCustomers();


    res.json({

        success: true,

        message: "Customer deleted successfully."

    });

});


// ======================================
// CONTACT API
// ======================================


// GET CONTACTS

app.get("/api/contacts", authenticate, (req, res) => {

    res.json(contacts);

});


// ADD CONTACT

app.post("/api/contacts", authenticate, (req, res) => {

    const {
        customerId,
        type,
        date,
        subject,
        notes
    } = req.body;


    if (!customerId || !type || !date || !subject) {

        return res.status(400).json({

            success: false,

            message:
                "Customer, type, date and subject are required."

        });

    }


    const contact = {

        id: Date.now().toString(),

        customerId: customerId,

        type: type,

        date: date,

        subject: subject.trim(),

        notes: notes ? notes.trim() : "",

        createdAt: new Date().toISOString()

    };


    contacts.push(contact);

    saveContacts();


    res.status(201).json({

        success: true,

        message: "Contact added successfully.",

        contact: contact

    });

});


// DELETE CONTACT

app.delete("/api/contacts/:id", authenticate, (req, res) => {

    const exists = contacts.some(
        contact => contact.id === req.params.id
    );


    if (!exists) {

        return res.status(404).json({

            success: false,

            message: "Contact not found."

        });

    }


    contacts = contacts.filter(
        contact => contact.id !== req.params.id
    );


    saveContacts();


    res.json({

        success: true,

        message: "Contact deleted successfully."

    });

});


// ======================================
// TASK API
// ======================================


// GET TASKS

app.get("/api/tasks", authenticate, (req, res) => {

    res.json(tasks);

});


// ADD TASK

app.post("/api/tasks", authenticate, (req, res) => {

    const {
        title,
        customerId,
        dueDate,
        priority,
        status,
        description
    } = req.body;


    if (!title || !customerId || !dueDate) {

        return res.status(400).json({

            success: false,

            message:
                "Title, customer and due date are required."

        });

    }


    const task = {

        id: Date.now().toString(),

        title: title.trim(),

        customerId: customerId,

        dueDate: dueDate,

        priority: priority || "Medium",

        status: status || "Pending",

        description: description
            ? description.trim()
            : "",

        createdAt: new Date().toISOString()

    };


    tasks.push(task);

    saveTasks();


    res.status(201).json({

        success: true,

        message: "Task added successfully.",

        task: task

    });

});


// UPDATE TASK

app.put("/api/tasks/:id", authenticate, (req, res) => {

    const task = tasks.find(
        task => task.id === req.params.id
    );


    if (!task) {

        return res.status(404).json({

            success: false,

            message: "Task not found."

        });

    }


    if (req.body.status) {
        task.status = req.body.status;
    }


    if (req.body.title) {
        task.title = req.body.title.trim();
    }


    if (req.body.dueDate) {
        task.dueDate = req.body.dueDate;
    }


    if (req.body.priority) {
        task.priority = req.body.priority;
    }


    if (req.body.description !== undefined) {
        task.description = req.body.description;
    }


    saveTasks();


    res.json({

        success: true,

        message: "Task updated successfully.",

        task: task

    });

});


// DELETE TASK

app.delete("/api/tasks/:id", authenticate, (req, res) => {

    const exists = tasks.some(
        task => task.id === req.params.id
    );


    if (!exists) {

        return res.status(404).json({

            success: false,

            message: "Task not found."

        });

    }


    tasks = tasks.filter(
        task => task.id !== req.params.id
    );


    saveTasks();


    res.json({

        success: true,

        message: "Task deleted successfully."

    });

});


// ======================================
// SETTINGS STORAGE
// ======================================

const SETTINGS_FILE =
    path.join(__dirname, "settings.json");


function loadSettings() {

    if (!fs.existsSync(SETTINGS_FILE)) {

        fs.writeFileSync(
            SETTINGS_FILE,
            JSON.stringify({

                name: "",

                email: "",

                language: "English",

                timezone: "West Africa Time (WAT)",

                emailNotifications: true,

                customerNotifications: false

            }, null, 2)
        );

    }


    try {

        const data =
            fs.readFileSync(SETTINGS_FILE, "utf8");

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Error reading settings.json:",
            error
        );

        return {};

    }

}


function saveSettings(settings) {

    fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(settings, null, 2)
    );

}


let settings = loadSettings();


// ======================================
// GET SETTINGS
// ======================================

app.get("/api/settings", authenticate, (req, res) => {

    res.json(settings);

});


// ======================================
// UPDATE SETTINGS
// ======================================

app.put("/api/settings", authenticate, (req, res) => {

    const {
        name,
        email,
        language,
        timezone,
        emailNotifications,
        customerNotifications
    } = req.body;


    if (!name || !email) {

        return res.status(400).json({

            success: false,

            message:
                "Name and email are required."

        });

    }


    settings = {

        name: name.trim(),

        email: email.trim(),

        language: language || "English",

        timezone:
            timezone || "West Africa Time (WAT)",

        emailNotifications:
            Boolean(emailNotifications),

        customerNotifications:
            Boolean(customerNotifications)

    };


    saveSettings(settings);


    res.json({

        success: true,

        message: "Settings saved successfully.",

        settings: settings

    });

});


// ======================================
// REGISTER USER
// ======================================

app.post("/api/register", async (req, res) => {

    const {
        fullName,
        email,
        password
    } = req.body;


    if (!fullName || !email || !password) {

        return res.status(400).json({

            success: false,

            message:
                "Full name, email and password are required."

        });

    }


    if (password.length < 6) {

        return res.status(400).json({

            success: false,

            message:
                "Password must be at least 6 characters."

        });

    }


    const existingUser = users.find(
        user =>
            user.email.toLowerCase() ===
            email.trim().toLowerCase()
    );


    if (existingUser) {

        return res.status(409).json({

            success: false,

            message:
                "An account with this email already exists."

        });

    }


    // HASH PASSWORD ONCE

    const hashedPassword =
        await bcrypt.hash(password, 10);


    const user = {

        id: Date.now().toString(),

        fullName: fullName.trim(),

        email: email.trim().toLowerCase(),

        password: hashedPassword

    };


    users.push(user);

    saveUsers();


    res.status(201).json({

        success: true,

        message: "Account created successfully.",

        user: {

            id: user.id,

            fullName: user.fullName,

            email: user.email

        }

    });

});


// ======================================
// LOGIN USER
// ======================================

app.post("/api/login", async (req, res) => {

    const {
        email,
        password
    } = req.body;


    if (!email || !password) {

        return res.status(400).json({

            success: false,

            message:
                "Email and password are required."

        });

    }


    const user = users.find(
        item =>
            item.email.toLowerCase() ===
            email.trim().toLowerCase()
    );


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "Invalid email or password."

        });

    }


    // CHECK HASHED PASSWORD

    const passwordMatch =
        await bcrypt.compare(
            password,
            user.password
        );


    if (!passwordMatch) {

        return res.status(401).json({

            success: false,

            message: "Invalid email or password."

        });

    }


    // CREATE SECURE TOKEN

    const token =
        crypto.randomBytes(32).toString("hex");


    // STORE TOKEN

    activeTokens.set(token, user.id);


    res.json({

        success: true,

        message: "Login successful.",

        token: token,

        user: {

            id: user.id,

            fullName: user.fullName,

            email: user.email

        }

    });

});


// ======================================
// LOGOUT
// ======================================

app.post("/api/logout", authenticate, (req, res) => {

    const authHeader = req.headers.authorization;

    const token =
        authHeader.replace("Bearer ", "").trim();


    activeTokens.delete(token);


    res.json({

        success: true,

        message: "Logout successful."

    });

});


// ======================================
// START SERVER
// ======================================

app.listen(PORT, () => {

    console.log(
        `CRM backend running at http://localhost:${PORT}`
    );

})