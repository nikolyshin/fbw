import axios from "axios";

const client = axios.create({
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchToken = (data) => {
    return client
        .post(`/api/token/`, data)
        .then((response) => response.data);
};

export const fetchGoods = (data) => {
    return client
        .get(`/api/goods/category/sales`, {
            params: data,
        })
        .then((response) => response.data);
};