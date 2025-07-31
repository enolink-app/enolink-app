// linking.ts
import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "./types";

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ["wineapp://", "https://enolinkapp.com"],
    config: {
        screens: {
            JoinEvent: {
                path: "join/:inviteCode",
                parse: {
                    inviteCode: (inviteCode: string) => inviteCode,
                },
            },
        },
    },
};

export default linking;
