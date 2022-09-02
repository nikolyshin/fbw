import {
  fetchWarehouses,
  fetchWarehousesBackground,
  fetchWarehousesOrders
} from '../api';
import React, { useEffect, useMemo, useState } from 'react';
import { Spin, Table, Alert } from 'antd';

const staticColumns = [
  {
    title: 'Категории',
    dataIndex: 'category',
    key: 'category'
  },
  {
    title: 'Имя',
    dataIndex: 'subject',
    key: 'subject'
  },
  {
    title: 'Артикул WB',
    dataIndex: 'article_wb',
    key: 'article_wb'
  }
];

const Stats = ({ currentWbKey }) => {
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);
  const [error, setError] = useState('');
  const [columnsBackground, setColumnsBackground] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [warehousesBackground, setWarehousesBackground] = useState([]);
  const [warehousesOrders, setWarehousesOrders] = useState([]);

  const getWarehousesOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetchWarehousesOrders({
        wbKey: currentWbKey
      });
      if (!res.detail) {
        setWarehousesOrders(res.results);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getWarehousesBackground = async () => {
    try {
      setLoadingBackground(true);
      const res = await fetchWarehouses({
        wbKey: currentWbKey
      });
      if (!res.detail) {
        setWarehousesBackground(res);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingBackground(false);
    }
  };

  useEffect(() => {
    getWarehousesOrders();
  }, [currentWbKey]);

  useEffect(() => {
    getWarehousesBackground();
  }, []);

  useEffect(() => {
    if (!!warehousesBackground.length) {
      const arr = [];
      warehousesBackground.forEach((item) => {
        arr.push(
          {
            title: `Количество на складе ${item.name}`,
            dataIndex: `count_${item.id}`,
            key: `count_${item.id}`
          },
          {
            title: `Продаж за период складе ${item.name}`,
            dataIndex: `sales_${item.id}`,
            key: `sales_${item.id}`
          }
        );
      });

      setColumnsBackground(arr);
    }
  }, [warehousesBackground]);

  useEffect(() => {
    if (!!warehousesOrders.length) {
      const arr = [];
      warehousesOrders.forEach((item) => {
        const obj = { ...item };
        item.stocks.map((el) => {
          obj[`sales_${el.warehouse_id}`] = el.orders;
          obj[`count_${el.warehouse_id}`] = el.quantity;
        });
        arr.push(obj);
      });
      console.log(arr);
      setDataSource(arr);
    }
  }, [warehousesOrders]);

  // const columnsOrders = useMemo(() => {
  //   if (!!warehousesOrders.length) {
  //     const keys = Object.keys(warehousesOrders[0]);

  //     return keys.map((item) => {
  //       return {
  //         title: item,
  //         dataIndex: item,
  //         key: item
  //       };
  //     });
  //   }
  // }, [warehousesOrders]);

  return (
    <>
      <Spin spinning={loadingBackground}>
        {/* <Table columns={columnsBackground} dataSource={warehousesBackground} /> */}
      </Spin>
      <Spin spinning={loadingOrders}>
        <Table
          scroll={{ x: true }}
          columns={[...staticColumns, ...columnsBackground]}
          dataSource={dataSource}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default Stats;
