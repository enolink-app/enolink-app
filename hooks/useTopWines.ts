import { useEffect, useState } from "react";
import { useRequest } from "./useRequest";

export const useTopWines = () => {
    const [topWines, setTopWines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getTopWines } = useRequest();

    useEffect(() => {
        const fetchTopWines = async () => {
            try {
                setLoading(true);
                const data = await getTopWines();
                setTopWines(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopWines();
    }, []);

    return { topWines, loading, error };
};
