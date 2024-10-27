// frontend\public\firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBuIa83k0at72v5Dwm7uBcftBTrdiyYN5U',
  authDomain: 'test-2e37e.firebaseapp.com',
  projectId: 'test-2e37e',
  storageBucket: 'test-2e37e.appspot.com',
  messagingSenderId: '941660140629',
  appId: '1:941660140629:web:351ff177bea76379aa10dc',
  measurementId: 'G-LGE1JCGF64'
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
