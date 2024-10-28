<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 class="text-2xl font-bold text-center">Create Employee</h2>
  
        <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>
        
        <form @submit.prevent="submitGeneralInfo">

          <!-- //create General imformation text for indicator and design -->

          <!-- //create upload form for image here -->

          <!-- //create email input field -->

          <!-- First Name Field -->
          <div class="mb-4">
            <input v-model="generalForm.firstName" type="text" placeholder="First Name" class="form-input w-full" />
            <span v-if="vGeneral.firstName.$error" class="text-red-500 text-sm">First name is required</span>
          </div>
  
          <!-- Last Name Field -->
          <div class="mb-4">
            <input v-model="generalForm.lastName" type="text" placeholder="Last Name" class="form-input w-full" />
            <span v-if="vGeneral.lastName.$error" class="text-red-500 text-sm">Last name is required</span>
          </div>
  
          <!-- Phone Field -->
          <div class="mb-4">
            <input v-model="generalForm.phone" type="tel" placeholder="Phone" class="form-input w-full" />
            <span v-if="vGeneral.phone.$error" class="text-red-500 text-sm">Phone number is required and must be valid</span>
          </div>
  
          <!-- make the address in a group for indicator and design -->

          <!-- Street Field -->
          <div class="mb-4">
            <input v-model="generalForm.street" type="text" placeholder="Street" class="form-input w-full" />
            <span v-if="vGeneral.street.$error" class="text-red-500 text-sm">Street is required</span>
          </div>
  
          <!-- Barangay Field -->
          <div class="mb-4">
            <input v-model="generalForm.barangay" type="text" placeholder="Barangay" class="form-input w-full" />
            <span v-if="vGeneral.barangay.$error" class="text-red-500 text-sm">Barangay is required</span>
          </div>
  
          <!-- City Field -->
          <div class="mb-4">
            <input v-model="generalForm.city" type="text" placeholder="City" class="form-input w-full" />
            <span v-if="vGeneral.city.$error" class="text-red-500 text-sm">City is required</span>
          </div>
  
          <!-- Municipality Field -->
          <div class="mb-4">
            <input v-model="generalForm.municipality" type="text" placeholder="Municipality" class="form-input w-full" />
            <span v-if="vGeneral.municipality.$error" class="text-red-500 text-sm">Municipality is required</span>
          </div>
  

          <!-- group these too (salary, position, branch), an create an appropriate label for this -->
          <!-- salary -->

          <!-- create a radio button here, to choose which type of user -->
          <!-- manager -->
          <!-- stock manager -->
          <!-- driver -->


          <!-- create a dropdown here to choose which branch the user will be saved to, the branch will be fetch from the firestore, you should create a method for it too -->


          <!-- create password -->
          <!-- create confirmPassword -->



          <!-- Submit Button with Loading -->
          <div class="relative">
            <button type="submit"
              class="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 active:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
              :disabled="vGeneral.$invalid || loading">
              <span v-if="!loading">Save Information</span>
              <span v-if="loading" class="flex justify-center items-center">
                <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Saving...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useVuelidate } from '@vuelidate/core';
  import { required, helpers, minLength, maxLength } from '@vuelidate/validators';
  import { useAuthStore as useAuthFirebaseStore } from '@stores/authFirebase';
  
// update this, include the new data given

  const authFirebaseStore = useAuthFirebaseStore();
  const generalForm = ref({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    barangay: '',
    city: '',
    municipality: ''
  });
  
  const loading = ref(false);
  const generalError = ref('');
  
  // Validation rules for general information
  const generalRules = {
    firstName: { required },
    lastName: { required },
    phone: {
      required,
      phone: helpers.regex('phone', /^\d+$/), // Only numbers allowed
      minLength: helpers.withMessage('Phone number must be at least 10 digits', minLength(10)),
      maxLength: helpers.withMessage('Phone number cannot exceed 15 digits', maxLength(15))
    },
    street: { required },
    barangay: { required },
    city: { required },
    municipality: { required }
  };
  
  // Vuelidate instance for validation
  const vGeneral = useVuelidate(generalRules, generalForm);
  
  // Submit handler for general information
  const submitGeneralInfo = async () => {
    vGeneral.value.$touch(); // Activate validation
  
    if (vGeneral.value.$invalid) {
      generalError.value = 'Please correct the errors before submitting.';
      return;
    }
  
    loading.value = true; // Set loading state to true when submitting
  

    try {
      await authFirebaseStore.editUser({
        firstName: generalForm.value.firstName,
        lastName: generalForm.value.lastName,
        phone: generalForm.value.phone,
        street: generalForm.value.street,
        barangay: generalForm.value.barangay,
        city: generalForm.value.city,
        municipality: generalForm.value.municipality
      });
  
      // Handle successful save, e.g., show a notification or redirect
  
    } catch (error) {
      generalError.value = 'An error occurred while saving. Please try again.';
    } finally {
      loading.value = false; // Set loading to false when done
    }
  };
  </script>
  
  <style scoped>
  .form-input {
    border: 1px solid #e2e8f0;
    padding: 8px 12px;
    border-radius: 4px;
    width: 100%;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #a0aec0;
  }
  </style>
  


  do not remove the loading when the user clicks the button ah, then if possible i want to make it two columns but responsive, the first column will be for the general data, from the user names to the address 
  then the second column will be for the employee specification until the confirm password, i want that when the screen become in a tablet size it will turn to one column Only



  this is my authFirebase for registering user and log in

  // frontend/src/stores/authFirebase.js
import { defineStore } from 'pinia';
import { auth, db } from '@services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {
      uid: '',
      role: null,
      firstName: '',
      lastName: '',
      email: '',
      emailVerified: false,
    },
    isLoggedIn: false,

    userOrders: [],
    userNotifications: [],
    userPromotions: [],

  }),

  actions: {
    async setUser(userData) {
      this.user.role = userData.role;
      this.user.firstName = userData.firstName;
      this.user.lastName = userData.lastName;
      this.user.email = userData.email;
      this.user.emailVerified = userData.emailVerified;
      this.isLoggedIn = userData.isLoggedIn;

      // console.log(`this user: ${JSON.stringify(this.user)}`);
    },

    async register(email, password, profileData) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        await setDoc(doc(db, 'users', this.user.uid), {
          email: this.user.email,
          role: "customer",
          isActive: true,
          profile: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            address: {
              street: profileData.street || "",
              barangay: profileData.barangay || "",
              city: profileData.city || "",
              municipality: profileData.municipality || "",
            },
            avatarUrl: null,
            number: '',
          },
          lastLoginAt: null,
          notifications: {
            emailNotifications: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      } catch (error) {
        console.error('Registration error:', error.message);
        throw new Error(error.message);
      }
    },

    async login(email, password) {
      try {

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        this.uid = this.user.uid; // Save the UID
        this.emailVerified = this.user.emailVerified;

        const userDoc = await getDoc(doc(db, 'users', this.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.user.role = userData.role;
          this.user.firstName = userData.firstName;
          this.user.lastName = userData.lastName;
          this.user.email = userData.email;
        }

        this.isLoggedIn = true;

        if (!this.emailVerified) {
          await sendEmailVerification(this.user);
          await signOut(auth);

          //make notif - "Please verify your email. A verification email has been sent."
          throw new Error("Unverified");
        }

        // this.persistToLocalStorage();

      } catch (error) {
        console.error('Login error:', error.message);
        throw error;
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.user = null;
      } catch (error) {
        console.error('Logout error:', error.message);
      }
    },


    async editUser(newUserData) {
      try {
        const userRef = doc(db, 'users', this.user.uid);
        await updateDoc(userRef, {
          firstName: newUserData.firstName,
          lastName: newUserData.lastName,
          phone: newUserData.phone,
          address: {
            street: newUserData.street,
            barangay: newUserData.barangay,
            city: newUserData.city,
            municipality: newUserData.municipality,
          }
        });
        // Success: User details updated
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },

    async editAvatar(newUserImage) {
      try {

      } catch (error) {
        console.error('Error updating user:', error.message);
        throw error;
      }
    },

    async changePassword(newUserImage) {
      try {

      } catch (error) {
        console.error('Error updating user:', error.message);
        throw error;
      }
    },

    
    
  },
  persist:true
  // persist: {
  //   enabled: true,
  //   strategies: [
  //     {
  //       key: 'keyy',
  //       storage: localStorage,
  //       pick: ['user'],
  //     },
  //   ],
  // },
});


schema for saving the image data in the firestore
{
  "uploadId": "abc123",
  "userId": "user456",
  "fileName": "profile-pic.jpg",
  "fileUrl": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/uploads%2Fprofile-pic.jpg?alt=media",
  "fileType": "image/jpeg",
  "fileSize": 512000,
  "uploadTime": "2024-10-27T10:00:00Z",
  "category": "profile_picture",
  "relatedId": "user456",
  "isActive": true,
  "metadata": {
    "width": 400,
    "height": 400,
    "tags": ["profile", "avatar"]
  }
}

i want the backend to handle the saving of the data to the firestorage for uploading of the image, the employee imformation, and emailNotifications

this is the firebase admin config i use for the backend

// backend\config\firebase.js
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../', process.env.FIREBASE_SERVICE_ACCOUNT_KEY));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: FIREBASE_SERVICE_FIRESTORAGE_URL,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const messaging = admin.messaging();

module.exports = {db, messaging, bucket};

where FIREBASE_SERVICE_FIRESTORAGE_URL=test-2e37e.appspot.com




create a newpinia store file for this, it filepath will be

frontend\src\stores\employeeStore.js