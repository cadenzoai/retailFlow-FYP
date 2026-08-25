import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDCJ9sVC9fHtY8Q6J853uwcpdhLOZO09-c",
  authDomain: "retailflow-3e224.firebaseapp.com",
  projectId: "retailflow-3e224",
  storageBucket: "retailflow-3e224.firebasestorage.app",
  messagingSenderId: "198566255315",
  appId: "1:198566255315:web:1b0637129c9a952a2f5226",
  measurementId: "G-E1V3BV7V4W"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

export { auth, db };
