// backend\config\firebase.js
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../', process.env.FIREBASE_SERVICE_ACCOUNT_KEY));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_SERVICE_FIRESTORAGE_URL,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const messaging = admin.messaging();

module.exports = {db, messaging, bucket};