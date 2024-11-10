// frontend/src/stores/authFirebase.js
import router from '@/router'; 
import { defineStore } from 'pinia';
import { auth, db, sendPasswordResetEmail } from '@services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, getIdToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

    async forgotPassword(email) {
      try {
        sendPasswordResetEmail(auth, email)
      } catch (error) {
        throw new Error('Send email for password verification failed');
      }
    },

    async register(email, password, profileData) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        const userData = {
          uid: this.user.uid,
          email: this.user.email,
          role: "customer",
          isActive: true,
          profile: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            address: {
              street: profileData.address.street || "",
              barangay: profileData.address.barangay || "",
              municipality: profileData.address.municipality || "",
              province: profileData.address.province || "",
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
        };

        await setDoc(doc(db, 'users', this.user.uid), userData);

        // Log the user registration
        const idToken = await this.user.getIdToken();
        await axios.post(`${apiUrl}account/logRegistration`, userData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        // Create a notification for the new user registration
        await axios.post(`${apiUrl}account/createNotification`, {
          type: 'NEW_USER',
          message: `New user ${profileData.firstName} ${profileData.lastName} has registered.`,
        }, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
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

        this.uid = this.user.uid;
        this.emailVerified = this.user.emailVerified;

        const [userDoc, employeeDoc] = await Promise.all([
          getDoc(doc(db, 'users', this.user.uid)),
          getDoc(doc(db, 'employees', this.user.uid))
        ]);
    
        if (userDoc.exists()) {
          const userData = userDoc.data();
          Object.assign(this.user, {
            role: userData.role,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email
          });
          this.isLoggedIn = true;
        }
    
        if (employeeDoc.exists()) {
          const employeeData = employeeDoc.data();
          Object.assign(this.user, {
            role: employeeData.role,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email
          });
          this.isLoggedIn = true;
        }


        if (!this.emailVerified) {
          await sendEmailVerification(this.user);

          // const user = auth.currentUser;
          const idTokenResult = await this.user.getIdTokenResult(true);
  
          const token = idTokenResult.token;
          const claims = idTokenResult.claims;
          console.log('ID Token:', token);
          console.log('Custom Claims:', claims);

          if (!idTokenResult.claims.role) {
            
            const idToken = await auth.currentUser.getIdToken();
            const response = await axios.post(`${apiUrl}account/setUserClaim`, {
              role: this.user.role,
            }, {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });
            console.log(`This is the data: ${response.data}`);
          };

          await signOut(auth);

          console.log('Email verification');

          //make notif - "Please verify your email. A verification email has been sent."
          throw new Error("Unverified");
        }
      } catch (error) {
        console.error('Login error:', error.message);
        throw error;
      }
    },

    async logout() {
      // try {
      //   await signOut(auth);
      //   this.user = null;
      // } catch (error) {
      //   console.error('Logout error:', error.message);
      // }

      try {
        await signOut(auth);
        
        this.$reset();
    
        localStorage.removeItem('auth');
        localStorage.removeItem('employee');
        localStorage.removeItem('auth');
        localStorage.removeItem('branch');
        localStorage.removeItem('lastVisitedRoute');
    
        console.log('User successfully logged out and state cleared.');
        router.push({ name: 'Home' });
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
            municipality: newUserData.municipality,
            province: newUserData.province,
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
  persist: true
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
