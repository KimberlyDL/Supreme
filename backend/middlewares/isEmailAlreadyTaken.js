const { User } = require('../models');

const isEmailAlreadyTaken = (req, res, next) => {
    const email = req.body.email;

    User.findOne({ where: { email: email } })
        .then(user => {
            if (user) {
                return res.status(400).json({
                    errors: [{ msg: 'Email already taken' }]
                });
            }
            next();
        })
        .catch(err => next(err));
};

module.exports = isEmailAlreadyTaken;
