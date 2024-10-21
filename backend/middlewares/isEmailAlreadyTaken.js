const UserModel = require('../models/UserModel');  // Import the UserModel properly

const isEmailAlreadyTaken = async (req, res, next) => {
    const email = req.body.email;

    try {
        // Use Firestore-based method to check if user exists
        const user = await UserModel.getUserByEmail(email);
        if (user) {
            return res.status(400).json({
                errors: [{ msg: 'Email already taken' }]
            });
        }
        next(); // If no user is found, continue to the next middleware or controller
    } catch (err) {
        next(err); // Handle any errors that might occur
    }
};

module.exports = isEmailAlreadyTaken;