import {
  fetchGetGoodsIncomes,
  fetchGoodsIncomes,
  fetchSetStatus
} from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert, Input, Select } from 'antd';
import moment from 'moment';
const { Option } = Select;

const Delivery = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [status, setStatus] = useState(null);
  const [detail, setDetail] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true
  });

  const statuses = ['Заказано поставщику', 'В пути на WB', 'Принято на склад'];

  const getDeatil = async (id) => {
    try {
      setLoading(true);
      const res = await fetchGetGoodsIncomes(id);
      if (res.incomes) {
        setDetail(res.incomes);
        setStatus(res.status || null);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const changeDetail = async ({ id, number, status }) => {
    try {
      setLoading(true);
      const res = await fetchSetStatus(id, { number, status });
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
      render: (date) => {
        return <p>{moment(date).format('YYYY-MM-DD')}</p>;
      }
    },
    {
      title: 'Склад',
      dataIndex: 'warehouse_name'
    },
    {
      title: 'Кол-во',
      dataIndex: 'quantity'
    },
    {
      title: 'Номер поставки',
      dataIndex: 'number',

      render: (_, record) => (
        <Input
          placeholder="Номер поставки"
          defaultValue={record.number}
          onPressEnter={(e) => {
            if (e.target.value) {
              changeDetail({ id: record.id, number: e.target.value });
              getDeatil(e.target.value);
            }
          }}
        />
      )
    }
  ];

  const columnsDetail = [
    {
      title: () => {
        if (!!detail.length)
          return (
            <Select
              value={status}
              placeholder="Выберите статус"
              onChange={(value) => {
                changeDetail({ status: value });
              }}
              style={{
                width: 300
              }}
            >
              {statuses?.map((item, i) => (
                <Option key={i} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          );
        return <></>;
      },

      children: [
        {
          title: 'Арт',
          dataIndex: 'article'
        },
        {
          title: 'item_name',
          dataIndex: 'item_name'
        },
        {
          title: 'Кол-во',
          dataIndex: 'quantity',
          width: 100
        }
      ]
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: 16 }}>
        <Spin spinning={loading}>
          <Table
            bordered
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
            bordered
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
