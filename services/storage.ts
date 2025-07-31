// services/storage.ts
import { storage } from "@/lib/firebase";
import { Platform } from "react-native";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as FileSystem from "expo-file-system";

export const uploadEventImage = async (uri: string, userId: string): Promise<string> => {
    // 1. Obter o blob da imagem
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Criar referência no Storage
    const timestamp = Date.now();
    const fileName = `events/${userId}_${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);

    // 3. Fazer upload com metadata explícita
    const metadata = {
        contentType: "image/jpeg",
        customMetadata: {
            uploadedBy: userId,
            platform: Platform.OS,
        },
    };

    // 4. Executar upload
    await uploadBytes(storageRef, blob, metadata);

    // 5. Obter URL pública
    return getDownloadURL(storageRef);
};
export const validateImageForUpload = async (uri: string): Promise<boolean> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if (!fileInfo.exists) {
            console.error("Arquivo não existe");
            return false;
        }

        // Verificar tamanho (5MB máximo)
        if (fileInfo.size > 5 * 1024 * 1024) {
            console.error("Arquivo muito grande (>5MB)");
            return false;
        }

        // Verificar extensão do arquivo
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
