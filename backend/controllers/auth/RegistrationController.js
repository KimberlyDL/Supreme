const express = require('express');
const { getAuth } = require('firebase-admin/auth');
const { db } = require('../../config/firebase');
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
            city: 'Calapan',
            municipality: 'Mindoro',
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
};

module.exports = RegistrationController;
