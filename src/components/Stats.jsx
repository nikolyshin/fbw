import {
  fetchWarehouses,
  fetchWarehousesCreateIncomesBackup,
  fetchWarehousesOrders,
  fetchWarehousesOrdersFilters
} from '../api';
import React, { useEffect, useRef, useState } from 'react';
import { Spin, Table, InputNumber } from 'antd';
import moment from 'moment';
import { resize } from './resize';
import ResizableTitle from './ResizableTitle';
import { dateFormat, names } from './helpers';
import SelectColumns from './SelectColumns';
import ModalError from './ModalError';

const Stats = ({
  currentWbKey,
  date,
  surcharge,
  planIncomes,
  changeIncome,
  setChangeIncome
}) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [columns, setColumns] = useState([]);
  const [inputsValues, setInputsValues] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [columnsSelect, setColumnsSelect] = useState([]);
  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState({});
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

  const getOrders = async (pagination, filters) => {
    try {
      setLoading(true);
      const res = await fetchWarehousesOrders({
        wb_keys: currentWbKey,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        plan_period: planIncomes,
        limit: pagination?.pageSize,
        date_from: moment(date[0]).format(dateFormat),
        date_to: moment(date[1]).format(dateFormat),

        // filters
        category__in: filters?.category,
        wb_key__in: filters?.wb_key,
        brand__in: filters?.brand,
        subject__in: filters?.subject,
        article_1c__in: filters?.article_1c,
        article_wb__in: filters?.article_wb,
        barcode__in: filters?.barcode
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

  const getwarehousesFilters = async () => {
    try {
      setLoading(true);
      const res = await fetchWarehousesOrdersFilters({
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
  }, [currentWbKey, date, planIncomes, surcharge]);

  useEffect(() => {
    getwarehousesFilters();
  }, [currentWbKey]);

  useEffect(() => {
    if (changeIncome) {
      let items = JSON.parse(localStorage.getItem('incomes')) || [];
      setInputsValues(items);
      setChangeIncome(false);
    }
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
          obj[`stock_color_${el.warehouse_id}`] = el.stock_color;
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
        title: names.wb_key,
        dataIndex: 'wb_key',
        fixed: 'left',
        width: 150,
        filterSearch: true,
        filters: filters?.wb_key_names?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.category,
        dataIndex: 'category',
        fixed: 'left',
        width: 150,
        filterSearch: true,
        filters: filters?.categories?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.subject,
        dataIndex: 'subject',
        fixed: 'left',
        width: 150,
        filterSearch: true,
        filters: filters?.subjects?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.brand,
        dataIndex: 'brand',
        filterSearch: true,
        filters: filters?.brands?.map((item) => {
          return { text: item, value: item };
        }),
        width: 150
      },
      {
        title: names.article_1c,
        dataIndex: 'article_1c',
        filterSearch: true,
        filters: filters?.articles_1c?.map((item) => {
          return { text: item, value: item };
        }),
        width: 200
      },
      {
        title: names.barcode,
        filterSearch: true,
        filters: filters?.barcodes?.map((item) => {
          return { text: item, value: item };
        }),
        dataIndex: 'barcode',
        width: 150
      },

      {
        title: names.article_wb,
        dataIndex: 'article_wb',
        filterSearch: true,
        filters: filters?.articles_wb?.map((item) => {
          return { text: item, value: item };
        }),
        width: 150,
        render(text, record) {
          return {
            children: (
              <a href={record.link} target="_blank" rel="noreferrer">
                {text}
              </a>
            )
          };
        }
      },
      {
        title: names.stock,
        dataIndex: 'stock',
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
              width: 50,
              render(text, record) {
                return {
                  props: {
                    style: { background: record[`stock_color_${item.id}`] }
                  },
                  children: <div>{text}</div>
                };
              }
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
                  controls={false}
                  min={0}
                  value={
                    inputsValues.filter(
                      (inputValue) =>
                        inputValue.item_id === record.id &&
                        inputValue.warehouse_id === item.id
                    )[0]?.quantity
                  }
                  ref={(element) => inputRef.current.push(element)}
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
  }, [filters, warehouses, goods, inputsValues]);

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
      <ModalError
        show={!!error}
        setShow={setError}
        title="Произошла ошибка"
        subtitle={error}
      />
    </>
  );
};

export default Stats;
