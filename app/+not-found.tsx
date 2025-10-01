import { Link, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import useLanguageStore from "@/stores/useLanguageStore";

export default function NotFoundScreen() {
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    return (
        <>
            <Stack.Screen options={{ title: "Oops!" }} />
            <Center className="flex-1 justify-center items-center">
                <Text className="text-secondary-200">This screen doesn't exist.</Text>

                <Link href="/splash" style={{ marginTop: 10 }}>
                    <Text className="text-primary-500">Go to home screen!</Text>
                </Link>
            </Center>
        </>
    );
}
