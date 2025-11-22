import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDsGU44grPIHmoTN4Lv0RsaHnSiYnDhAqk",
    authDomain: "sketchit-f5079.firebaseapp.com",
    projectId: "sketchit-f5079",
    storageBucket: "sketchit-f5079.firebasestorage.app",
    messagingSenderId: "509869941676",
    appId: "1:509869941676:web:fabdd870e39a48091f9009"
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app);