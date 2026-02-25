"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider, getFirebaseDb } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    // Signup State
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Password strength validation
        if (signupPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        // Check for password complexity (at least one letter and one number)
        const hasLetter = /[a-zA-Z]/.test(signupPassword);
        const hasNumber = /[0-9]/.test(signupPassword);
        if (!hasLetter || !hasNumber) {
            setError("Password must contain at least one letter and one number.");
            return;
        }

        try {
            const auth = getFirebaseAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
            await updateProfile(userCredential.user, { displayName: signupName });

            const db = getFirebaseDb();
            await setDoc(doc(db, "users", userCredential.user.uid), {
                name: signupName,
                email: signupEmail,
                createdAt: new Date().toISOString()
            });
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Registration failed. Try again.");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const auth = getFirebaseAuth();
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Failed to login. Please check your credentials.");
        }
    };

    const handleGoogleAuth = async () => {
        setError("");
        try {
            const auth = getFirebaseAuth();
            const googleProvider = getGoogleProvider();
            const db = getFirebaseDb();

            const result = await signInWithPopup(auth, googleProvider);
            const userDocRef = doc(db, "users", result.user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    name: result.user.displayName,
                    email: result.user.email,
                    createdAt: new Date().toISOString()
                });
            }
            router.push("/");
        } catch (err: any) {
            // Handle popup closed by user - this is not an error, just ignore it
            if (err.code === 'auth/popup-closed-by-user') {
                return; // User closed the popup, do nothing
            }
            setError(err.message || "Google Authentication failed.");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center relative overflow-hidden">
            {/* Outer glassmorphism container */}
            <div className="w-[360px] h-[550px] relative overflow-hidden bg-background-dark/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-xl shrink-0">
                <input type="checkbox" id="chk" className="hidden peer" />

                {/* Error Message Floating */}
                {error && (
                    <div className="absolute top-4 left-4 right-4 z-50 p-3 text-xs text-center text-white font-medium bg-red-500/90 rounded-xl backdrop-blur-md shadow-lg border border-red-400/50">
                        {error}
                    </div>
                )}

                {/* SIGNUP Base */}
                <div className="w-full h-full relative z-0 flex flex-col pt-[12%] peer-checked:[&_label]:scale-75 peer-checked:[&_label]:text-slate-400 peer-checked:[&_label]:-translate-y-2 transition-all duration-700">
                    <form onSubmit={handleRegister} className="flex flex-col w-full h-full">
                        <label htmlFor="chk" className="text-white text-[2.2em] font-bold tracking-tight flex justify-center mb-6 cursor-pointer transition-all duration-500 origin-center hover:text-primary scale-100">
                            Sign up
                        </label>
                        <input type="text" placeholder="Full Name" required value={signupName} onChange={e => setSignupName(e.target.value)}
                            className="w-[82%] h-[45px] bg-white/5 border border-white/10 text-white font-medium flex mx-auto mb-4 px-4 rounded-xl focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all text-sm outline-none backdrop-blur-sm shadow-inner" />

                        <input type="email" placeholder="Email Address" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                            className="w-[82%] h-[45px] bg-white/5 border border-white/10 text-white font-medium flex mx-auto mb-4 px-4 rounded-xl focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all text-sm outline-none backdrop-blur-sm shadow-inner" />

                        <input type="password" placeholder="Password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                            className="w-[82%] h-[45px] bg-white/5 border border-white/10 text-white font-medium flex mx-auto mb-5 px-4 rounded-xl focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all text-sm outline-none backdrop-blur-sm shadow-inner" />

                        <button type="submit" className="w-[82%] h-[45px] mx-auto flex justify-center items-center text-white bg-primary hover:bg-primary/90 font-bold mt-1 rounded-xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(140,37,244,0.3)] hover:shadow-[0_6px_20px_rgba(140,37,244,0.5)] hover:-translate-y-0.5 active:translate-y-0 text-sm">
                            Create Account
                        </button>

                        <button onClick={handleGoogleAuth} type="button" className="w-[82%] h-[45px] mx-auto mt-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm">Sign up with Google</span>
                        </button>
                    </form>
                </div>

                {/* LOGIN Sliding Overlay */}
                <div style={{ borderRadius: "50% 50% 10% 10% / 10% 10% 0% 0%" }} className="w-full h-[600px] bg-slate-50 absolute top-0 z-10 translate-y-[450px] peer-checked:translate-y-[100px] transition-transform duration-[800ms] ease-in-out shadow-[0_-10px_40px_rgba(0,0,0,0.15)]
                 [&_label]:scale-75 [&_label]:text-slate-500 peer-checked:[&_label]:scale-100 peer-checked:[&_label]:text-slate-900 flex flex-col pt-8">

                    <form onSubmit={handleLogin} className="flex flex-col w-full h-full">
                        <label htmlFor="chk" className="text-[2.2em] font-bold tracking-tight flex justify-center mb-8 cursor-pointer transition-all duration-500 origin-center hover:text-slate-700">
                            Log in
                        </label>

                        <input type="email" placeholder="Email Address" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                            className="w-[82%] h-[45px] bg-white text-slate-900 font-medium flex mx-auto mb-4 px-4 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all text-sm outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />

                        <input type="password" placeholder="Password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                            className="w-[82%] h-[45px] bg-white text-slate-900 font-medium flex mx-auto mb-5 px-4 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all text-sm outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />

                        <button type="submit" className="w-[82%] h-[45px] mx-auto flex justify-center items-center text-white bg-slate-900 hover:bg-slate-800 font-bold mt-1 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-sm">
                            Continue
                        </button>

                        <button onClick={handleGoogleAuth} type="button" className="w-[82%] h-[45px] mx-auto mt-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm">Log in with Google</span>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
