const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

//password hashing
const bcrypt = require('bcryptjs');
const saltRounds = 10;

//validator and checks
const { validationResult } = require('express-validator');

//models
const { UserModel } = require('../models');


//controller
const RegistrationController = {
    post: async (req, res) => {
        try {
            const { email, firstName, lastName, password } = req.body;

            // Check if the user already exists in Firestore
            const existingUser = await UserModel.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already taken' });
            }

            // Create a new user
            const newUser = {
                email,
                firstName,
                lastName,
                passwordHash: hashedPassword,  // Storing the hashed password
                createdAt: new Date().toISOString()
            };

            const userId = await UserModel.createUser(newUser);

            return res.status(201).json({ message: 'User created successfully', userId });
            console.error("Error registering user:", error);

        } catch (error) {

            console.error("Error registering user:", error);
            return res.status(500).json({ message: 'Error registering user', error });
        }

    },


    forgotpassword: async (req, res) => {
        res.render('user/forgotpassword', {
            title: 'Supreme Agribet Feeds Supply Store',
            currentUrl: req.url,
            session: req.session || {},
        })
    },

    resetpassword: async (req, res) => {
        res.render('user/resetpassword', {
            title: 'Supreme Agribet Feeds Supply Store',
            currentUrl: req.url,
            session: req.session || {},
        })
    }
}


module.exports = RegistrationController;