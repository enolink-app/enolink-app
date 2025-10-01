import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
export interface IUserData {
    uid: string;
    name: string;
    email: string;
    birthDate?: string;
    language?: string;
    provider: "email" | "google" | "apple";
}

export const createUserInFirestore = async (userData: IUserData) => {
    try {
        if (!auth.currentUser) {
            throw new Error("Usuário não está autenticado");
        }

        if (auth.currentUser.uid !== userData.uid) {
            throw new Error("UID não corresponde ao usuário atual");
        }

        const userRef = doc(db, "users", userData.uid);

        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            console.log("✅ Usuário já existe no Firestore, atualizando dados...");

            const existingData = userDoc.data();

            const updateData: any = {
                name: userData.name || existingData.name,
                email: userData.email || existingData.email,
                updatedAt: serverTimestamp(),
            };

            if (userData.language) {
                updateData.language = userData.language;
            }
            if (userData.birthDate) {
                updateData.birthDate = userData.birthDate;
            }

            await setDoc(userRef, updateData, { merge: true });

            console.log("✅ Dados do usuário atualizados com sucesso");
            return { success: true, isNewUser: false };
        }

        console.log("📝 Criando novo usuário no Firestore...");

        const newUserData = {
            uid: userData.uid,
            name: userData.name,
            email: userData.email,
            provider: userData.provider,
            language: userData.language || "pt-BR",
            birthDate: userData.birthDate || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(userRef, newUserData);

        console.log("✅ Novo usuário criado no Firestore com sucesso");
        return { success: true, isNewUser: true };
    } catch (error: any) {
        console.error("❌ Erro ao salvar usuário no Firestore:", error);

        if (error?.code === "permission-denied") {
            console.error("Erro de permissão. Verifique as regras do Firestore.");
            throw new Error("Permissão negada para salvar dados do usuário");
        }

        if (error?.code === "unauthenticated") {
            console.error("Usuário não autenticado");
            throw new Error("Usuário não está autenticado");
        }

        throw error;
    }
};

export const getUserFromFirestore = async (uid: string) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== uid) {
            throw new Error("Usuário não autorizado");
        }

        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return { exists: true, data: userDoc.data() };
        } else {
            return { exists: false, data: null };
        }
    } catch (error) {
        console.error("Erro ao buscar usuário no Firestore:", error);
        throw error;
    }
};

export const ensureUserInFirestore = async (userData: IUserData) => {
    try {
        const userCheck = await getUserFromFirestore(userData.uid);

        if (userCheck.exists) {
            console.log("ℹ️ Usuário já existe, não é necessário criar");
            return { success: true, isNewUser: false, data: userCheck.data };
        }

        const result = await createUserInFirestore(userData);
        return result;
    } catch (error) {
        console.error("Erro ao garantir usuário no Firestore:", error);
        throw error;
    }
};
