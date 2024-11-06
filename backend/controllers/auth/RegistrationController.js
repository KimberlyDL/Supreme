const express = require('express');
const { getAuth } = require('firebase-admin/auth');
const { admin, db } = require('../../config/firebase');
const router = express.Router();

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

      // Store user details in Firestore
      await db.collection('users').doc(firebaseUser.uid).set({
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
      });

      
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


};

module.exports = RegistrationController;
