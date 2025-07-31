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
                500: "#5D1728", // cor principal
                600: "#B9154E",
                700: "#8A103A",
                800: "#5C0A26",
                900: "#2D0513",
            },
            backgroundLight: "#FFF8EC",
            backgroundDark: "#0A0A13",
            textLight: "#0A0A13",
            textDark: "#FFF8EC",
            muted: "#A1A1AA",
            border: "#E4E4E7",
            error: "#EF4444",
            success: "#22C55E",
        },
    },
});
