// wine-app/ui/gluestack-ui.config.ts
import { createConfig } from "@gluestack-ui/themed";
import { config as defaultConfig } from "@gluestack-ui/config";

export const config = createConfig({
    ...defaultConfig,
    tokens: {
        ...defaultConfig.tokens,
        colors: {
            ...defaultConfig.tokens.colors,
            primary: {
                50: "#FFF0F6",
                100: "#FEE1EC",
                200: "#FCC3D7",
                300: "#FA96BD",
                400: "#F868A3",
                500: "#6B2232",
                600: "#2D2D2D",
                700: "#ECE7E1",
                800: "#1E6F5C",
                900: "#B89F5B",
            },
            backgroundLight: "#ECE7E1",
            backgroundDark: "#2D2D2D",
            textLight: "#2D2D2D",
            textDark: "#ECE7E1",
            muted: "#A1A1AA",
            border: "#E4E4E7",
            error: "#EF4444",
            success: "#22C55E",
            accent: "#1E6F5C",
            gold: "#B89F5B",
        },
    },
});
