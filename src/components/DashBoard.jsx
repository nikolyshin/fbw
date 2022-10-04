import { fetchGoods } from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert } from 'antd';
import moment from 'moment';

const names = {
  category: 'Категории',
  brand: 'Брэнд',
  sales: 'Продаж',
  wb_key: 'Кабинет'
};

const DashBoard = ({ currentWbKey, date }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const getList = async (pagination, filters, sorter) => {
    let ordering;
    if (!!sorter) {
      ordering = sorter.order
        ? `${sorter.order === 'ascend' ? '' : '-'}${sorter.field}`
        : null;
    }
    console.log(sorter);
    try {
      setLoading(true);
      const res = await fetchGoods({
        date_from: moment(date[0]).format('YYYY-MM-DD'),
        date_to: moment(date[1]).format('YYYY-MM-DD'),
        wb_keys: currentWbKey,
        ordering,
        limit: pagination?.pageSize,
        offset: (pagination?.current - 1) * pagination?.pageSize || null
      });
      if (res.results) {
        setGoods(res.results);
        setPagination((prev) => {
          return {
            ...prev,
            current: pagination?.current,
            total: Math.ceil(res.count),
            pageSize: pagination?.pageSize
          };
        });
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
      getList();
    }
  }, [currentWbKey, date]);

  const columns = [
    {
      title: names.category,
      dataIndex: 'category',
      sorter: true
    },
    {
      title: names.sales,
      dataIndex: 'sales',
      sorter: true
    },
    {
      title: names.brand,
      dataIndex: 'brand',
      sorter: true
    },
    {
      title: names.wb_key,
      dataIndex: 'wb_key',
      sorter: true
    }
  ];

  return (
    <>
      <Spin spinning={loading}>
        <Table
          size="small"
          scroll={{ x: true }}
          pagination={pagination}
          sticky={{ offsetHeader: 140 }}
          columns={columns}
          onChange={getList}
          dataSource={goods}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default DashBoard;
