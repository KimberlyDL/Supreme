// frontend\public\firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyABDhnImXJqLxCmUF3AHLycckYN4CV7JC0",
  authDomain: "tappride-cd691.firebaseapp.com",
  projectId: "tappride-cd691",
  storageBucket: "tappride-cd691.firebasestorage.app",
  messagingSenderId: "193668935641",
  appId: "1:193668935641:web:27e509d224cdb0186cb3c8",
  measurementId: "G-429VC2EET5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
