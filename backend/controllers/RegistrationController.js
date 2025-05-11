// backend\controllers\auth\RegistrationController.js
const express = require('express');
const { getAuth } = require('firebase-admin/auth');
const { admin, auth, db } = require('../config/firebase');
const AuthService = require('../lib/AuthService');
// const UserService = require('../lib/UserService');
const UserModel = require('../models/User');

const router = express.Router();
const authSerivce = new AuthService();


const UserService = require("../services/UserService")

const RegistrationController = {
  registerUser: async (req, res) => {
    try {
      const { userData } = req.body;

      if (!userData) {
        console.error("error in user registration: Invalid user data");
        return res.status(400).json({ message: 'Invalid user data' });
      }

      // userData.role = 'client';
      // const registrationHandler = UserService.getRegistrationHandler(userData.role);
      const registrationHandler = UserService.getRegistrationHandler("client");
      const result = await registrationHandler.register(userData);

      if (result.success) {
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error("error in user registration: ", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  },

  registerManager: async (req, res) => {
    try {
      const userRecord = await auth.createUser({
        email: 'suppremeagrivet@gmail.com',
        password: 'kimmeng01',
        emailVerified: false,
        disabled: false
      });

      userData = {
        ...userRecord,
        // role: 'owner',
        // branch: 'all'
      }
      // const registrationHandler = UserService.getRegistrationHandler(userData.role);
      const registrationHandler = UserService.getRegistrationHandler("owner");
      const result = await registrationHandler.register(userData);

      if (result.success) {
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error("error in user registration: ", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  },

  registerEmployee: async (req, res) => {
    try {
      const { userData } = req.body;

      if (!userData || !userData.role) {
        console.error("error in user registration: Invalid user data or missing role");
        return res.status(400).json({ message: 'Invalid user data or missing role' });
      }

      const registrationHandler = UserService.getRegistrationHandler(userData.role);

      const result = await registrationHandler.register(userData);

      if (result.success) {
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error("error in employee registration: ", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  },

  // triggered after logging in again after successful verification
  //setting up user after getting verified
  // adding claims of role and branch in the claim (firebase token) for authorization system
  setupUser: async (req, res) => {
    try {
      const uid = req.user.uid;

      const user = await UserModel.getUserById(uid);
      if (!user) {
        throw Error('No user found');
      }

      let branch = null;
      const role = user.role;

      if (role !== "client") {
        branch = user.branch;
      }

      await admin.auth().setCustomUserClaims(uid, { role, branch });
      
      await UserModel.activateUser(uid);

      const userData = {
        uid: uid,
        email: user.email,
        role: user.role
      };
      await authSerivce.handleNewUser(userData, req);

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Error setting user claims:', error);
      return res.status(500).json('Failed to setup user');
    }
  },

  // #region OldCodes
  // sendVerificationLink: async (req, res) => {
  //   try {
  //     const email = 'suppremeagrivet@gmail.com'

  //     const auth = getAuth();
  //     const emailVerificationLink = await auth.generateEmailVerificationLink(email);

  //     return res.status(200).json({
  //       message: 'Email verification link sent.',
  //       verificationLink: emailVerificationLink,
  //     });

  //   } catch (error) {
  //     console.error('Error sending verification email:', error);
  //     return res.status(500).json({ message: 'Error sending verification email', error });
  //   }
  // },

  // setUserClaim: async (req, res) => {
  //   const { role, branchName } = req.body;

  //   const uid = req.user.uid;

  //   try {

  //     // console.log('Setting claims:', { uid, role, branchName, branch });

  //     await admin.auth().setCustomUserClaims(uid, { role, branchName });
  //     res.status(200).json('User claims set successfully');

  //   } catch (error) {
  //     console.error('Error setting user claims:', error);
  //     res.status(500).json('Failed to set user claims');
  //   }
  // },

  // logUserRegistration: async (req, res) => {
  //   try {
  //     const logId = await userService.logUserRegistration(req.body, req);
  //     res.status(200).json({ message: 'User registration logged successfully', logId });
  //   } catch (error) {
  //     console.error('Error logging user registration:', error);
  //     res.status(500).json({ error: 'Failed to log user registration' });
  //   }
  // },

  // createNotificationForNewUser: async (req, res) => {
  //   try {
  //     const notificationId = await userService.createNotificationForNewUser(req.body, req.user.uid);
  //     res.status(200).json({ message: 'Notification created successfully', notificationId });
  //   } catch (error) {
  //     console.error('Error creating notification:', error);
  //     res.status(500).json({ error: 'Failed to create notification' });
  //   }
  // },
  // #endregion

};

module.exports = RegistrationController;