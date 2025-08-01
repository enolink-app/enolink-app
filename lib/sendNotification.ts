import { api } from "@/lib/axios";

export const sendNotificationToOrganizer = async (eventId: string, message: string) => {
    try {
        await api.post("/notifications", {
            eventId,
            message,
            type: "NEW_PARTICIPANT",
        });
    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
    }
};
