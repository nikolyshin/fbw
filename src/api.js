import axios from "axios";
import Cookies from 'js-cookie'

const client = axios.create({
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Authorization": Cookies.get("token")
    },
});

client.interceptors.response.use(
    (r) => r,
    (e) => {
      return Promise.resolve(e.response);
    }
  );
  

export const fetchToken = (data) => {
    return client
        .post(`/api/v1/token/`, data)
        .then((response) => response.data);
};

export const fetchGoods = (data) => {
    return client
        .get(`/api/v1/goods/category/sales`, {
            params: data,
        })
        .then((response) => response.data);
};

export const fetchUsers = (data) => {
    return client
        .get(`/api/v1/users/me`, {
            params: data,
        })
        .then((response) => response.data);
};