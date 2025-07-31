import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const API_BASE_URL = "https://ivino-api.com/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

const useRequest = () => {
    async function createEvent(data) {
        const token = await AsyncStorage.getItem("token");
        return await api
            .post("/events", data, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                console.log("Sucesso", response);
            })
            .catch((error) => {
                throw Error("Não foi possível criar o evento!", error);
            });
    }

    return {
        createEvent,
    };
};
