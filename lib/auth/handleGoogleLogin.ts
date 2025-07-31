// lib/auth/handleGoogleLogin.ts
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const handleGoogleLogin = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            name: user.displayName ?? "Usuário Google",
            email: user.email,
            createdAt: new Date(),
        });
    }

    return user;
};
