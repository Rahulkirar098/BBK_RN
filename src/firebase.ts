import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// TODO: Replace this with your Firebase project configuration
// You can find this in the Firebase Console: Project Settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDUNwzZodNk9-I1lxfsyI902OcZNQe4s38',
  authDomain: 'bookbyseat-40f83.firebaseapp.com',
  projectId: 'bookbyseat-40f83',
  storageBucket: 'bookbyseat-40f83.firebasestorage.app',
  messagingSenderId: '1056023301980',
  appId: '1:1056023301980:web:5b52222222222222222222',
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
