const UserModel = require('../models/UserModel');

const isOwner = async (req, res, next) => {
    const userId = req.body.userId || req.headers['user-id'];

    try {
        const user = await UserModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                errors: [{ msg: 'User not found' }]
            });
        }

        if (user.role !== "owner") {
            return res.status(403).json({
                errors: [{ msg: 'Unauthorized: Only owners are allowed to perform this action' }]
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({
            errors: [{ msg: 'Server error, please try again later' }]
        });
    }
};

module.exports = isOwner;
