// frontend\src\stores\branchStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { db, auth } from "@services/firebase";
import { getIdToken } from "firebase/auth";
import { useAuthStore } from "./authStore";
import { useToastStore } from "@/stores/toastStore";
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  doc,
  limit,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const toast = useToastStore();

export const useBranchStore = defineStore("branch", {
  state: () => ({
    branchData: {
      name: "",
      location: {
        street: "",
        barangay: "",
        municipality: "",
        province: "",
      },
      isActive: true,
    },
    fetchedbranches: [],
    unsubscribeBranchNames: null,
    unsubscribeBranches: null,
    fetchedBranchNames: [],
    authStore: useAuthStore(),
  }),
  actions: {
    // fetchBranchesRealtime() {
    //     try {
    //         const branchesRef = collection(db, 'branches');
    //         this.unsubscribeBranches = onSnapshot(branchesRef, (snapshot) => {
    //             this.fetchedBranches = snapshot.docs.map(doc => ({
    //                 id: doc.id,
    //                 ...doc.data()
    //             }));
    //             // console.log("Fetched branches:", this.fetchedBranches);
    //         });
    //     } catch (error) {
    //         console.error(error);
    //     }
    // },

    // stopListening() {
    //     if (this.unsubscribeBranches) {
    //         this.unsubscribeBranches();
    //         this.unsubscribeBranches = null;
    //         this.fetchedBranches = [];
    //     }

    //     if (this.unsubscribeBranchNames) {
    //         this.unsubscribeBranchNames();
    //         this.unsubscribeBranchNames = null;
    //         this.fetchedBranchNames = [];
    //     }
    // },

    // When you set up a Firestore listener using onSnapshot(), Firebase returns an unsubscribe function.
    fetchBranchNamesRealtime() {
      try {
        const branchesRef = collection(db, "branches");
        this.unsubscribeBranchNames = onSnapshot(branchesRef, (snapshot) => {
          this.fetchedBranchNames = snapshot.docs.map((doc) => doc.data().name);
        });
      } catch (error) {
        console.error(error);
      }
    },

    fetchBranchesRealtime() {
      try {
        const branchesRef = collection(db, "branches");
        this.unsubscribeBranches = onSnapshot(branchesRef, (snapshot) => {
          this.fetchedbranches = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Also update branch names
          this.fetchedBranchNames = this.fetchedbranches.map(
            (branch) => branch.name
          );
        });
        return this.fetchedbranches;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    // async setupRealtimeActiveBranches() {

    //     console.log('Hello');

    //     if (this.unsubscribeBranches) {
    //         this.unsubscribeBranches();
    //     }

    //     const q = query(
    //         collection(db, 'branches'),
    //         where('isActive', '==', true),  // ✅ Filtered at query level
    //         orderBy('name'),
    //         limit(10)
    //     );

    //     console.log('Hello2');
    //     try {
    //         // const branchesRef = collection(db, 'branches');
    //         this.unsubscribeBranches = onSnapshot(q, async (snapshot) => {

    //             for (const change of snapshot.docChanges()) {
    //                 const snapshotDoc = change.doc;  // Changed 'change.doc' to 'snapshotDoc.doc'
    //                 const branchData = snapshotDoc.data();
    //                 const branchId = snapshotDoc.id;

    //                 const updatedBranch = {
    //                     id: branchId,
    //                     ...branchData,
    //                 };

    //                 const index = this.fetchedbranches.findIndex(b => b.id === branchId);

    //                 if (change.type === 'added') {  // Changed 'change.type' to 'change.type'
    //                     if (index === -1) this.fetchedbranches.push(updatedBranch);
    //                 } else if (change.type === 'modified') {  // Changed 'change.type' to 'change.type'
    //                     if (index !== -1) this.fetchedbranches[index] = updatedBranch;
    //                 } else if (change.type === 'removed') {  // Changed 'change.type' to 'change.type'
    //                     if (index !== -1) this.fetchedbranches.splice(index, 1);
    //                 }
    //             }

    //             console.log("Fetched branches:", this.fetchedbranches);
    //             // Also update branch names
    //             this.fetchedBranchNames = this.fetchedbranches.map(branch => branch.name);
    //         });

    //         console.log("Fetched branches:", this.fetchedbranches);

    //         return this.fetchedbranches;

    //     } catch (error) {
    //         console.error("Error fetching branches:", error);
    //     }
    // },

    async setupRealtimeActiveBranches() {
      console.log("Setting up realtime active branches");

      // Clear previous listener if exists
      if (this.unsubscribeBranches) {
        this.unsubscribeBranches();
        this.unsubscribeBranches = null;
      }

      // Initialize arrays to avoid null references
      if (!this.fetchedbranches) this.fetchedbranches = [];
      if (!this.fetchedBranchNames) this.fetchedBranchNames = [];

      try {
        // Create query for active branches
        // const q = query(collection(db, "branches"))

        // , where("isActive", "==", true), orderBy("name"), limit(10)
        const branchesRef = collection(db, "branches");
        const q = query(
          branchesRef,
          where("isActive", "==", true),
          orderBy("isActive"),
          limit(10)
        );

        // console.log("Performing initial fetch of branches")
        const querySnapshot = await getDocs(q);

        // Process initial data
        this.fetchedbranches = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        this.fetchedBranchNames = this.fetchedbranches.map(
          (branch) => branch.name
        );
        // console.log(`Initial fetch complete: ${this.fetchedbranches.length} branches loaded`)

        // Now set up the real-time listener
        // console.log("Setting up snapshot listener")
        this.unsubscribeBranches = onSnapshot(
          q,
          (snapshot) => {
            // console.log(`Received snapshot with ${snapshot.docs.length} branches`)

            // Process document changes
            snapshot.docChanges().forEach((change) => {
              const doc = change.doc;
              const branchData = doc.data();
              const branchId = doc.id;

              const updatedBranch = {
                id: branchId,
                ...branchData,
              };

              const index = this.fetchedbranches.findIndex(
                (b) => b.id === branchId
              );

              if (change.type === "added") {
                if (index === -1) this.fetchedbranches.push(updatedBranch);
              } else if (change.type === "modified") {
                console.log("branch modified", updatedBranch);
                if (index !== -1) this.fetchedbranches[index] = updatedBranch;
              } else if (change.type === "removed") {
                if (index !== -1) this.fetchedbranches.splice(index, 1);
              }
            });

            // Also update branch names
            this.fetchedBranchNames = this.fetchedbranches.map(
              (branch) => branch.name
            );
            console.log(
              `Updated branches: ${this.fetchedbranches.length}, names: ${this.fetchedBranchNames.length}`
            );
          },
          (error) => {
            console.error("Error in branch snapshot listener:", error);
            this.error = error.message;
            this.loading = false;
          }
        );

        // // Set up snapshot listener
        // this.unsubscribeBranches = onSnapshot(
        //     q,
        //     (snapshot) => {
        //         console.log(`Received snapshot with ${snapshot.docs.length} branches`)

        //         // Process document changes
        //         snapshot.docChanges().forEach((change) => {
        //             const doc = change.doc
        //             const branchData = doc.data()
        //             const branchId = doc.id

        //             const updatedBranch = {
        //                 id: branchId,
        //                 ...branchData,
        //             }

        //             const index = this.fetchedbranches.findIndex((b) => b.id === branchId)

        //             if (change.type === "added") {
        //                 if (index === -1) this.fetchedbranches.push(updatedBranch)
        //             } else if (change.type === "modified") {
        //                 if (index !== -1) this.fetchedbranches[index] = updatedBranch
        //             } else if (change.type === "removed") {
        //                 if (index !== -1) this.fetchedbranches.splice(index, 1)
        //             }
        //         })

        //         // Also update branch names
        //         this.fetchedBranchNames = this.fetchedbranches.map((branch) => branch.name)
        //         console.log(`Updated branches: ${this.fetchedbranches.length}, names: ${this.fetchedBranchNames.length}`)
        //     },
        //     (error) => {
        //         console.error("Error in branch snapshot listener:", error)
        //     },
        // )

        console.log("Snapshot listener setup complete");
        return this.fetchedbranches;
      } catch (error) {
        console.error("Error setting up branch listener:", error);
        throw error;
      }
    },

    stopListening() {
      if (this.unsubscribeBranches) {
        this.unsubscribeBranches();
        this.unsubscribeBranches = null;

        if (this.unsubscribeBranchNames) {
          this.unsubscribeBranchNames();
          this.unsubscribeBranchNames = null;
        }

        if (this.fetchedbranches) {
          this.fetchedbranches = [];
        }

        if (this.fetchedBranchNames) {
          this.fetchedBranchNames = [];
        }
      }
    },

    //#region add
    async addBranch(branchData) {
      try {
        const idToken = await getIdToken(auth.currentUser);

        // Check if user is owner
        if (this.authStore.user.role !== "owner") {
          throw new Error("Only owners can create branches");
        }

        const payload = {
          name: branchData.name,
          location: branchData.location,
        };

        const response = await axios.post(`${apiUrl}branches`, payload, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        toast.addToast({
          type: "success",
          message: response.data?.message || "Branch successfully added",
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
            ? msg || "An unexpected error occurred. Please try again later."
            : "An unexpected error occurred. Please try again later.",
          duration: 3000,
        });
      }
    },

    async editBranch(branchId, branchData) {
      try {
        const idToken = await getIdToken(auth.currentUser);

        const payload = {
          name: branchData.name,
          location: branchData.location,
        };

        const response = await axios.put(
          `${apiUrl}branches/${branchId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        
        toast.addToast({
          type: "success",
          message: response.data?.message || "Branch successfully updated",
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
            ? msg || "An unexpected error occurred. Please try again later."
            : "An unexpected error occurred. Please try again later.",
          duration: 3000,
        });
      }
    },

    async toggleBranchStatus(branchId, currentStatus) {
      try {
        const idToken = await getIdToken(auth.currentUser);

        const payload = {
          isActive: !currentStatus,
        };

        const response = await axios.put(
          `${apiUrl}branches/${branchId}/toggle-status`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        toast.addToast({
          type: "success",
          message:
            response.data?.displayToUser? response.data?.message : "Branch status successfully updated",
          duration: 3000,
        });
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
            ? msg || "An unexpected error occurred. Please try again later."
            : "An unexpected error occurred. Please try again later.",
          duration: 3000,
        });
      }
    },

    async deleteBranch(branchId) {
      try {
        const idToken = await getIdToken(auth.currentUser);

        // Check if user is owner
        if (this.authStore.user.role !== "owner") {
          throw new Error("Only owners can delete branches");
        }

        const response = await axios.delete(`${apiUrl}branches/${branchId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        // Remove the branch from the local store
        this.fetchedbranches = this.fetchedbranches.filter(
          (branch) => branch.id !== branchId
        );

        toast.addToast({
          type: "success",
          message:
            response.data?.displayToUser? response.data?.message : "Operation successful",
          duration: 3000,
        });
      } catch (error) {
        console.log(error);
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;
  
        if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }
        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg || "An unexpected error occurred. Please try again later."
            : "An unexpected error occurred. Please try again later.",
          duration: 3000,
        });
      }
    },

    async handleUnauthorizedAction() {
      console.log("create handleUnauthorizedAction method");
      // this.error = "You're not authorized to perform this action.";
    },
  },
  persist: true,
});
