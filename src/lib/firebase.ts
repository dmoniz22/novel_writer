'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "sagaforge-472hm",
  "appId": "1:852838120377:web:d4fd26072d8b2ece639468",
  "storageBucket": "sagaforge-472hm.firebasestorage.app",
  "apiKey": "AIzaSyAdp4c5Mi4vKkZBAlL5Mw1yYW3OrI8L1Es",
  "authDomain": "sagaforge-472hm.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "852838120377"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
