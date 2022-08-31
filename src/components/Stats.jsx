import { fetchWarehousesBackground, fetchWarehousesOrders } from '../api';
import React, { useEffect, useMemo, useState } from 'react';
import { Spin, Table, Alert } from 'antd';

const Stats = ({ currentWbKey }) => {
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);
  const [error, setError] = useState('');
  const [warehousesBackground, setWarehousesBackground] = useState([]);
  const [warehousesOrders, setWarehousesOrders] = useState([]);

  const getWarehousesOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetchWarehousesOrders({
        wbKey: currentWbKey
      });
      if (!res.detail) {
        setWarehousesOrders(res);
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
      const res = await fetchWarehousesBackground({
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
    getWarehousesBackground();
  }, [currentWbKey]);

  const columnsBackground = useMemo(() => {
    if (!!warehousesBackground.length) {
      const keys = Object.keys(warehousesBackground[0]);

      return keys.map((item) => {
        return {
          title: item,
          dataIndex: item,
          key: item
        };
      });
    }
  }, [warehousesBackground]);

  const columnsOrders = useMemo(() => {
    if (!!warehousesOrders.length) {
      const keys = Object.keys(warehousesOrders[0]);

      return keys.map((item) => {
        return {
          title: item,
          dataIndex: item,
          key: item
        };
      });
    }
  }, [warehousesOrders]);

  return (
    <>
      <Spin spinning={loadingBackground}>
        <Table columns={columnsBackground} dataSource={warehousesBackground} />
      </Spin>
      <Spin spinning={loadingOrders}>
        <Table columns={columnsOrders} dataSource={warehousesOrders} />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default Stats;
