import { fetchGoods } from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert } from 'antd';

const DashBoard = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);

  const getGoodsList = async () => {
    try {
      setLoading(true);
      const res = await fetchGoods({
        date_from: '2022-01-01',
        date_to: '2022-08-20',
        wbKey: currentWbKey
      });
      if (!res.detail) {
        setGoods(res);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!!currentWbKey) {
      getGoodsList();
    }
  }, [currentWbKey]);

  const columns = [
    {
      title: 'Категории',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Количество покупок',
      dataIndex: 'sales',
      key: 'sales'
    }
  ];

  return (
    <>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={goods} />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default DashBoard;
