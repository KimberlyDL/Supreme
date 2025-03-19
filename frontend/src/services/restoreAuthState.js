// frontend\src\services\restoreAuthState.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@services/firebase';
import { useAuthStore } from '@stores/authStore';

const restoreAuthState = (router) => {
    const authStore = useAuthStore();

    return new Promise((resolve, reject) => {

        // Set a timeout to prevent hanging indefinitely
        const timeoutId = setTimeout(() => {
            reject(new Error("Auth state restoration timed out"))
        }, 10000) // 10 seconds timeout


        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            clearTimeout(timeoutId) // Clear the timeout
            unsubscribe() // Unsubscribe immediately to prevent multiple callbacks      

            try {
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();

                        const user = {
                            uid: userData.uid,
                            role: userData.role,
                            firstName: userData.profile.firstName,
                            lastName: userData.profile.lastName,
                            email: userData.email,
                            emailVerified: true,
                            isLoggedIn: true,
                        };

                        await authStore.setUser(user);

                        resolve(user);
                    } else {
                        // User document doesn't exist
                        authStore.isLoggedIn = false
                        reject(new Error("User document not found"))
                    }
                } else {
                    // authStore.isLoggedIn = false;
                    // reject("No user session found");
                    // // router.push({ name: 'Login' });

                    // No user is signed in
                    authStore.isLoggedIn = false
                    resolve(null) // Resolve with null to indicate no user
                }
            } catch (error) {
                console.error("Error in auth state restoration:", error)
                authStore.isLoggedIn = false
                reject(error)
            }

        });
    });
};

export { restoreAuthState };
