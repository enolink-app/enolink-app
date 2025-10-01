import { storage } from "@/lib/firebase";
import { Platform } from "react-native";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as FileSystem from "expo-file-system";

export const uploadEventImage = async (uri: string, userId: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const timestamp = Date.now();
    const fileName = `events/${userId}_${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);

    const metadata = {
        contentType: "image/jpeg",
        customMetadata: {
            uploadedBy: userId,
            platform: Platform.OS,
        },
    };

    await uploadBytes(storageRef, blob, metadata);

    return getDownloadURL(storageRef);
};
export const validateImageForUpload = async (uri: string): Promise<boolean> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if (!fileInfo.exists) {
            console.error("Arquivo não existe");
            return false;
        }

        if (fileInfo.size > 5 * 1024 * 1024) {
            console.error("Arquivo muito grande (>5MB)");
            return false;
        }

        const validExtensions = [".jpg", ".jpeg", ".png"];
        const fileExtension = uri.split(".").pop()?.toLowerCase();
        if (!fileExtension || !validExtensions.includes(`.${fileExtension}`)) {
            console.error("Formato de arquivo inválido");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Erro ao validar imagem:", error);
        return false;
    }
};
export const uploadImage = async (uri: string, path: string) => {
    try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error("Falha ao buscar a imagem");

        const blob = await response.blob();

        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error("Erro detalhado no upload:", error);
        throw error;
    }
};
