import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { FacebookAuthProvider } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyCo3EfagfW5zmwdSxQOazMAD8iyf4MF7-c",
    authDomain: "eternal-9f235.firebaseapp.com",
    projectId: "eternal-9f235",
    storageBucket: "eternal-9f235.firebasestorage.app",
    messagingSenderId: "745215048856",
    appId: "1:745215048856:web:5fccb5a6d3c5a45f4de4ed",
    measurementId: "G-31B5VZGPJG"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const facebookProvider = new FacebookAuthProvider();

export default app;