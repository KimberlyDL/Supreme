const UserModel = require('../models/UserModel');  // Import the UserModel properly

const isEmailAlreadyTaken = async (req, res, next) => {
    const email = req.body.email;

    try {
        const user = await UserModel.getUserByEmail(email);
        if (user) {
            return res.status(400).json({
                errors: [{ param: 'email', msg: 'Email already taken.' }]
            });
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = isEmailAlreadyTaken;