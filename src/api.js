import axios from "axios";
import Cookies from 'js-cookie'

const client = axios.create({
    baseURL:"http://188.225.86.213:8000/api/v1",
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
        .post(`/token/`, data)
        .then((response) => response.data);
};

export const fetchGoods = (data) => {
    return client
        .get(`/goods/category/sales`, {
            params: data,
        })
        .then((response) => response.data);
};

export const fetchUsers = (data) => {
    return client
        .get(`/users/me`, {
            params: data,
        })
        .then((response) => response.data);
};