import axios from "axios";
import Cookies from "js-cookie";

const client = axios.create({
  baseURL: "https://mp-log.ru/api/v1",
});

client.interceptors.response.use(
  (r) => r,
  (e) => {
    return Promise.resolve(e.response);
  }
);

client.interceptors.request.use(
  (config) => {
    if (Cookies.get("token")) {
      config.headers["Authorization"] = `Bearer ${Cookies.get("token")}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchToken = (data) => {
  return client.post(`/token/`, data).then((response) => response.data);
};

export const fetchGoods = (data) => {
  return client
    .get(`/goods/category/sales/`, {
      params: data,
    })
    .then((response) => response.data);
};

export const fetchGoodsList = (data) => {
  return client
    .get(`/goods/`, {
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

export const fetchWarehousesOrders = (data) => {
  return client
    .get(`/goods/warehouses/orders/`, {
      params: data,
    })
    .then((response) => response.data);
};

export const fetchWarehousesBackground = (data) => {
  return client
    .get(`/goods/warehouses/background/`, {
      params: data,
    })
    .then((response) => response.data);
};

export const fetchWarehouses = (data) => {
  return client
    .get(`/goods/warehouses/wh_list`, {
      params: data,
    })
    .then((response) => response.data);
};

export const fetchWarehousesCreateIncomes = (data) => {
  return client
    .post(`/goods/warehouses/create_incomes/`, data)
    .then((response) => response.data);
};
