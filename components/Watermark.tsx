import { View, Text, StyleSheet, Dimensions } from "react-native";
import Constants from "expo-constants";
import { HStack, VStack } from "@gluestack-ui/themed";
import { useState, useEffect } from "react";
import useLanguageStore from "@/stores/useLanguageStore";

const isTestBuild = false;

export default function Watermark() {
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    if (!isTestBuild) return null;
    const { width, height } = Dimensions.get("window");

    const cols = 3;
    const rows = 6;

    const watermarks = Array.from({ length: cols * rows });
    const HomComponent = () => {
        return (
            <HStack key={updateKey} space="2xl">
                <Text style={styles.text}>{t("general.test")}</Text>
                <Text style={styles.text}>{t("general.test")}</Text>
                <Text style={styles.text}>{t("general.test")}</Text>
                <Text style={styles.text}>{t("general.test")}</Text>
            </HStack>
        );
    };
    return (
        <View key={updateKey} pointerEvents="none" style={styles.container}>
            <VStack>
                {watermarks.map((_, index) => (
                    <HomComponent key={index} />
                ))}
            </VStack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: "center",
        opacity: 0.2,
        transform: [{ rotate: "-15deg" }],
    },
    text: {
        fontSize: 52,
        fontWeight: "bold",
        color: "pink",
    },
});
