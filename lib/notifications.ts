import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { auth } from "./firebase";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const registerForPushNotifications = async () => {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Permissão para notificações negada");
        return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
};

export const setupNotifications = (onNotificationReceived: (notification: any) => void) => {
    const subscription = Notifications.addNotificationReceivedListener(onNotificationReceived);

    const messaging = getMessaging();

    getToken(messaging, { vapidKey: "KEY" })
        .then((fcmToken) => {
            console.log("FCM Token:", fcmToken);
        })
        .catch((err) => console.log("Erro ao obter FCM token", err));

    onMessage(messaging, (payload) => {
        onNotificationReceived({
            title: payload.notification?.title,
            body: payload.notification?.body,
            data: payload.data,
        });
    });

    return () => subscription.remove();
};
