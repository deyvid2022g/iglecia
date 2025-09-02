
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AppError } from '../lib/errors';

// Interfaces para mantener la consistencia con el resto de la aplicación
export interface Profile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    role: 'admin' | 'pastor' | 'editor' | 'member';
    join_date: any; // Se usará un timestamp de Firebase
    last_login?: any;
    is_active: boolean;
    bio?: string;
    created_at: any;
    updated_at: any;
}

export interface AuthState {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    error: string | null;
}

export interface AuthActions {
    signIn: (email: string, password: string) => Promise<{ error: AppError | null }>;
    signUp: (email: string, password: string, userData: { name: string; phone?: string }) => Promise<{ error: AppError | null }>;
    signOut: () => Promise<{ error: AppError | null }>;
    resetPassword: (email: string) => Promise<{ error: AppError | null }>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: AppError | null }>;
}

export const useFirebaseAuth = (): AuthState & AuthActions => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setUser(user);
                const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
                if (profileDoc.exists()) {
                    setProfile(profileDoc.data() as Profile);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { error: null };
        } catch (err: any) {
            const appError = new AppError('Error al iniciar sesión', 500, true, { action: 'signIn', originalError: err });
            setError(appError.message);
            return { error: appError };
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, userData: { name: string; phone?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            if (newUser) {
                const newProfile: Profile = {
                    id: newUser.uid,
                    name: userData.name,
                    email: newUser.email || '',
                    phone: userData.phone,
                    role: 'member',
                    is_active: true,
                    join_date: serverTimestamp(),
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                };
                await setDoc(doc(db, 'profiles', newUser.uid), newProfile);
                setProfile(newProfile);
            }
            return { error: null };
        } catch (err: any) {
            const appError = new AppError('Error al registrar usuario', 500, true, { action: 'signUp', originalError: err });
            setError(appError.message);
            return { error: appError };
        } finally {
            setLoading(false);
        }
    };

    const signOutAction = async () => {
        setLoading(true);
        setError(null);
        try {
            await signOut(auth);
            return { error: null };
        } catch (err: any) {
            const appError = new AppError('Error al cerrar sesión', 500, true, { action: 'signOut', originalError: err });
            setError(appError.message);
            return { error: appError };
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
            return { error: null };
        } catch (err: any) {
            const appError = new AppError('Error al enviar email de recuperación', 500, true, { action: 'resetPassword', originalError: err });
            setError(appError.message);
            return { error: appError };
        }
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        setError(null);
        if (!user) {
            const appError = new AppError('Usuario no autenticado', 401, true, { action: 'updateProfile' });
            setError(appError.message);
            return { error: appError };
        }
        try {
            const profileRef = doc(db, 'profiles', user.uid);
            await setDoc(profileRef, { ...updates, updated_at: serverTimestamp() }, { merge: true });
            const updatedProfileDoc = await getDoc(profileRef);
            if (updatedProfileDoc.exists()) {
                setProfile(updatedProfileDoc.data() as Profile);
            }
            return { error: null };
        } catch (err: any) {
            const appError = new AppError('Error al actualizar perfil', 500, true, { action: 'updateProfile', originalError: err });
            setError(appError.message);
            return { error: appError };
        }
    };

    return {
        user,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signOut: signOutAction,
        resetPassword,
        updateProfile,
    };
};
