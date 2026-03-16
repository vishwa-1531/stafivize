import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB3nXqBWsSRkVOlpu-7s0oJxf_00JkQOXs",
  authDomain: "stafivize-97c33.firebaseapp.com",
  projectId: "stafivize-97c33",
  storageBucket: "stafivize-97c33.appspot.com", 
  messagingSenderId: "886142826082",
  appId: "1:886142826082:web:8395a1e8b1b9b26b3fc33b"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };