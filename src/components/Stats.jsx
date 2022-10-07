import {
  fetchWarehouses,
  fetchWarehousesCreateIncomesBackup,
  fetchWarehousesOrders
} from '../api';
import React, { useEffect, useState } from 'react';
import { Spin, Table, Alert, InputNumber, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

const names = {
  category: 'Категории',
  subject: 'Группа товара',
  multiplicity: 'Кратность',
  brand: 'Брэнд',
  article_wb: 'Арт WB',
  article_1c: 'Арт 1С',
  barcode: 'БарКод',
  stock: 'Остаток',
  wb_key: 'Кабинет',
  wb_id: 'wb_id'
};

const Stats = ({ currentWbKey, date, planIncomes }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [columnsBackground, setColumnsBackground] = useState([]);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesSelect, setWarehousesSelect] = useState([]);
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

  const getOrders = async (pagination) => {
    try {
      setLoading(true);
      const res = await fetchWarehousesOrders({
        wb_keys: currentWbKey,
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

  const getwarehouses = async () => {
    try {
      setLoading(true);
      const res = await fetchWarehouses({
        wb_keys: currentWbKey
      });
      if (!res.detail) {
        setWarehouses(res);
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
    getOrders();
  }, [currentWbKey, date, planIncomes]);

  useEffect(() => {
    getwarehouses();
  }, []);

  useEffect(() => {
    setWarehousesSelect(warehouses);
  }, [warehouses]);

  useEffect(() => {
    setColumnsBackground([
      ...warehousesSelect.map((item) => {
        return {
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
                  onBlur={(e) => {
                    handlerCreateIncomes({ e, record, item });
                  }}
                  onPressEnter={(e) => {
                    handlerCreateIncomes({ e, record, item });
                  }}
                />
              )
            },
            {
              title: 'На сборке',
              dataIndex: `on_build_goods_${item.id}`,
              width: 40
            },
            {
              title: 'В пути',
              dataIndex: `on_road_goods_${item.id}`,
              width: 40
            }
          ]
        };
      })
    ]);
  }, [warehousesSelect]);

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
          obj[`on_build_goods_${el.warehouse_id}`] = el.on_build_goods;
          obj[`on_road_goods_${el.warehouse_id}`] = el.on_road_goods;
        });
        arr.push(obj);
      });
      setDataSource(arr);
    }
  }, [warehousesOrders]);

  useEffect(() => {
    setColumns([
      {
        title: names.category,
        dataIndex: 'category',
        fixed: 'left',
        width: 120
      },
      {
        title: names.subject,
        dataIndex: 'subject',
        fixed: 'left',
        width: 100
      },
      {
        title: names.brand,
        dataIndex: 'brand',
        width: 100
      },
      {
        title: names.article_1c,
        dataIndex: 'article_1c',
        width: 100
      },
      {
        title: names.barcode,
        dataIndex: 'barcode',
        width: 100
      },
      {
        title: names.stock,
        dataIndex: 'stock',
        width: 100
      },
      {
        title: names.wb_id,
        dataIndex: 'wb_id',
        width: 100
      },
      {
        title: names.wb_key,
        dataIndex: 'wb_key',
        width: 100
      }
    ]);
  }, []);

  return (
    <>
      <Select
        mode="multiple"
        showArrow
        value={warehousesSelect.map((item) => item.id)}
        placeholder="Выбрать склад"
        style={{
          width: 600,
          marginBottom: '24px'
        }}
        onChange={(value) => {
          setWarehousesSelect([
            ...warehouses.filter((item) => value.includes(item.id))
          ]);
        }}
      >
        {warehouses.map((item) => (
          <Option key={item.id} value={item.id}>
            {item.name}
          </Option>
        ))}
      </Select>

      <Spin spinning={loading}>
        <Table
          size="small"
          bordered
          scroll={{ x: true }}
          sticky={{ offsetHeader: 140 }}
          pagination={pagination}
          onChange={getOrders}
          columns={[...columns, ...columnsBackground]}
          dataSource={dataSource}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default Stats;
