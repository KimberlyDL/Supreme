// frontend\src\stores\userStore.js
import { defineStore } from 'pinia';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    currentBranchId: 'All',
    branches: [],
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    userRole: (state) => state.currentUser?.role || 'guest',
    isAdmin: (state) => state.currentUser?.role === 'owner' || state.currentUser?.role === 'manager',
    canManageInventory: (state) => ['owner', 'manager', 'inventory_manager', 'stock_manager'].includes(state.currentUser?.role),
    canEditProducts: (state) => ['owner', 'manager', 'inventory_manager'].includes(state.currentUser?.role),
    canDeleteProducts: (state) => ['owner', 'manager'].includes(state.currentUser?.role),
    userBranch: (state) => {
      if (!state.currentUser?.branchId) return null;
      return state.branches.find(branch => branch.id === state.currentUser.branchId);
    },
    availableBranches: (state) => {
      // Owner and manager can see all branches
      if (state.currentUser?.role === 'owner' || state.currentUser?.role === 'manager') {
        return [{ id: 'All', name: 'All Branches' }, ...state.branches];
      }
      
      // Branch-specific roles can only see their branch
      if (state.currentUser?.branchId) {
        const userBranch = state.branches.find(branch => branch.id === state.currentUser.branchId);
        return userBranch ? [userBranch] : [];
      }
      
      return [];
    }
  },
  
  actions: {
    async fetchUserData() {
      this.loading = true;
      try {
        const user = auth.currentUser;
        
        if (!user) {
          this.currentUser = null;
          return;
        }
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'employees', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.currentUser = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || `${userData.firstName} ${userData.lastName}`,
            role: userData.role || 'employee',
            branchId: userData.branchId || null,
            branchName: userData.branchName || null,
            ...userData
          };
          
          // Set current branch based on user role
          if (this.currentUser.role === 'owner' || this.currentUser.role === 'manager') {
            this.currentBranchId = 'All';
          } else if (this.currentUser.branchId) {
            this.currentBranchId = this.currentUser.branchId;
          }
        } else {
          this.currentUser = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || user.email,
            role: 'guest'
          };
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchBranches() {
      this.loading = true;
      try {
        const branchesSnapshot = await getDocs(collection(db, 'branches'));
        this.branches = branchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching branches:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    setCurrentBranch(branchId) {
      // Check if user has permission to switch branches
      if (this.currentUser?.role === 'owner' || this.currentUser?.role === 'manager') {
        this.currentBranchId = branchId;
      } else if (branchId === this.currentUser?.branchId) {
        this.currentBranchId = branchId;
      } else {
        console.error('User does not have permission to switch to this branch');
      }
    },
    
    clearUser() {
      this.currentUser = null;
      this.currentBranchId = 'All';
    }
  },
  
  persist: true
});