// lib/auth/registerUser.ts
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const registerUser = async ({ email, password, name, birthDate, language }: { email: string; password: string; name: string; birthDate: string; language: string }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
        name,
        email,
        birthDate,
        language,
        createdAt: new Date(),
    });

    return userCredential.user;
};
