import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Lazy initialization - only initialize when actually needed
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let initialized = false;

const initializeFirebase = () => {
    if (initialized) return;

    // Check if config has values
    const hasConfig = firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId;

    if (!hasConfig) {
        console.warn('Firebase config is empty. Environment variables may not be loaded.');
        // Mark as initialized to prevent repeated attempts
        initialized = true;
        return;
    }

    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
        initialized = true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        // Mark as initialized to prevent repeated attempts even on error
        initialized = true;
    }
};

// Export getter functions to ensure lazy initialization
export const getFirebaseApp = (): FirebaseApp => {
    if (!app) initializeFirebase();
    if (!app) throw new Error('Firebase app not initialized');
    return app;
};

export const getFirebaseAuth = (): Auth => {
    if (!auth) initializeFirebase();
    if (!auth) throw new Error('Firebase auth not initialized');
    return auth;
};

export const getFirebaseDb = (): Firestore => {
    if (!db) initializeFirebase();
    if (!db) throw new Error('Firebase db not initialized');
    return db;
};

export const getGoogleProvider = (): GoogleAuthProvider => {
    if (!googleProvider) initializeFirebase();
    if (!googleProvider) throw new Error('Firebase googleProvider not initialized');
    return googleProvider;
};

// For backward compatibility
export const getFirebaseConfig = () => firebaseConfig;
