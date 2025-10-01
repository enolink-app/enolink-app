import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Alert } from "react-native";
import { Button, Box, Text, ButtonText, Input } from "@gluestack-ui/themed";
import useLanguageStore from "@/stores/useLanguageStore";

export default function CompleteProfile() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [updateKey, setUpdateKey] = useState(0);
    const { t, forceUpdate } = useLanguageStore();

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const handleSubmit = async () => {
        try {
            await updateProfile(auth.currentUser!, { displayName: name });
            router.replace("/tabs/(tabs)/home");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível atualizar o perfil.");
        }
    };

    return (
        <Box key={updateKey}>
            <Text>Complete seu perfil</Text>
            <Input value={name} onChangeText={setName} placeholder="Nome completo" />
            <Button onPress={handleSubmit}>
                <ButtonText>Continuar</ButtonText>
            </Button>
        </Box>
    );
}
