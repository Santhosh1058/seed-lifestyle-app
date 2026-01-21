import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAfW2LPHB7_jiL1fOBMq8Nl5Hnse8Nmerk",
    authDomain: "sekhar-hybrid-seeds.firebaseapp.com",
    projectId: "sekhar-hybrid-seeds",
    storageBucket: "sekhar-hybrid-seeds.firebasestorage.app",
    messagingSenderId: "733533079263",
    appId: "1:733533079263:web:194a49da75fe7642af0b6a",
    measurementId: "G-3Y1N5LD0RJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
