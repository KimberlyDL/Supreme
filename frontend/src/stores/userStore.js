// frontend\src\stores\userStore.js
import { defineStore } from "pinia";
// import {
//   doc,
//   getDoc,
//   collection,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
import axios from "axios";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { db, auth, storage } from "@/services/firebase";
import { getIdToken } from "firebase/auth";
import { useToastStore } from "@/stores/toastStore";
const toast = useToastStore();

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,

    // currentUser: null,
    // currentBranchId: "All",
    // branches: [],

    loading: false,
    error: null,
  }),

  getters: {
    // isAuthenticated: (state) => !!state.currentUser,
    // userRole: (state) => state.currentUser?.role || "guest",
    // isAdmin: (state) =>
    //   state.currentUser?.role === "owner" ||
    //   state.currentUser?.role === "manager",
    // canManageInventory: (state) =>
    //   ["owner", "manager", "inventory_manager", "stock_manager"].includes(
    //     state.currentUser?.role
    //   ),
    // canEditProducts: (state) =>
    //   ["owner", "manager", "inventory_manager"].includes(
    //     state.currentUser?.role
    //   ),
    // canDeleteProducts: (state) =>
    //   ["owner", "manager"].includes(state.currentUser?.role),
    // userBranch: (state) => {
    //   if (!state.currentUser?.branchId) return null;
    //   return state.branches.find(
    //     (branch) => branch.id === state.currentUser.branchId
    //   );
    // },
    // availableBranches: (state) => {
    //   // Owner and manager can see all branches
    //   if (
    //     state.currentUser?.role === "owner" ||
    //     state.currentUser?.role === "manager"
    //   ) {
    //     return [{ id: "All", name: "All Branches" }, ...state.branches];
    //   }

    //   // Branch-specific roles can only see their branch
    //   if (state.currentUser?.branchId) {
    //     const userBranch = state.branches.find(
    //       (branch) => branch.id === state.currentUser.branchId
    //     );
    //     return userBranch ? [userBranch] : [];
    //   }

    //   return [];
    // },

    isAuthenticated: (state) => !!state.user,
    userProfile: (state) => state.user?.profile || {},
    userNotifications: (state) => state.user?.notifications || {},
  },

  actions: {
    // async fetchUserData() {
    //   this.loading = true;
    //   try {
    //     const user = auth.currentUser;

    //     if (!user) {
    //       this.currentUser = null;
    //       return;
    //     }

    //     // Get user data from Firestore
    //     const userDoc = await getDoc(doc(db, "employees", user.uid));

    //     if (userDoc.exists()) {
    //       const userData = userDoc.data();
    //       this.currentUser = {
    //         id: user.uid,
    //         email: user.email,
    //         displayName:
    //           user.displayName || `${userData.firstName} ${userData.lastName}`,
    //         role: userData.role || "employee",
    //         branchId: userData.branchId || null,
    //         branchName: userData.branchName || null,
    //         ...userData,
    //       };

    //       // Set current branch based on user role
    //       if (
    //         this.currentUser.role === "owner" ||
    //         this.currentUser.role === "manager"
    //       ) {
    //         this.currentBranchId = "All";
    //       } else if (this.currentUser.branchId) {
    //         this.currentBranchId = this.currentUser.branchId;
    //       }
    //     } else {
    //       this.currentUser = {
    //         id: user.uid,
    //         email: user.email,
    //         displayName: user.displayName || user.email,
    //         role: "guest",
    //       };
    //     }
    //   } catch (error) {
    //     console.error("Error fetching user data:", error);
    //     this.error = error.message;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    // async fetchBranches() {
    //   this.loading = true;
    //   try {
    //     const branchesSnapshot = await getDocs(collection(db, "branches"));
    //     this.branches = branchesSnapshot.docs.map((doc) => ({
    //       id: doc.id,
    //       ...doc.data(),
    //     }));
    //   } catch (error) {
    //     console.error("Error fetching branches:", error);
    //     this.error = error.message;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    // setCurrentBranch(branchId) {
    //   // Check if user has permission to switch branches
    //   if (
    //     this.currentUser?.role === "owner" ||
    //     this.currentUser?.role === "manager"
    //   ) {
    //     this.currentBranchId = branchId;
    //   } else if (branchId === this.currentUser?.branchId) {
    //     this.currentBranchId = branchId;
    //   } else {
    //     console.error("User does not have permission to switch to this branch");
    //   }
    // },

    // clearUser() {
    //   this.currentUser = null;
    //   this.currentBranchId = "All";
    // },

    //#region Settings New

    async getImageUrl(imageUrlPath) {
      let image = null;
      if (imageUrlPath) {
        image = await getDownloadURL(storageRef(storage, imageUrlPath));
      }

      return image;
    },

    async fetchUserProfile() {
      this.loading = true;
      try {
        const idToken = await getIdToken(auth.currentUser);

        const response = await axios.get(`${API_BASE_URL}user/profile`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        this.user = response.data.user;

        if (
          this.user?.profile?.avatarUrl &&
          (this.user?.profile?.avatarUrl ||
            !this.user?.profile?.avatarUrl !== "")
        ) {
          this.user.profile.imageUrl =
            (await this.getImageUrl(this.user.profile.avatarUrl)) || null;
        }
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg || "An unexpected error occured. Please try again later."
            : "An unexpected error occured. Please try again later.",
          duration: 3000,
        });
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(profileData) {
      this.loading = true;
      try {
        const idToken = await getIdToken(auth.currentUser);
        const formData = new FormData();

        // Add profile data
        formData.append("firstName", profileData.firstName);
        formData.append("lastName", profileData.lastName);
        if (profileData.number && profileData.number.trim() !== "") {
          formData.append("number", profileData.number);
        }

        if (
          profileData.address &&
          typeof profileData.address === "object" &&
          Object.values(profileData.address).some(
            (value) => typeof value === "string" && value.trim() !== ""
          )
        ) {
          formData.append("address", JSON.stringify(profileData.address));
        }

        if (profileData.avatarFile) {
          formData.append("avatar", profileData.avatarFile);
        }

        const response = await axios.put(
          `${API_BASE_URL}user/profile`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.user = response.data.user;
        toast.addToast({
          type: "success",
          message: response.data?.message || "Profile successfully updated",
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 400) {
          const error = new Error(
            displayToUser
              ? msg || "Some required fields are missing."
              : "Some required fields are missing."
          );
          error.formError = true;
          throw error;
        } else if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg || "Failed to update user profile. Please try again later."
            : "Failed to update user profile. Please try again later.",
          duration: 3000,
        });
      } finally {
        this.loading = false;
      }
    },

    async updateNotificationSettings(settings) {
      this.loading = true;
      try {
        const response = await axios.put(
          `${API_BASE_URL}user/notifications`,
          settings,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        this.user.notifications = response.data.notifications;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Failed to update notification settings";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async changePassword(passwordData) {
      this.loading = true;
      try {
        await axios.put(`${API_BASE_URL}user/password`, passwordData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to change password";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deactivateAccount(password) {
      this.loading = true;
      try {
        const response = await axios.put(
          `${API_BASE_URL}user/deactivate`,
          { password },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        this.user.isActive = false;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to deactivate account";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },

  //#endregion Settings New End

  persist: true,
});
