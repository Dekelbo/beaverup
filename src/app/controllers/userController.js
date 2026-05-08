const users = require('../models/users'); // --- Import mock data ---

// --- Get all users ---
const getAllUsers = (req, res) => {
    res.status(200).json({ success: true, data: users, error: null });
};

// --- Get user by ID ---
const getUserById = (req, res) => {
    const user = users.find(u => u.userId === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            data: null, 
            error: { code: "USER_NOT_FOUND", message: "User not found" } 
        });
    }
    res.status(200).json({ success: true, data: user, error: null });
};

// --- Create a new user (POST) ---
const createUser = (req, res) => {
    const { firstName, lastName, userRole, userNativeLanguage, languageToLearn, currentLevel } = req.body;

    // --- Generate new ID based on the highest current ID ---
    const newId = users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1;
    
    // --- Create timestamp ---
    const now = new Date().toISOString();

    const newUser = {
        userId: newId,
        firstName,
        lastName,
        userRole: userRole || 'user',
        userNativeLanguage,
        languageToLearn,
        currentLevel,
        createDate: now,
        updateDate: now
    };

    users.push(newUser); // --- Add to the in-memory array ---

    res.status(201).json({ 
        success: true, 
        data: { userId: newId, message: "User created successfully" }, 
        error: null 
    });
};

// --- Delete user (DELETE) ---
const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.userId === id);

    if (index === -1) {
        return res.status(404).json({ 
            success: false, 
            data: null, 
            error: { code: "USER_NOT_FOUND", message: "User not found" } 
        });
    }

    // --- Remove user from array ---
    users.splice(index, 1);

    res.status(200).json({ 
        success: true, 
        data: { userId: id, message: "User deleted successfully" }, 
        error: null 
    });
};

// --- Export handlers ---
module.exports = { 
    getAllUsers, 
    getUserById, 
    createUser, 
    deleteUser 
}; 