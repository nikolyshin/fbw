import {
  fetchWarehouses,
  fetchWarehousesCreateIncomesBackup,
  fetchWarehousesOrders
} from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert, InputNumber } from 'antd';
import moment from 'moment';

const staticColumns = [
  {
    title: 'Категории',
    dataIndex: 'category',
    fixed: 'left'
  },
  {
    title: 'Имя',
    dataIndex: 'subject',
    fixed: 'left'
  }
];

const createdIncomesColumns = [
  {
    title: 'Арт',
    dataIndex: 'article'
  },
  {
    title: 'id',
    dataIndex: 'id'
  },
  {
    title: 'Дата',
    dataIndex: 'date',
    render: (date) => {
      return <p>{moment(date).format('YYYY-MM-DD')}</p>;
    }
  },
  {
    title: 'Кол-во',
    dataIndex: 'quantity'
  },
  {
    title: 'Имя',
    dataIndex: 'item_name'
  }
];

const Stats = ({ currentWbKey, date, planIncomes, createdIncomes }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [columnsBackground, setColumnsBackground] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [warehousesBackground, setWarehousesBackground] = useState([]);
  const [warehousesOrders, setWarehousesOrders] = useState([]);

  const handlerCreateIncomes = async ({ e, record, item }) => {
    try {
      await fetchWarehousesCreateIncomesBackup({
        data: {
          item_id: record.id,
          quantity: Number(e.target.value),
          warehouse_id: item.id
        }
      });
    } catch (error) {
      console.log(error);
    }

    let items = JSON.parse(localStorage.getItem('incomes')) || [];

    let index = items.findIndex(
      (element) =>
        element.item_id === record.id && element.warehouse_id === item.id
    );
    if (index !== -1) {
      items[index].quantity = Number(e.target.value);
    } else {
      items.push({
        item_id: record.id,
        quantity: e.target.value,
        warehouse_id: item.id
      });
    }

    localStorage.setItem('incomes', JSON.stringify(items));
  };

  const getWarehousesOrders = async (pagination) => {
    try {
      setLoading(true);
      const res = await fetchWarehousesOrders({
        wbKey: currentWbKey,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        plan_period: planIncomes,
        limit: pagination?.pageSize,
        date_from: moment(date[0]).format('YYYY-MM-DD'),
        date_to: moment(date[1]).format('YYYY-MM-DD')
      });
      if (!res?.detail) {
        setWarehousesOrders(res?.results);
        setPagination((prev) => {
          return {
            ...prev,
            pageSize: pagination?.pageSize,
            current: pagination?.current,
            total: Math.ceil(res.count)
          };
        });
      } else {
        setError(res?.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getWarehousesBackground = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    getWarehousesOrders();
  }, [currentWbKey, date, planIncomes]);

  useEffect(() => {
    getWarehousesBackground();
  }, []);

  useEffect(() => {
    if (!!warehousesBackground.length) {
      const arr = [];
      warehousesBackground.forEach((item) => {
        arr.push({
          title: item.name,
          children: [
            {
              title: 'Кол-во',
              dataIndex: `count_${item.id}`,
              width: 40
            },
            {
              title: 'Прод.',
              dataIndex: `sales_${item.id}`,
              width: 40
            },
            {
              title: 'План',
              dataIndex: `plane_${item.id}`,
              width: 40
            },
            {
              title: 'Факт',
              dataIndex: `fact_${item.id}`,
              key: `fact_${item.id}`,
              render: (_, record) => (
                <InputNumber
                  min={0}
                  defaultValue={record[`fact_${item.id}`]}
                  onBlur={(e) => {
                    handlerCreateIncomes({ e, record, item });
                  }}
                  onPressEnter={(e) => {
                    handlerCreateIncomes({ e, record, item });
                  }}
                />
              )
            }
          ]
        });
      });

      setColumnsBackground(arr);
    }
  }, [warehousesBackground]);

  useEffect(() => {
    if (!!warehousesOrders.length) {
      const arr = [];
      warehousesOrders.forEach((item) => {
        const obj = { ...item };
        item.stocks.forEach((el) => {
          obj[`sales_${el.warehouse_id}`] = el.orders;
          obj[`count_${el.warehouse_id}`] = el.quantity;
          obj[`plane_${el.warehouse_id}`] = el.incomes_plan;
          obj[`fact_${el.warehouse_id}`] = el.incomes;
        });
        arr.push(obj);
      });
      setDataSource(arr);
    }
  }, [warehousesOrders]);

  return (
    <>
      <div style={{ display: 'flex', gap: 16 }}>
        <Spin spinning={loading}>
          <Table
            size="small"
            tableLayout="fixed"
            bordered
            scroll={{ x: true }}
            sticky={{ offsetHeader: 140 }}
            pagination={pagination}
            onChange={getWarehousesOrders}
            columns={[...staticColumns, ...columnsBackground]}
            dataSource={dataSource}
          />
        </Spin>
        {createdIncomes.map((item) => (
          <Table
            bordered
            size="small"
            scroll={{ x: true }}
            sticky={{ offsetHeader: 140 }}
            columns={createdIncomesColumns}
            dataSource={item[0].incomes}
            pagination={false}
          />
        ))}
      </div>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default Stats;
