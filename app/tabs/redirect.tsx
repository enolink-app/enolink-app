// app/tabs/(tabs)/redirect.tsx
import { useEffect } from "react";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useRouter } from "expo-router";
export default function RedirectToNewEvent() {
    const router = useRouter();
    useEffect(() => {
        router.push("/(forms)/new-event");
    }, [0]);

    return <View></View>;
}
