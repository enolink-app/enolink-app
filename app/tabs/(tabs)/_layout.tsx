import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-ui.config"; // Caminho ajustado ao seu projeto
import { House, Wine, Calendar, User, PlusIcon } from "lucide-react-native";

function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>["name"]; color: string }) {
    return <Ionicons size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#5D1728", // sua cor primária
                tabBarLabelStyle: { fontSize: 11 },
                tabBarStyle: {
                    height: 60,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <House key="half" size={20} color={color} />,
                }}
            />

            <Tabs.Screen
                name="events"
                options={{
                    title: "Eventos",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Calendar key="half" size={20} color={color} />,
                }}
            />

            {/* TAB do botão de novo evento */}
            {/*                 <Tabs.Screen
                    name="redirect"
                    options={{
                        title: "Novo Evento",
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons
                                name="add-circle"
                                size={60}
                                color="#5D1728"
                                style={{
                                    bottom: 10,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                    position: "absolute",
                                    zIndex: 9999,
                                    width: 70,
                                    textAlign: "center",
                                }}
                            />
                        ),
                        tabBarLabelStyle: { marginTop: 0 },
                    }}
                /> */}

            <Tabs.Screen
                name="wines"
                options={{
                    title: "Vinhos",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Wine key="half" size={20} color={color} />,
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Eu",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <User key="half" size={20} color={color} />,
                }}
            />
        </Tabs>
    );
}
