import React, { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { House, Wine, Calendar, User } from "lucide-react-native";
import useLanguageStore from "@/stores/useLanguageStore";
import { config } from "@/gluestack-ui.config";
export default function TabLayout() {
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    return (
        <Tabs
            key={updateKey}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: primary,
                tabBarLabelStyle: { fontSize: 11 },
                tabBarStyle: {
                    height: 60,
                },
                sceneStyle: {
                    backgroundColor: neutralLight,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: t("general.home"),
                    headerShown: false,
                    tabBarIcon: ({ color }) => <House key="half" size={20} color={color} />,
                }}
            />

            <Tabs.Screen
                name="events"
                options={{
                    title: t("general.events"),
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Calendar key="half" size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="wines"
                options={{
                    title: t("general.wines"),
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Wine key="half" size={20} color={color} />,
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: t("general.me"),
                    headerShown: false,
                    tabBarIcon: ({ color }) => <User key="half" size={20} color={color} />,
                }}
            />
        </Tabs>
    );
}
