import {
  fetchGetGoodsIncomes,
  fetchGoodsIncomes,
  fetchSetStatus
} from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert, Input } from 'antd';
import { useRef } from 'react';
import moment from 'moment';

const Delivery = ({ currentWbKey, setCurrentStatus }) => {
  const idRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [detail, setDetail] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true
  });

  const getDeatil = async (id) => {
    try {
      setLoading(true);
      const res = await fetchGetGoodsIncomes(id);
      if (res.incomes) {
        setDetail(res.incomes);
        setCurrentStatus(res.status || null);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const changeNumber = async ({ id, number }) => {
    try {
      setLoading(true);
      const res = await fetchSetStatus(id || idRef.current, { number });
      if (res.incomes) {
        setDetail(res.incomes);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getGoodsList = async (pagination) => {
    try {
      setLoading(true);
      const res = await fetchGoodsIncomes({
        wbKey: currentWbKey,
        limit: pagination?.pageSize,
        offset: (pagination?.current - 1) * pagination?.pageSize || null
      });
      if (res.results) {
        setGoods(res.results);
        setPagination((prev) => {
          return {
            ...prev,
            pageSize: pagination?.pageSize,
            current: pagination?.current,
            total: Math.ceil(res.count)
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
    getGoodsList();
  }, [currentWbKey]);

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date) => {
        return <p>{moment(date).format('YYYY-MM-DD')}</p>;
      }
    },
    {
      title: 'Склад',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name'
    },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Номер поставки',
      dataIndex: 'number',
      key: 'number',

      render: (_, record) => (
        <Input
          placeholder="Номер поставки"
          defaultValue={record.number}
          onPressEnter={(e) => {
            localStorage.setItem('currentDetail', e.target.value);
            changeNumber({ id: record.id, number: e.target.value });
            getDeatil(e.target.value);
          }}
          onBlur={(e) => {
            localStorage.setItem('currentDetail', e.target.value);
            changeNumber({ id: record.id, number: e.target.value });
            getDeatil(e.target.value);
          }}
        />
      )
    }
  ];

  const columnsDetail = [
    {
      title: 'Арт',
      dataIndex: 'article',
      key: 'article'
    },
    {
      title: 'item_name',
      dataIndex: 'item_name',
      key: 'item_name'
    },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      key: 'quantity'
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: 16 }}>
        <Spin spinning={loading}>
          <Table
            size="small"
            scroll={{ x: true }}
            sticky={{ offsetHeader: 140 }}
            columns={columns}
            dataSource={goods}
            pagination={pagination}
            onChange={getGoodsList}
          />
        </Spin>
        <Spin spinning={loading}>
          <Table
            size="small"
            scroll={{ x: true }}
            columns={columnsDetail}
            dataSource={detail}
            pagination={false}
            sticky={{ offsetHeader: 140 }}
          />
        </Spin>
      </div>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default Delivery;
