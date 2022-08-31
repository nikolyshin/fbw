import { fetchGoods } from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert, Segmented, Divider } from 'antd';
import moment from 'moment';

const sortingTabs = [
  { value: 'sales', label: 'sales' },
  { value: '-sales', label: '-sales' }
];

const DashBoard = ({ currentWbKey, date }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [currentOrdering, setCurrentOrdering] = useState(null);

  const getGoodsList = async () => {
    try {
      setLoading(true);
      const res = await fetchGoods({
        date_from: moment(date[0]).format('YYYY-MM-DD'),
        date_to: moment(date[1]).format('YYYY-MM-DD'),
        wbKey: currentWbKey,
        ordering: currentOrdering
      });
      if (res.results) {
        setGoods(res.results);
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
    if (date) {
      getGoodsList();
    }
  }, [currentWbKey, currentOrdering, date]);

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
      <Segmented
        options={sortingTabs}
        value={currentOrdering}
        onChange={setCurrentOrdering}
      />
      <Divider />
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={goods} />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default DashBoard;
