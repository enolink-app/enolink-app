import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
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
        // Verifica se o usuário está autenticado
        if (!auth.currentUser) {
            throw new Error("Usuário não está autenticado");
        }

        // Verifica se o UID corresponde ao usuário atual
        if (auth.currentUser.uid !== userData.uid) {
            throw new Error("UID não corresponde ao usuário atual");
        }

        const userRef = doc(db, "users", userData.uid);

        // Verifica se o documento já existe
        const userDoc = await getDoc(userRef);

        const userDataToSave = {
            ...userData,
            createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Usa merge: true para atualizar campos existentes ou criar novo documento
        await setDoc(userRef, userDataToSave, { merge: true });

        console.log("✅ Usuário salvo/atualizado no Firestore com sucesso");
        return { success: true };
    } catch (error) {
        console.error("❌ Erro ao salvar usuário no Firestore:", error);

        // Tratamento específico de erros
        if (error?.code == "permission-denied") {
            console.error("Erro de permissão. Verifique as regras do Firestore.");
            throw new Error("Permissão negada para salvar dados do usuário");
        }

        if (error?.code == "unauthenticated") {
            console.error("Usuário não autenticado");
            throw new Error("Usuário não está autenticado");
        }

        throw error;
    }
};

// Função auxiliar para verificar se o usuário existe no Firestore
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
