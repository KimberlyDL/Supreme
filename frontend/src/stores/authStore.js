// frontend/src/stores/authFirebase.js
import router from '@/router';
import { defineStore } from 'pinia';
import { auth, db, sendPasswordResetEmail } from '@services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import { useBranchStore } from '@/stores/branchStore';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {
      uid: '',
      role: null,
      branch: null,
      firstName: '',
      lastName: '',
      email: '',
      emailVerified: false,
    },
    isLoggedIn: false,
    isInitializing: true, // Add this new state property
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

    async registerManager(email = '', ps = 'kimengg01') {
      // this.register(email, ps);

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        const userData = {
          ...this.user,
        }

        const response = await axios.post(`${apiUrl}account/register-manager`,
          { userData: userData });

        if (response.data.success) {
          return true;
        }

      } catch (error) {
        console.error('Registration error:', error.message);

        if (error.code === 'auth/email-already-in-use') {
          throw new Error('EmailAlreadyInUse');
        }

        const err = error.response?.data?.message;

        if (err && err === "Registration failed") {
          throw new Error('Failed');
        }
      };
    },

    async register(email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        const userData = {
          ...this.user,
        }

        const response = await axios.post(`${apiUrl}account/register-user`,
          { userData: userData });

        if (response.data.success) {
          return true;
        }

      } catch (error) {
        console.error('Registration error:', error.message);

        if (error.code === 'auth/email-already-in-use') {
          throw new Error('EmailAlreadyInUse');
        }

        const err = error.response?.data?.message;

        if (err && err === "Registration failed") {
          throw new Error('Failed');
        }
      }
    },

    // #region Employee-related
    async registerEmp({ email, password, role, branch }) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        const userData = {
          ...this.user,
          role,
          branch
        }

        const response = await axios.post(`${apiUrl}account/register-employee`,
          { userData: userData });

        if (response.data.success) {
          return true;
        }

      } catch (error) {
        console.error('Registration error:', error.message);

        if (error.code === 'auth/email-already-in-use') {
          throw new Error('EmailAlreadyInUse');
        }

        const err = error.response?.data?.message;

        if (err && err === "Registration failed") {
          throw new Error('Failed');
        }
      }
    },
    // #endregion

    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        this.uid = this.user.uid;
        this.emailVerified = this.user.emailVerified;

        if (!this.emailVerified) {
          await sendEmailVerification(this.user);

          // #region datingcode
          // const user = auth.currentUser;
          // const idTokenResult = await this.user.getIdTokenResult(true);

          // const token = idTokenResult.token;
          // const claims = idTokenResult.claims;
          // console.log('ID Token:', token);
          // console.log('Custom Claims:', claims);



          // // setup activated user 
          // if (!idTokenResult.claims.role || !('branchName' in idTokenResult.claims)) {

          //   const idToken = await auth.currentUser.getIdToken();
          //   // const response = await axios.post(`${apiUrl}account/setup-userUserClaim`, {
          //   const response = await axios.post(`${apiUrl}account/setup-user`, {
          //   }, {
          //     headers: {
          //       Authorization: `Bearer ${idToken}`,
          //     },
          //   });

          //   console.log(`This is the data: ${response.data}`);

          // };

          // #endregion

          // const idTokenResultAgain = await this.user.getIdTokenResult(true);

          // const token = idTokenResultAgain.token;
          // const claims = idTokenResultAgain.claims;
          // console.log('ID Token:', token);
          // console.log('Custom Claims:', claims);

          await signOut(auth);

          console.log('Email verification');
          //make notif - "Please verify your email. A verification email has been sent."
          throw new Error("Unverified");
        }

        // true is for getting a new token (refreshed token)
        const idTokenResult = await this.user.getIdTokenResult(true);
        // const token = idTokenResult.token;
        // const claims = idTokenResult.claims;
        // console.log('ID Token:', token);
        // console.log('Custom Claims:', claims);


        // setup activated user 
        if (!idTokenResult.claims.role) {
          const idToken = await auth.currentUser.getIdToken();

          // #region axiosv2
          // await axios
          //   .post(`${apiUrl}account/setup-user`, {}, {
          //     headers: {
          //       Authorization: `Bearer ${idToken}`,
          //     },
          //   })
          //   .then((response) => {
          //   })
          //   .catch((error) => {
          //     console.error("Error:", error.message || error.response?.data);
          //     throw new Error("Setup failed");
          //   });
          // #endregion

          try {
            const response = await axios.post(`${apiUrl}account/setup-user`, {}, {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });

            if (response) {
              const idToken = await this.user.getIdTokenResult(true);

              // debugging only
              const tokenn = idToken.token;
              const claimss = idToken.claims;
              console.log('ID Tokenn:', tokenn);
              console.log('Custom Claimss:', claimss);
            }
          }
          catch (error) {
            console.error("Error:", error.message || error.response?.data);
            throw new Error("Setup failed");
          }
        }

        const userDoc = await getDoc(doc(db, 'users', this.user.uid));
        // const [userDoc] = await Promise(getDoc(doc(db, 'users', this.user.uid)));

        console.log("USER DATA FROM LOGIN: ", userDoc);

        // iba ang schema ng customer user
        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData.role !== "client") {
            Object.assign(this.user, {
              uid: userData.uid,
              role: userData.role,
              branch: userData.branch,
              email: userData.email
            });
            if (userData.role === "assistant manager") {
              router.push({ name: 'AssistantDashboard' });
            }
            else if (userData.role === "helper") {
              router.push({ name: 'HelperDashboard' });
            }
            else if (userData.role === "owner") {
              router.push({ name: 'AdminDashboard' });
            }
          }
          else {
            Object.assign(this.user, {
              uid: userData.uid,
              role: userData.role,
              email: userData.email
            });
            router.push({ name: 'Home' });
          }
          this.isLoggedIn = true;
        }
        else {
          throw Error('Invalid Login');
        }

        // #region Old user collection setup, multiple collections, separate users
        // const [userDoc, employeeDoc, adminDoc] = await Promise.all([
        //   getDoc(doc(db, 'users', this.user.uid)),
        //   getDoc(doc(db, 'employees', this.user.uid)),
        //   getDoc(doc(db, 'admin', this.user.uid))
        // ]);

        // console.log("USER DATA FROM LOGIN: ", userDoc, employeeDoc, adminDoc);

        // // iba ang schema ng customer user
        // if (userDoc.exists()) {
        //   const userData = userDoc.data();
        //   Object.assign(this.user, {
        //     role: userData.role,
        //     // firstName: userData.profile.firstName,
        //     // lastName: userData.profile.lastName,
        //     email: userData.email
        //   });
        //   this.isLoggedIn = true;
        // }
        // else if (employeeDoc.exists()) {
        //   const employeeData = employeeDoc.data();
        //   Object.assign(this.user, {
        //     role: employeeData.role,
        //     // firstName: employeeData.firstName,
        //     // lastName: employeeData.lastName,
        //     email: employeeData.email
        //   });
        //   branchName = employeeData.branchName;
        //   this.isLoggedIn = true;
        // }
        // else if (employeeDoc.exists()) {
        //   const employeeData = employeeDoc.data();
        //   Object.assign(this.user, {
        //     role: employeeData.role,
        //     // firstName: employeeData.firstName,
        //     // lastName: employeeData.lastName,
        //     email: employeeData.email
        //   });
        //   branchName = employeeData.branchName;
        //   this.isLoggedIn = true;
        // }
        // else {
        //   throw Error('Invalid Login');
        // }
        // #endregion

      } catch (error) {
        console.error('Login error:', error.message);
        throw error;
      }
    },

    async logout() {
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
