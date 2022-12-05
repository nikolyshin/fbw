import {
  fetchOrdersFilters,
  fetchWarehouses,
  fetchWarehousesCreateIncomesBackup,
  fetchWarehousesOrders
} from '../api';
import React, { useEffect, useRef, useState } from 'react';
import { Table, InputNumber } from 'antd';
import moment from 'moment';
import { resize } from './resize';
import ResizableTitle from './ResizableTitle';
import { dateFormat, names } from './helpers';
import SelectColumns from './SelectColumns';
import ModalError from './ModalError';
import FilterRange from './FilterRange';

const nameOfStoreColumnsOrders = 'statsColumnsOrders';
const nameOfStoreColumnsWhs = 'statsColumnsWhs';
const paginationSave = 'statsPagination';
const filtersSave = 'statsFilters';

const Stats = ({
  currentWbKey,
  date,
  surcharge,
  planIncomes,
  changeIncome,
  setChangeIncome
}) => {
  const [currentFilters, setCurrentFilters] = useState(
    JSON.parse(localStorage.getItem(filtersSave)) || []
  );
  const [currentOrdering, setCurrentOrdering] = useState(null);
  const [pagination, setPagination] = useState(
    JSON.parse(localStorage.getItem(paginationSave)) || {
      current: 1,
      pageSize: 10,
      showSizeChanger: true
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [columnsOrders, setColumnsOrders] = useState([]);
  const [columnsWh, setColumnsWh] = useState([]);
  const [inputsValues, setInputsValues] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [columnsSelectOrders, setColumnsSelectOrders] = useState(
    []
    // JSON.parse(localStorage.getItem(nameOfStoreColumnsOrders)) || []
  );
  const [columnsSelectWh, setColumnsSelectWh] = useState(
    []
    // JSON.parse(localStorage.getItem(nameOfStoreColumnsWhs)) || []
  );
  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState(null);
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

  const setCurrentData = async (pagination, filters, sorter) => {
    let ordering;
    if (!!sorter) {
      ordering = sorter.order
        ? `${sorter.order === 'ascend' ? '' : '-'}${sorter.field}`
        : null;
    }
    setCurrentOrdering(ordering);
    setCurrentFilters(filters);
    setPagination(pagination);
    localStorage.setItem(filtersSave, JSON.stringify(filters));
    localStorage.setItem(paginationSave, JSON.stringify(pagination));
  };

  const getOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchWarehousesOrders({
        wb_keys: currentWbKey,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        plan_period: planIncomes,
        limit: pagination?.pageSize,
        date_from: moment(date[0]).format(dateFormat),
        date_to: moment(date[1]).format(dateFormat),

        //sort
        ordering: currentOrdering,

        // filters
        category__in: currentFilters?.category,
        wb_key__in: currentFilters?.wb_key,
        brand__in: currentFilters?.brand,
        subject__in: currentFilters?.subject,
        article_1c__in: currentFilters?.article_1c,
        article_wb__in: currentFilters?.article_wb,
        barcode__in: currentFilters?.barcode,
        stock_fbo__range: currentFilters?.stock_fbo,
        stock_fbs__range: currentFilters?.stock_fbs
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

  const getFilters = async () => {
    try {
      setLoading(true);
      const res = await fetchOrdersFilters({
        wb_keys: currentWbKey,
        date_from: moment(date[0]).format(dateFormat),
        date_to: moment(date[1]).format(dateFormat)
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

  const getWarehouses = async () => {
    try {
      setLoading(true);
      const res = await fetchWarehouses({
        date_from: moment(date[0]).format(dateFormat),
        date_to: moment(date[1]).format(dateFormat),
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
  }, [
    currentWbKey,
    date,
    planIncomes,
    surcharge,
    currentFilters,
    currentOrdering,
    pagination.current,
    pagination.pageSize
  ]);

  useEffect(() => {
    getFilters();
  }, [currentWbKey, date]);

  useEffect(() => {
    if (changeIncome) {
      let items = JSON.parse(localStorage.getItem('incomes')) || [];
      setInputsValues(items);
      setChangeIncome(false);
    }
  }, [changeIncome]);

  useEffect(() => {
    getWarehouses();
  }, [date]);

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
    setColumnsOrders([
      {
        title: names.wb_key,
        dataIndex: 'wb_key',
        fixed: 'left',
        width: 150,
        sorter: true,
        filterSearch: true,
        filteredValue: currentFilters.wb_key,
        filters: filters?.wb_key_names?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.category,
        dataIndex: 'category',
        fixed: 'left',
        sorter: true,
        width: 150,
        filterSearch: true,
        filteredValue: currentFilters.category,
        filters: filters?.categories?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.subject,
        dataIndex: 'subject',
        fixed: 'left',
        sorter: true,
        width: 150,
        filterSearch: true,
        filteredValue: currentFilters.subject,
        filters: filters?.subjects?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.brand,
        dataIndex: 'brand',
        sorter: true,
        filterSearch: true,
        filteredValue: currentFilters.brand,
        filters: filters?.brands?.map((item) => {
          return { text: item, value: item };
        }),
        width: 150
      },
      {
        title: names.article_1c,
        dataIndex: 'article_1c',
        sorter: true,
        filterSearch: true,
        filteredValue: currentFilters.article_1c,
        filters: filters?.articles_1c?.map((item) => {
          return { text: item, value: item };
        }),
        width: 200
      },
      {
        title: names.barcode,
        filterSearch: true,
        sorter: true,
        filteredValue: currentFilters.barcode,
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
        sorter: true,
        filteredValue: currentFilters.article_wb,
        filters: filters?.articles_wb?.map((item) => {
          return { text: item, value: item };
        }),
        width: 150,
        render: (text) => (
          <a
            href={`https://www.wildberries.ru/catalog/${text}/detail.aspx`}
            target="_blank"
            rel="noreferrer"
          >
            {text}
          </a>
        )
      },
      {
        title: names.stock_fbo,
        dataIndex: 'stock_fbo',
        filteredValue: currentFilters.stock_fbo,
        filterDropdown: (props) => (
          <FilterRange
            {...props}
            min={filters?.stock_fbo?.min_value}
            max={filters?.stock_fbo?.max_value}
          />
        ),
        sorter: true,
        width: 100
      },
      {
        title: names.stock_fbs,
        dataIndex: 'stock_fbs',
        filteredValue: currentFilters.stock_fbs,
        filterDropdown: (props) => (
          <FilterRange
            {...props}
            min={filters?.stock_fbs?.min_value}
            max={filters?.stock_fbs?.max_value}
          />
        ),
        sorter: true,
        width: 100
      },
      {
        title: names.orders,
        dataIndex: 'orders',
        sorter: true,
        width: 150
      }
    ]);
  }, [filters, goods, currentFilters]);

  useEffect(() => {
    setColumnsWh([
      ...warehouses.map((item) => {
        return {
          title: item.name,
          dataIndex: `warehouse_${item.id}`,
          children: [
            {
              title: 'Кол-во',
              dataIndex: `count_${item.id}`,
              width: 50,
              onCell: (record) => ({
                style: {
                  background: record[`stock_color_${item.id}`],
                  borderLeft: '4px solid'
                }
              })
            },
            {
              title: 'Прод',
              dataIndex: `sales_${item.id}`,
              width: 60
            },
            {
              title: 'План',
              dataIndex: `plane_${item.id}`,
              width: 60,
              onCell: () => ({
                style: { background: '#fff3cc' }
              })
            },
            {
              title: 'Факт',
              dataIndex: `fact_${item.id}`,
              key: `fact_${item.id}`,
              width: 70,
              onCell: () => ({
                style: { background: '#d9ead3' }
              }),
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
  }, [warehouses, inputsValues]);

  useEffect(() => {
    setColumnsSelectOrders(columnsOrders);
  }, [columnsOrders]);

  useEffect(() => {
    setColumnsSelectWh(columnsWh);
  }, [columnsWh]);

  return (
    <>
      <SelectColumns
        loading={loading}
        type={nameOfStoreColumnsOrders}
        columnsAll={columnsOrders}
        columnsSelect={columnsSelectOrders}
        setColumnsSelect={setColumnsSelectOrders}
      />
      <SelectColumns
        loading={loading}
        type={nameOfStoreColumnsWhs}
        columnsAll={columnsWh}
        columnsSelect={columnsSelectWh}
        setColumnsSelect={setColumnsSelectWh}
      />
      <Table
        loading={loading}
        size="small"
        bordered
        // components={{
        //   header: {
        //     cell: ResizableTitle
        //   }
        // }}
        scroll={{ x: 0 }}
        sticky={{ offsetHeader: 140 }}
        pagination={pagination}
        onChange={setCurrentData}
        columns={[...columnsSelectOrders, ...columnsSelectWh]}
        // columns={resize({
        //   columns: columnsSelectOrders,
        //   setColumns: setColumnsSelectOrders
        // })}
        dataSource={dataSource}
      />
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
