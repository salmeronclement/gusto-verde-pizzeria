import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB7egLFCUxzu1QMjJBVdleT-YbO-G1L9w4",
    authDomain: "gusto-verde-auth.firebaseapp.com",
    projectId: "gusto-verde-auth",
    storageBucket: "gusto-verde-auth.firebasestorage.app",
    messagingSenderId: "1067575325797",
    appId: "1:1067575325797:web:c52b703376971a64b6428c",
    measurementId: "G-X75QWH0276"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
