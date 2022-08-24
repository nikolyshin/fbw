import { fetchGoodsList } from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert } from 'antd';

const GoodList = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);

  const getGoodsList = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsList({
        wbKey: currentWbKey,
        ordering: 'subject'
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
      title: 'Имя',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'Артикул WB',
      dataIndex: 'article_wb',
      key: 'article_wb'
    },
    {
      title: 'Артикул 1С',
      dataIndex: 'article_1c',
      key: 'article_1c'
    },
    {
      title: 'БарКод',
      dataIndex: 'barcode',
      key: 'barcode'
    },
    {
      title: 'Остаток на складе',
      dataIndex: 'stock',
      key: 'stock'
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

export default GoodList;
