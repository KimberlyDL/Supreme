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
