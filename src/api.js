import axios from 'axios';
import Cookies from 'js-cookie';
import qs from 'qs';

const client = axios.create({
  baseURL: 'https://mp-log.ru/api/v1',
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'comma', skipNulls: true });
  }
});

client.interceptors.response.use(
  (r) => r,
  (e) => {
    return Promise.resolve(e.response);
  }
);

client.interceptors.request.use(
  (config) => {
    if (Cookies.get('token')) {
      config.headers['Authorization'] = `Bearer ${Cookies.get('token')}`;
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
      params: data
    })
    .then((response) => response.data);
};

export const fetchGoodsFilters = (data) => {
  return client
    .get(`/goods/category/sales/filters/`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchGoodsList = (data) => {
  return client
    .get(`/goods/`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchGoodsListFilters = (data) => {
  return client
    .get(`/goods/filters/`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchEditProduct = (id, data) => {
  return client.put(`/goods/${id}/`, data).then((response) => response.data);
};

export const fetchGoodsBackup = (id) => {
  return client
    .get(`/goods/${id.id}/backups/`, {
      params: id
    })
    .then((response) => response.data);
};

export const fetchUsers = (data) => {
  return client
    .get(`/users/me`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchWarehousesOrders = (data) => {
  return client
    .get(`/goods/warehouses/orders/`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchWarehousesBackground = (data) => {
  return client
    .get(`/goods/warehouses/background/`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchWarehouses = (data) => {
  return client
    .get(`/goods/warehouses/wh_list`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchGoodsIncomes = (data) => {
  return client
    .get(`/goods/incomes/`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchGoodsIncomesFilters = (data) => {
  return client
    .get(`/goods/incomes/filters`, {
      params: data
    })
    .then((response) => response.data);
};

export const fetchGetGoodsIncomes = (id) => {
  return client.get(`/goods/incomes/${id}/`).then((response) => response.data);
};

export const fetchSetStatus = (id, data) => {
  return client
    .put(`/goods/incomes/${id}/`, data)
    .then((response) => response.data);
};

export const fetchWarehousesCreateIncomes = (data) => {
  return client
    .post(`/goods/warehouses/create_incomes/`, data)
    .then((response) => response.data);
};

export const fetchWarehousesCreateIncomesBackup = (data) => {
  return client
    .post(`/goods/warehouses/create_incomes_backup/`, data)
    .then((response) => response.data);
};

export const fetchRegistration = (data) => {
  return client
    .post(`/users/registration`, data)
    .then((response) => response.data);
};
