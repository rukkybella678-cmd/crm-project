const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow JSON requests
app.use(express.json());

// Serve all your frontend files
app.use(express.static(__dirname));

// When someone visits the main website
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`CRM server running on port ${PORT}`);
});

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