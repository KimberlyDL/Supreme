require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

//validator and checks
const { validationResult } = require('express-validator');

//password hashing
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const {User} = require('../models');


const checkUserExists = async (userEmail) => {
    try {
        return await User.findOne({ where: { email: userEmail } }) || false;
    } catch (error) {
        console.error("Error fetching user:", error);
        return false;
    }
}

const SessionController = {

    post: async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await checkUserExists(email);

            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    const userId = user.id; // Fix: declare userId
                    const cartCount = await Cart.count({
                        where: { userId }
                    });

                    req.session.userId = userId;
                    req.session.firstName = user.firstName;
                    req.session.lastName = user.lastName;
                    req.session.role = user.role; // Store user role in session
                    req.session.cartCount = cartCount;

                    // Redirect to the dashboard if the user is an admin
                    if (user.role === 'admin') {
                        return res.redirect('/admin/reports'); // Adjust the route to your dashboard
                    }

                    return res.redirect('/'); // Default redirect for regular users
                }
            }

            res.render('user/signin', {
                title: 'Supreme Agribet Feeds Supply Store',
                currentUrl: req.url,
                session: req.session || {},
                errors: { msg: 'Invalid log in' },
                formData: { email },
            });

        } catch (error) {
            console.error("Error during login:", error);
            return res.render('user/signin', {
                title: 'Supreme Agribet Feeds Supply Store',
                currentUrl: req.url,
                session: req.session || {},
                errors: { msg: 'An error occurred, please try again later.' },
                formData: { email }
            });
        }
    },


    destroy: async (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Failed to destroy session during logout", err);
                return res.status(500).send('Something went wrong. Please try again.');
            }

            res.redirect('/signin');
        });
    }
}

module.exports = SessionController;
