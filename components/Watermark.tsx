// components/Watermark.tsx
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Constants from "expo-constants";
import { HStack, VStack } from "@gluestack-ui/themed";
const isTestBuild = process.env.APP_ENV === "test";

export default function Watermark() {
    console.log(`IS TEST BUILD? ${isTestBuild}`);
    if (!isTestBuild) return null;
    const { width, height } = Dimensions.get("window");

    // Quantidade de linhas e colunas de marcas d'água
    const cols = 3;
    const rows = 6;

    const watermarks = Array.from({ length: cols * rows });
    const HomComponent = () => {
        return (
            <HStack space="2xl">
                <Text style={styles.text}>TEST</Text>
                <Text style={styles.text}>TEST</Text>
                <Text style={styles.text}>TEST</Text>
                <Text style={styles.text}>TEST</Text>
            </HStack>
        );
    };
    return (
        <View pointerEvents="none" style={styles.container}>
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
