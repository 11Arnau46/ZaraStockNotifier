import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDQv1Xoxw4__iczcvAVOixdOCN8y849DW0",
    authDomain: "zaratracker-db616.firebaseapp.com",
    projectId: "zaratracker-db616",
    storageBucket: "zaratracker-db616.firebasestorage.app",
    messagingSenderId: "539211494492",
    appId: "1:539211494492:web:436d7407ea67aab1dda299",
    measurementId: "G-5WKGGRFFSE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };