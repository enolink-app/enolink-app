import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getCurrentUserToken } from "../lib/firebase";
import { api } from "@/lib/axios";
import { object } from "yup";
import { useWineStore } from "@/stores/useWineStores";

import { auth } from "@/lib/firebase";
import { useEventStore } from "@/stores/useEventStore";

export const useRequest = () => {
    const getCurrentUserId = () => {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado");
        return user.uid;
    };

    async function createEvent(data: object) {
        const token = await getCurrentUserToken();
        return await api
            .post("/events", data)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.log(`ERRO: ${error}`);
                throw Error("Não foi possível criar o evento!", error);
            });
    }

    async function getAllEvents() {
        const setAllEvents = useEventStore.getState().setAllEvents;

        return await api
            .get("/events")
            .then((response) => {
                setAllEvents(response.data);
                return response.data;
            })
            .catch((error) => {
                console.log(`deu ruim, ${JSON.stringify(error.response.data)}`);
                throw Error(`Algo deu errado: ${error}`);
            });
    }

    async function getEventById(id: string) {
        const allEvents = useEventStore.getState().allEvents;
        const cachedEvent = allEvents.find((event) => event.id === id);
        if (cachedEvent) return cachedEvent;

        const response = await api
            .get(`/events/${id}`)
            .then((response) => {
                return JSON.stringify(response.data);
            })
            .catch((error) => {
                console.log(`Não foi poss;ivel buscar os eventos por ID: ${JSON.stringify(error.response.data)}`);
                throw Error(`Não foi poss;ivel buscar os eventos por ID: ${JSON.stringify(error.response.data)}`);
            });
        return response.data;
    }

    async function getEventByUser() {
        const uid = getCurrentUserId();

        return await api
            .get(`/events/${uid}/user`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.log(`Não foi possível buscar os eventos por ID: ${error.response.data}`);
                throw Error(`Não foi possível buscar os eventos por ID: ${error.response.data}`);
            });
    }

    async function evaluateWineEvent(data: { eventId: string; wineId: string; wineIndex: number; userId: string; aroma: number; color: number; flavor: number; notes?: string }) {
        const newData = {
            wineId: data.wineId,
            wineIndex: data.wineIndex,
            userId: data.userId,
            aroma: data.aroma,
            color: data.color,
            flavor: data.flavor,
            notes: data.notes || "",
        };
        return await api
            .post(`/events/${data.eventId}/evaluate`, newData)
            .then((response) => {
                return "success";
                response.data;
            })
            .catch((error) => {
                console.error("Erro na avaliação:", error.response?.data || error.message);
                return error.response?.data?.error || "Erro ao enviar avaliação";
            });
    }

    async function getRanking(eventId: string) {
        return await api
            .get(`/ranking/${eventId}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.log(`Erro ao buscar ranking: ${error}`);
                throw Error(`Erro ao bbuscar ranking: ${JSON.stringify(error.response.data)}`);
            });
    }

    async function createWine(data: object) {
        return await api
            .post(`/wines`, data)
            .then((response) => {
                return response?.data;
            })
            .catch((error) => {
                console.log(`Algo deu errado: ${JSON.stringify(error.response.data)}`);
                throw Error("Algo deu errado", error);
            });
    }

    async function getAllWines() {
        return await api
            .get(`/wines`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw Error("Algo deu errado", error);
            });
    }

    async function getWineByUser(id: string) {
        const addWineToStore = useWineStore((state) => state.addWine);
        return await api
            .get(`/wines`)
            .then((response) => {
                addWineToStore(response.data);
                return response.data;
            })
            .catch((error) => {
                console.log(`Não foi possível buscar os vinhos do usuário: ${error}`);
                throw Error("Algo deu errado", error);
            });
    }

    async function getWineById(id: string) {
        return await api
            .get(`/wines/${id}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.log(`Algo deu errado ao buscar vinhos: `, error.response.data);
                throw Error("Algo deu errado", error);
            });
    }

    async function getEvaluationsByEvent(eventId: string) {
        return await api
            .get(`/evaluations/${eventId}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw Error("Algo deu errado", error);
            });
    }

    async function joinEvent(eventId: string, participantData: { userId: string; userName: string; isGuest?: boolean }) {
        return await api
            .post(`/events/join/${eventId}`, participantData)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.error("Error joining event:", error.response?.data);
                throw error;
            });
    }

    async function leaveEvent(eventId: string, userId: string) {
        return await api
            .delete(`/events/${eventId}/leave/${userId}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.error("Error leaving event:", error.response?.data);
                throw error;
            });
    }

    async function generateNewInviteCode(eventId: string, userId: string) {
        return await api
            .post(`/events/${eventId}/generate-code`, { userId })
            .then((response) => {
                return response.data.newInviteCode;
            })
            .catch((error) => {
                console.error("Error generating code:", error.response?.data);
                throw error;
            });
    }

    async function getTopWines() {
        return await api
            .get("/events/top/wines")
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.error("Erro ao buscar top 10 vinhos:", error.response.data);
                throw error;
            });
    }

    async function createDiaryEntry(data: object) {
        return await api
            .post("/diary", data)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.error("Erro ao criar avaliação:", error.response);
                throw error;
            });
    }

    async function getDiaryEntries() {
        return await api
            .get("/diary")
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.error("Erro ao buscar histórico do diário:", error.response.data);
                throw error;
            });
    }

    async function updateDiaryEntry(id: string, data: object) {
        return await api
            .put(`/diary/${id}`, data)
            .then((response) => response.data)
            .catch((error) => {
                console.error("Erro ao atualizar avaliação:", error.response || error);
                throw error;
            });
    }

    async function closeEvent(eventId: string) {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Usuário não autenticado");

        return await api
            .post(`/events/${eventId}/close`, { userId: currentUser.uid })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                console.error(error.response.data);
                throw new Error(error.response.data.error || "Erro ao encerrar evento");
            });
    }

    return {
        createEvent,
        getAllEvents,
        getEventById,
        evaluateWineEvent,
        getRanking,
        createWine,
        getAllWines,
        getWineByUser,
        getWineById,
        getEvaluationsByEvent,
        joinEvent,
        leaveEvent,
        generateNewInviteCode,
        getEventByUser,
        getTopWines,
        createDiaryEntry,
        getDiaryEntries,
        updateDiaryEntry,
        closeEvent,
    };
};
