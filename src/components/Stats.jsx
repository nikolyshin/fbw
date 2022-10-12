import {
  fetchWarehouses,
  fetchWarehousesCreateIncomesBackup,
  fetchWarehousesOrders
} from '../api';
import React, { useEffect, useRef, useState } from 'react';
import { Spin, Table, Alert, InputNumber } from 'antd';
import moment from 'moment';
import { resize } from './resize';
import ResizableTitle from './ResizableTitle';
import { dateFormat, names } from './helpers';
import SelectColumns from './SelectColumns';

const Stats = ({ currentWbKey, date, planIncomes, changeIncome }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [columns, setColumns] = useState([]);
  const [inputsValues, setInputsValues] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [columnsSelect, setColumnsSelect] = useState([]);
  const [goods, setGoods] = useState([]);
  const inputRef = useRef([]);

  const handlerCreateIncomes = async ({ value, record, item }) => {
    try {
      await fetchWarehousesCreateIncomesBackup({
        data: {
          item_id: record.id,
          quantity: value,
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
      items[index].quantity = value;
    } else {
      items.push({
        item_id: record.id,
        quantity: value,
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
        date_from: moment(date[0]).format(dateFormat),
        date_to: moment(date[1]).format(dateFormat)
      });
      if (!res?.detail) {
        setGoods(res?.results);
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
    let items = JSON.parse(localStorage.getItem('incomes')) || [];
    setInputsValues(items);
    console.log(items);
  }, [changeIncome]);

  useEffect(() => {
    getwarehouses();
  }, []);

  useEffect(() => {
    setColumnsSelect(columns);
  }, [columns]);

  useEffect(() => {
    if (!!goods.length) {
      const arr = [];
      goods.forEach((item) => {
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
  }, [goods]);

  useEffect(() => {
    setColumns([
      {
        title: names.category,
        dataIndex: 'category',
        fixed: 'left',
        width: 150
      },
      {
        title: names.subject,
        dataIndex: 'subject',
        fixed: 'left',
        width: 150
      },
      {
        title: names.brand,
        dataIndex: 'brand',
        width: 150
      },
      {
        title: names.article_1c,
        dataIndex: 'article_1c',
        width: 50
      },
      {
        title: names.barcode,
        dataIndex: 'barcode',
        width: 150
      },
      {
        title: names.stock,
        dataIndex: 'stock',
        width: 150
      },
      {
        title: names.wb_id,
        dataIndex: 'wb_id',
        width: 150
      },
      {
        title: names.wb_key,
        dataIndex: 'wb_key',
        width: 150
      },
      ...warehouses.map((item) => {
        return {
          title: item.name,
          dataIndex: `warehouse_${item.id}`,
          children: [
            {
              title: 'Кол-во',
              dataIndex: `count_${item.id}`,
              width: 50
            },
            {
              title: 'Прод',
              dataIndex: `sales_${item.id}`,
              width: 60
            },
            {
              title: 'План',
              dataIndex: `plane_${item.id}`,
              width: 60
            },
            {
              title: 'Факт',
              dataIndex: `fact_${item.id}`,
              key: `fact_${item.id}`,
              width: 70,
              render: (_, record) => (
                <InputNumber
                  type="number"
                  min={0}
                  value={
                    inputsValues.filter(
                      (inputValue) =>
                        inputValue.item_id === record.id &&
                        inputValue.warehouse_id === item.id
                    )[0]?.quantity
                  }
                  ref={(element) => inputRef.current.push(element)}
                  controls={false}
                  bordered={false}
                  onChange={(value) => {
                    handlerCreateIncomes({ value, record, item });
                  }}
                />
              )
            },
            {
              title: 'На сборке',
              dataIndex: `on_build_goods_${item.id}`,
              width: 50
            },
            {
              title: 'В пути',
              dataIndex: `on_road_goods_${item.id}`,
              width: 50
            }
          ]
        };
      })
    ]);
  }, [warehouses, goods, inputsValues]);

  return (
    <>
      <SelectColumns
        columnsAll={columns}
        columnsSelect={columnsSelect}
        setColumnsSelect={setColumnsSelect}
      />
      <Spin spinning={loading}>
        <Table
          size="small"
          bordered
          components={{
            header: {
              cell: ResizableTitle
            }
          }}
          scroll={{ x: 0 }}
          sticky={{ offsetHeader: 140 }}
          pagination={pagination}
          onChange={getOrders}
          columns={resize({
            columns: columnsSelect,
            setColumns: setColumnsSelect
          })}
          dataSource={dataSource}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default Stats;
