import axios from "axios";

const client = axios.create({
    baseUrl: "http://188.225.86.213:8000",
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchToken = (data) => {
    return client
        .post(`/token/`, data)
        .then((response) => response.data);
};

// export const fetchToken = (data) => {
//     return client
//         .get(`catalog/sections${trailingSlash}`, {
//             params: data,
//         })
//         .then((response) => response.data);
// };