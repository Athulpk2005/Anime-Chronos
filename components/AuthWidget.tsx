"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";
import Link from "next/link";
import Image from "next/image";

export default function AuthWidget() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [firebaseReady, setFirebaseReady] = useState(false);

    useEffect(() => {
        try {
            const auth = getFirebaseAuth();
            if (!auth) {
                console.warn('Firebase auth not available');
                setLoading(false);
                return;
            }
            setFirebaseReady(true);
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error('Firebase auth error:', error);
            setLoading(false);
        }
    }, []);

    const handleLogout = async () => {
        try {
            const auth = getFirebaseAuth();
            if (auth) {
                await signOut(auth);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return <div className="w-20 h-10 animate-pulse bg-white/10 rounded-xl ml-4"></div>;
    }

    if (user) {
        return (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white leading-none">{user.displayName || "Otaku"}</p>
                    <button onClick={handleLogout} className="text-[10px] text-red-400 font-medium uppercase tracking-wider hover:underline mt-1 cursor-pointer">Logout</button>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-primary p-0.5 relative overflow-hidden shrink-0">
                    <Image fill src={user.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuAFIiEHUnGmUPpTIn1tn5N-mOg-dhRw2Z5oaxSp_qpTIYjvgGD24LY2Ork62ef4gDOHxxIWJGfRH-OPxu1Q0hiVt1D5pWbILMY__0NdIO7uJUNY52gRT073V45vxUD2iCCl51M2CX85V55Yl2sp2RmYuBvjHRrhynjtOuuf9zib3LOQGEL4Xg85NxyL_nAliKvhyWFnqWvgkqmN1oEeg5N-_1qRQuC24cAD7atcopuIkHP4o-eubhOO1t5X0DNX8yX1xUQelSLfrL9h"} alt="User Profile" className="rounded-full bg-slate-800 object-cover" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">Log In</Link>
            <Link href="/login" className="px-5 py-2 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl transition-all shadow-lg shadow-primary/20">Sign Up</Link>
        </div>
    );
}
