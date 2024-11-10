const express = require('express');
const { getAuth } = require('firebase-admin/auth');
const { admin, db } = require('../../config/firebase');
const UserService = require('../../services/UserService');

const router = express.Router();
const userService = new UserService();

const RegistrationController = {
  createAdmin: async (req, res) => {
    try {
      const auth = getAuth();

      // Create the admin user in Firebase Auth (Admin SDK)
      const firebaseUser = await auth.createUser({
        email: 'suppremeagrivet@gmail.com',
        password: 'suppremeagrivet@3F1',
        displayName: 'Suppreme Agrivet',
      });

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'owner',
        isActive: true,
        profile: {
          firstName: 'Suppreme',
          lastName: 'Agrivet',
          address: {
            street: 'Manggahan',
            barangay: 'Balite',
            municipality: 'Calapan',
            province: 'Oriental Mindoro',
          },
          avatarUrl: null,
        },
        lastLoginAt: null,
        notifications: {
          emailNotifications: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store user details in Firestore
      await db.collection('users').doc(firebaseUser.uid).set(userData);

      // Log the admin user creation and create notification
      await userService.handleNewUser(userData, req);
      
      return res.status(201).json({
        message: 'Admin user created successfully. Please verify your email.',
      });

    } catch (error) {
      console.error('Error creating admin user:', error);
      return res.status(500).json({ message: 'Error creating admin user', error });
    }
  },

  sendVerificationLink: async (req, res) => {
    try {
      const email = 'suppremeagrivet@gmail.com'

      const auth = getAuth();
      const emailVerificationLink = await auth.generateEmailVerificationLink(email);

      return res.status(200).json({
        message: 'Email verification link sent.',
        verificationLink: emailVerificationLink,
      });

    } catch (error) {
      console.error('Error sending verification email:', error);
      return res.status(500).json({ message: 'Error sending verification email', error });
    }
  },

  setUserClaim: async (req, res) => {
    const { role } = req.body;

    const uid = req.user.uid;
  
    try {
      await admin.auth().setCustomUserClaims(uid, { role });
      res.status(200).json('User claims set successfully');
    } catch (error) {
      console.error('Error setting user claims:', error);
      res.status(500).json('Failed to set user claims');
    }
  },

  logUserRegistration: async (req, res) => {
    try {
      const logId = await userService.logUserRegistration(req.body, req);
      res.status(200).json({ message: 'User registration logged successfully', logId });
    } catch (error) {
      console.error('Error logging user registration:', error);
      res.status(500).json({ error: 'Failed to log user registration' });
    }
  },

  createNotificationForNewUser: async (req, res) => {
    try {
      const notificationId = await userService.createNotificationForNewUser(req.body, req.user.uid);
      res.status(200).json({ message: 'Notification created successfully', notificationId });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  },




};

module.exports = RegistrationController;