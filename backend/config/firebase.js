// backend\config\firebase.js
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../', process.env.FIREBASE_SERVICE_ACCOUNT_KEY));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_SERVICE_FIRESTORAGE_URL,
});

const auth = admin.auth();
const db = admin.firestore();
const bucket = admin.storage().bucket();
const messaging = admin.messaging();
const Timestamp = admin.firestore.Timestamp;

module.exports = {admin, auth, db, messaging, bucket, Timestamp};