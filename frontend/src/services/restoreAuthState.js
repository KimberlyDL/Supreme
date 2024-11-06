// frontend\src\services\restoreAuthState.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@services/firebase';
import { useAuthStore } from '@stores/authStore';

const restoreAuthState = (router) => {
    const authStore = useAuthStore();

    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
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
                }
            } else {
                authStore.isLoggedIn = false;
                reject("No user session found");
                // router.push({ name: 'Login' });
            }
        });
    });
};

export { restoreAuthState };
