// src/stores/inventoryStore.js
import { defineStore } from 'pinia';
import { computed } from 'vue';
import { db } from '@/services/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useBranchStore } from '@/stores/branchStore';
import { useProductStore } from '@/stores/productStore';
import axios from 'axios';
import { getFreshToken } from '@/services/authService';