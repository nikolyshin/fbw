import {
  fetchGetGoodsIncomes,
  fetchGoodsIncomes,
  fetchGoodsIncomesFilters,
  fetchSetStatus
} from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
const { Option } = Select;

const names = {
  plan_date: 'Плановая дата',
  number: 'Номер поставки',
  quantity: 'Кол-во',
  warehouse_name: 'Склад',
  date: 'Дата',
  status: 'Статус'
};

const dateFormat = 'DD-MM-YYYY';

const Delivery = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [detail, setDetail] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState({});
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
      } else {
        setError(res.detail);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const changeDetail = async ({ id, number, status, plan_date }) => {
    try {
      setLoading(true);
      const res = await fetchSetStatus(id, { number, status, plan_date });
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

  const getGoodsListFilters = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsIncomesFilters({
        wb_keys: currentWbKey
      });
      if (!res.detail) {
        setFilters(res);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getGoodsList = async (pagination, filters) => {
    try {
      setLoading(true);
      const res = await fetchGoodsIncomes({
        wb_keys: currentWbKey,
        limit: pagination?.pageSize,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        warehouse_name: filters?.warehouse_name,
        status: filters?.status
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
    getGoodsListFilters();
  }, [currentWbKey]);

  useEffect(() => {
    setColumns([
      {
        title: names.date,
        dataIndex: 'date',
        render: (date) => {
          return <p>{moment(date).format('YYYY-MM-DD')}</p>;
        }
      },
      {
        title: names.warehouse_name,
        dataIndex: 'warehouse_name',
        filterSearch: true,
        filters: filters?.warehouse_name?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.quantity,
        dataIndex: 'quantity'
      },
      {
        title: names.number,
        dataIndex: 'number',
        render: (_, record) => (
          <Input
            placeholder={names.number}
            defaultValue={record.number}
            onPressEnter={(e) => {
              if (e.target.value) {
                changeDetail({ id: record.id, number: e.target.value });
                getDeatil(e.target.value);
              }
            }}
          />
        )
      },
      {
        title: names.plan_date,
        dataIndex: 'plan_date',
        render: (_, record) => (
          <DatePicker
            defaultValue={
              record.plan_date ? moment(record.plan_date, dateFormat) : null
            }
            format={dateFormat}
            onChange={(value) => {
              changeDetail({
                id: record.id,
                plan_date: moment(value).format('YYYY-MM-DD')
              });
            }}
            placeholder="Выберите время"
          />
        )
      },
      {
        title: names.status,
        dataIndex: 'status',
        filterSearch: true,
        filters: Object.entries(filters?.status || []).map((item) => {
          return { text: item[1], value: item[0] };
        }),
        render: (_, record) => (
          <Select
            value={record.status}
            placeholder="Выберите статус"
            onChange={(value) => {
              changeDetail({ id: record.id, status: value });
            }}
            style={{
              width: 200
            }}
          >
            {Object.entries(filters?.status || []).map((item, i) => (
              <Option key={i} value={item[0]}>
                {item[1]}
              </Option>
            ))}
          </Select>
        )
      }
    ]);
  }, [filters]);

  const columnsDetail = [
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
