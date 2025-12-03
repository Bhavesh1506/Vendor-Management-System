import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjKMcbpWgX5w4ZETT9cwPj9KoVFpa94Kg",
  authDomain: "vendor-management-system-f6278.firebaseapp.com",
  projectId: "vendor-management-system-f6278",
  storageBucket: "vendor-management-system-f6278.firebasestorage.app",
  messagingSenderId: "262018724130",
  appId: "1:262018724130:web:746b33d9a2923ebd8c757b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Production mode - emulators disabled
// If you want to use emulators locally, uncomment the lines below:
// import { connectAuthEmulator } from 'firebase/auth';
// import { connectFirestoreEmulator } from 'firebase/firestore';
// import { connectFunctionsEmulator } from 'firebase/functions';
// connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
// connectFirestoreEmulator(db, "localhost", 8080);
// connectFunctionsEmulator(functions, "localhost", 5001);
